var deserialize = require('./util/deserialize'),
    serialize = require('./util/serialize');

var Playlist = require('./playlist'),
    Members = require('./members');


/**
 * A room resource
 *
 * @param {DbClient} client
 * @param {String} roomId
 */
function Room(client, roomId) {

  // STRING
  this.key = `room:${roomId}`;

  // SET{id}
  this.roomsKey = `rooms`;


  this.playlist = new Playlist(client, roomId);

  this.members = new Members(client, roomId);

  this.updateInfo = function(info) {
    return client.set(this.key, serialize(info));
  };

  this.fetchInfo = function() {
    return client.get(this.key).then(deserialize('object'));
  };

  this.exists = function() {
    return client.sismember(this.roomsKey, roomId);
  };

  this.create = function*() {
    var exists = yield this.exists();

    if (!exists) {
      yield client.sadd(this.roomsKey, roomId);
    }
  };

  this.remove = function*() {
    return yield [
      client.srem(this.roomsKey, roomId),

      client.del(this.key),
      client.del(this.members.key),
      client.del(this.playlist.key),
      client.del(this.playlist.orderKey)
    ];
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


module.exports = Room;