var forEach = require('foreach'),
    map = require('lodash/collection/map');

var uuid = require('uuid');

var Promise = require('bluebird');


var sanitize = function(str) {
  return str; //str.replace(/[^A-z0-9_-]+/g, '');
};

function now() {
  return new Date().getTime();
}

function makeCollection(users) {
    return map(users, function(user) {
        return { name: user.name, id: user.id };
    });
}

/**
 * A rooms end point
 *
 * @param {Emitter} events
 * @param {RoomsModel} rooms
 * @param {Koa} app
 */
function RoomsEndpoint(events, rooms, app) {

  function emit(session, message, data) {
    session.emit(message, data);
  }

  function broadcast(session, message, data) {
    session.broadcast.to(session.roomId).emit(message, data);
  }

  function hasJoined(session) {
    return session.roomId;
  }

  function isJoin(session) {
    return session.event === 'join';
  }

  function notifyError(session, e) {

    console.log('[error] %s', e.message);

    session.emit('error', {
      message: e.message
    });
  }

  function noRoom(session) {
    notifyError(session, { message: 'no room joined' });
  }

  /**
   * Leave the room stored in the context.
   *
   * @param {Session} session
   *
   * @yield {Room}
   */
  function* leave(session, quit) {

    try {
      var user = session.user,
          roomId = session.roomId;

      session.socket.leave(roomId);

      var room = yield rooms.get(roomId);

      yield room.members.remove(user);

      var activeUsers = yield room.members.fetchMembers();

      if (!quit) {
        broadcast(session, 'user-left', {
          user: user,
          activeUsers: makeCollection(activeUsers)
        });
      }
    } catch (e) {
      notifyError(session, e);
    }
  }


  // connect + disconnect middleware
  app.io.use(function*(next) {

    // on connect
    console.log('[rooms] connection established');

    yield* next;

    // on disconnect
    if (hasJoined(this)) {
      yield leave(this);
    }

    console.log('[rooms] connection closed');
  });


  // ensure the user is connected, if he communicates with us
  app.io.route('*', function*(next) {

    if (!hasJoined(this) && !isJoin(this)) {
      return noRoom(this);
    }

    yield next;
  });


  // join a room
  app.io.route('join', function*(next, roomId, userName) {

    if (hasJoined(this)) {
      yield leave(this);
    }

    console.log('[rooms#%s] user %s joins room', roomId, userName);

    roomId = sanitize(roomId);
    userName = sanitize(userName);


    try {
      // retrieve room, creating it on the fly
      // if it does not exist
      var room = yield rooms.get(roomId, true);

      // we store the room + user in the socket session
      var user = {
        id: uuid.v4(),
        name: userName
      };

      yield room.members.add(user);

      var activeUsers = yield room.members.fetchMembers();

      this.socket.join(roomId);

      this.user = user;
      this.roomId = roomId;

      // send local joined event back
      emit(this, 'joined', {
        activeUsers: makeCollection(activeUsers),
        user: user,
        roomId: roomId
      });

      // echo that a person has connected
      broadcast(this, 'user-joined', {
        user: user,
        activeUsers: makeCollection(activeUsers)
      });

    } catch (e) {
      notifyError(this, e);
    }
  });


  // send a message
  app.io.route('message', function*(next, message) {

    console.log('[rooms#%s] new message by %s', this.roomId, this.user.name);

    broadcast(this, 'message', {
      user: this.user,
      message: message
    });
  });


  // indicate typing
  app.io.route('typing', function*() {

    console.log('[rooms#%s] %s is typing', this.roomId, this.user.name);

    broadcast(this, 'user-typing', {
      user: this.user
    });
  });


  // indicate stop typing
  app.io.route('stopped-typing', function*() {

    console.log('[rooms#%s] %s stopped typing', this.roomId, this.user.name);

    broadcast(this, 'user-stopped-typing', {
      user: this.user
    });
  });


  app.io.route('start-song', function*(song) {

    var roomId = this.roomId;

    console.log('[rooms#%s] %s starts song', roomId, this.user.name);

    try {
      // get + initialize room
      var room = yield rooms.get(roomId, true);

      var candidateSong = yield room.playlist.get(song);

      if (!candidateSong) {
        return;
      }


      var info = yield room.fetchInfo();

      var startTime = now();

      var updatedInfo = assign(info || {}, {
        currentSong: candidateSong.id,
        startTime: startTime
      });

      yield room.updateInfo(updatedInfo);

      broadcast(this, 'song-started', {
        song: candidateSong,
        startTime: startTime,
        currentTime: now()
      });
    } catch (e) {
      return notifyError(this, e);
    }
  });


  app.io.route('add-song', function*(song) {

    var roomId = this.roomId;

    console.log('[rooms#%s] %s adds song', roomId, this.user.name);

    try {
      // retrieve room, creating it on the fly
      // if it does not exist
      var room = yield rooms.get(roomId, true);

      var addedSong = assign({}, song, {
        id: uuid.v4()
      });

      yield room.playlist.add(addedSong);

      broadcast(this, 'song-added', {
        song: addedSong
      });
    } catch (e) {
      return notifyError(this, e);
    }
  });


  app.io.route('remove-song', function*(song) {

    var roomId = this.roomId;

    console.log('[rooms#%s] %s removes song', roomId, this.user.name);

    try {
      // retrieve room, don't care if it exists or not
      var room = yield rooms.get(roomId);

      var candidateSong = yield room.playlist.get(song);

      if (!candidateSong) {
        return;
      }

      yield room.playlist.remove(candidateSong);

      broadcast(this, 'song-removed', {
        song: candidateSong
      });
    } catch (e) {
      return notifyError(this, e);
    }
  });


  app.io.route('move-song', function*(song, position, pivot) {

    var roomId = this.roomId;

    console.log('[rooms#%s] %s moves song', roomId, this.user.name);

    try {
      // retrieve room, creating it on the fly
      // if it does not exist
      var room = yield rooms.get(roomId, true);

      var candidateSong = yield room.playlist.get(song),
          pivotSong = yield room.playlist.get(pivot);

      if (!candidateSong || !pivotSong) {
        return;
      }

      yield room.playlist.add(song, position, pivot);

      broadcast(this, 'song-moved', {
        song: candidateSong,
        pivot: pivotSong,
        position: position
      });

    } catch (e) {
      notifyError(this, e);
    }
  });


  events.on('shutdown', function*() {
    var sockets = app.io.sockets;

    console.log('[rooms] closing client connections ...');

    forEach(sockets.connected, function(socket) {
      socket.ondisconnect();
    });

    return Promise.delay(2500);
  });
}


RoomsEndpoint.configure = function(events, rooms, app) {
  return new RoomsEndpoint(events, rooms, app);
};

module.exports = RoomsEndpoint;
