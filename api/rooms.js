
function serialize(obj) {
  return JSON.stringify(obj);
}

function deserialize(type) {

  switch (type) {
    case 'object':
      return function(object) {
        return JSON.parse(object);
      };

    case 'array':
      return function(array) {
        return (array || []).map(function(v) {
          return JSON.parse(v);
        });
      };

    case 'hash':
      return function(hash) {
        var result = {};
        var keys = Object.keys(hash || {});

        keys.forEach(function(k) {
          result[k] = JSON.parse(hash[k]);
        });

        return result;
      };

    default:
      return function(value) {
        return value;
      };
  }
}

function Members(client, id) {

  // HASH{id:STRING}
  var MEMBERS_KEY = `room:${id}:members`;


  this.fetchMembers = function() {
    return client.hgetall(MEMBERS_KEY).then(deserialize('hash'));
  };

  this.add = function(member) {
    return client.hset(MEMBERS_KEY, member.id, serialize(member));
  };

  this.remove = function(member) {
    return client.hdel(MEMBERS_KEY, member.id);
  };

  this.getAll = function() {
    return this.fetchMembers();
  };
}

function Songs(client, id) {

  // LIST{id}
  var ORDER_KEY = `room:${id}:playlist:order`;

  // HASH{id:STRING}
  var PLAYLIST_KEY = `room:${id}:playlist`;


  this.fetchOrder = function() {
    return client.lrange(ORDER_KEY, 0, -1);
  };

  this.fetchAll = function() {
    return client.hgetall(PLAYLIST_KEY).then(deserialize('hash'));
  };

  this.add = function*(song, position, pivot) {

    // update details
    yield client.hset(PLAYLIST_KEY, song.id, serialize(song));

    // remove old occurence in list
    yield client.lrem(ORDER_KEY, 0, song.id);

    // add / insert at new position
    if (position && pivot) {
      // LINSERT key BEFORE|AFTER pivot value
      yield client.linsert(ORDER_KEY, position, pivot, song.id);
    } else {
      // RPUSH key value
      yield client.rpush(ORDER_KEY, song.id);
    }
  };

  this.remove = function*(song) {
    // LREM key count value
    yield client.lrem(ORDER_KEY, 0, song.id);

    // HDEL key field
    yield client.hdel(PLAYLIST_KEY, song.id);
  };

  this.getAll = function*() {

    var order = yield this.fetchOrder(),
        songs = yield this.fetchAll();

    return order.map(function(id) {
      return songs[id];
    });
  };
}


function Room(client, id) {

  // STRING
  var ROOM_KEY = `room:${id}`;


  this.songs = new Songs(client, id);

  this.members = new Members(client, id);

  this.fetchInfo = function() {
    return client.get(ROOM_KEY).then(deserialize('object'));
  };

  this.get = function*() {

    var members = yield this.members.getAll(),
        info = yield this.fetchInfo();

    return {
      members: members,
      info: info
    };
  };
}


function Rooms(client) {

  // SET{id}
  var ROOMS_KEY = `rooms`;


  this.get = function*(id) {
    var exists = yield client.sismember(ROOMS_KEY, id);

    if (!exists) {
      yield client.sadd(ROOMS_KEY, id);
    }

    return new Room(client, id);
  };

  this.remove = function*(id) {
    yield client.srem(ROOMS_KEY, id);

    yield client.del(`room:${id}`);
    yield client.del(`room:${id}:playlist`);
    yield client.del(`room:${id}:playlist:order`);
    yield client.del(`room:${id}:members`);
  };

  // SET{STRING} rooms = 1 2 3 4 5 6
  this.getAll = function() {
    return client.smembers(ROOMS_KEY);
  };
}


module.exports = Rooms;