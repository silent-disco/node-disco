var inherits = require('inherits');

var forEach = require('lodash/collection/forEach');

var h = require('virtual-dom/h');

var Page = require('../base/components/page');

var Player = require('../player');

var Notifications = require('../notifications');

var Chat = require('./room/chat');

var Playlist = require('./room/playlist');

var UsersList = require('./room/users-widget');

function RoomPage(app, socket, config) {
  Page.call(this, 'room', app);

  this.notifications = new Notifications(app);

  this.player = new Player(config);

  this.socket = socket;

  this.playlist = new Playlist(this);

  this.chat = new Chat(this, this.playlist);

  this.users = new UsersList(this);

  this.chat.on('start-typing', this.startTyping.bind(this));
  this.chat.on('stop-typing', this.stopTyping.bind(this));
  this.chat.on('submit', this.sendMessage.bind(this));

  this.player.on('update', this.playerUpdate.bind(this));
  this.player.on('finish', this.nextSong.bind(this));

  this.socket.on('message', this.channelMessage.bind(this));

  this.socket.on('user-joined', this.channelJoin.bind(this));

  this.socket.on('user-left', this.channelLeave.bind(this));

  this.socket.on('joined', function(result) {
    var playlist = this.playlist;

    var status = result.info,
        position;

    forEach(result.playlist, function(song) {
      this.addSong(song, false);
    }, this);

    if (status && status.playState === 'playing') {
      position = result.time - status.time + status.position;

      this.playSong(playlist.get(status.song), position, false);
    }
  }.bind(this));

  this.socket.on('song-started', function(result) {
    var song = result.song,
        position = result.position;

    this.playSong(this.playlist.get(song) || song, position, false);
  }.bind(this));

  this.socket.on('song-stopped', function(result) {
    this.stopSong(false);
  }.bind(this));

  this.socket.on('song-added', function(result) {
    this.addSong(result.song, false);
  }.bind(this));

  this.socket.on('song-removed', function(result) {
    console.log('REMOVE SONG YO! ', result);
  }.bind(this));


  // user typing information
  this.socket.on('user-typing', function(data) {

    this.chat.addTyping(data.user);
  }.bind(this));

  this.socket.on('user-stopped-typing', function (data) {

    this.chat.removeTyping(data.user);
  }.bind(this));


  app.on('connected', this.connected.bind(this));

  app.on('disconnect', this.disconnected.bind(this));
}

inherits(RoomPage, Page);

module.exports = RoomPage;


RoomPage.prototype.connected = function(data, reconnect) {

  if (reconnect) {
    this.log('connection restored');
  } else {
    this.log('welcome to silent disco / ' + data.roomId);
  }

  this.users.updateList(data.activeUsers);

  this.printParticipants(data);
};

RoomPage.prototype.disconnected = function() {
  this.log('disconnected from server, trying to reconnect ...');
};

RoomPage.prototype.channelMessage = function(data) {

  var text = data.message;

  this.notifications.add({
    title: data.user.name + ' wrote',
    message: text
  });

  this.addAction({
    type: 'message',
    user: data.user,
    text: text
  });

  this.checkSong(text.trim());
};

RoomPage.prototype.channelJoin = function(data) {

  this.notifications.add({
    title: data.user.name + ' joined',
  });

  this.users.add(data.user);

  this.addAction({
    type: 'status',
    user: data.user,
    text: 'joined'
  });

  this.printParticipants(data);
};

RoomPage.prototype.channelLeave = function(data) {

  this.notifications.add({
    title: data.user.name + ' left'
  });

  this.users.remove(data.user);

  this.addAction({
    type: 'status',
    user: data.user,
    text: 'left'
  });

  this.printParticipants(data);
};

RoomPage.prototype.sendMessage = function(text) {
  this.socket.emit('message', text);

  this.addAction({
    user: this.app.user,
    text: text,
    type: 'message'
  });

  this.checkSong(text.trim());
};

RoomPage.prototype.startTyping = function() {
  this.socket.emit('typing');
};

RoomPage.prototype.stopTyping = function() {
  this.socket.emit('stopped-typing');
};

RoomPage.prototype.addAction = function(action) {
  return this.chat.addAction(action);
};

RoomPage.prototype.log = function(text) {
  return this.addAction({
    type: 'log',
    text: text
  });
};

RoomPage.prototype.printParticipants = function(data) {
  var text;

  if (data.activeUsers.length === 1) {
    text = 'you are the only one in this room';
  } else {
    text = 'there are ' + data.activeUsers.length + ' users in this room';
  }

  this.log(text);
};

RoomPage.prototype.toggleNotifications = function() {
  this.notifications.toggle();

  this.changed();
};

RoomPage.prototype.toggleMuted = function() {
  this.player.toggleMuted();

  this.changed();
};

RoomPage.prototype.playerUpdate = function(state) {
  this.playing = state;

  this.playlist.playerUpdate(state);

  this.chat.playerUpdate(state);
};

RoomPage.prototype.getPlaying = function() {
  return this.playing;
};

RoomPage.prototype.checkSong = async function(text) {

  var song = await this.player.fetchInfo(text);

  if (song) {

    this.addAction({
      user: this.user,
      type: 'song',
      song: this.playlist.get(song) || song
    });
  }
};

RoomPage.prototype.addSong = function(song, emit) {

  var playlist = this.playlist;

  var playlistSong = playlist.get(song);

  var playing = this.getPlaying();

  if (!playlistSong) {

    if (emit !== false) {
      this.socket.emit('add-song', song);
    }

    playlist.add(song);

    if (emit !== false && playing.song === song) {
      this.socket.emit('start-song', song.uri, playing.position);
    }
  }

  return playlistSong || song;
};

/**
 * Play the next after the given song
 */
RoomPage.prototype.nextSong = async function(song) {
  var next = this.playlist.getNext(song);
  return this.playSong(next, 0, false);
};

RoomPage.prototype.playSong = async function(song, position, emit) {

  var playlist = this.playlist;

  var playlistSong = playlist.get(song);

  // emit only if song is in playlist
  if (playlistSong && emit !== false) {
    this.socket.emit('start-song', playlistSong.uri, position);
  }

  song = playlistSong || song;

  if (!isNaN(position)) {
    while (position >= song.duration) {
      position -= song.duration;
      song = this.playlist.getNext(song);
    }
  }

  return this.player.play(song, position);
};

RoomPage.prototype.stopSong = async function(emit) {
  var wasPlaying = await this.player.stop();

  if (wasPlaying && emit !== false) {
    this.socket.emit('stop-song', wasPlaying.song.uri, wasPlaying.position);
  }
};

RoomPage.prototype.toNode = function() {

  var notificationsCls = '.icon-bell' + (this.notifications.isActive() ? '.active' : '');

  var mutedCls = (this.player.isMuted() ? '.icon-mute' : '.icon-sound') + '.active';

  return this.renderPage([
    h('header.room-header', [
      h('.title', 'Silent Disco'),
      h('.page-menu', [
        h('a.entry' + notificationsCls, {
          title: 'toggle desktop notifications',
          'ev-click': this.toggleNotifications.bind(this)
        }),
        h('a.entry' + mutedCls, {
          title: 'toggle sound',
          'ev-click': this.toggleMuted.bind(this)
        })
      ])
    ]),
    h('.container', [
      h('.playlist-widget', [ this.playlist.render()]),
      h('.chat-widget', [ this.chat.render() ]),
      h('.users-widget', [ this.users.render() ])
    ]),
  ]);
};
