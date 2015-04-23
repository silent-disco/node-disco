var deserialize = require('./util/deserialize'),
    serialize = require('./util/serialize');


/**
 * A playlist resource
 *
 * @param {DbClient} client
 * @param {String} roomId
 */
function Playlist(client, roomId) {

  // LIST{id}
  this.orderKey = `room:${roomId}:playlist:order`;

  // HASH{id:STRING}
  this.key = `room:${roomId}:playlist`;


  this.fetchOrder = function() {
    return client.lrange(this.orderKey, 0, -1);
  };

  this.fetchAll = function() {
    return client.hgetall(this.key).then(deserialize('hash'));
  };

  this.add = function*(song, position, pivot) {

    // ensure we use an {id} as the pivot element
    var pivotId = (pivot && pivot.id) || pivot;

    // update details
    yield client.hset(this.key, song.id, serialize(song));

    // remove old occurence in list
    yield client.lrem(this.orderKey, 0, song.id);

    // add / insert at new position
    if (position && pivot) {
      // LINSERT key BEFORE|AFTER pivot value
      yield client.linsert(this.orderKey, position, pivotId, song.id);
    } else {
      // RPUSH key value
      yield client.rpush(this.orderKey, song.id);
    }
  };

  this.remove = function*(song) {

    var id = song.id || song;

    // LREM key count value
    yield client.lrem(this.orderKey, 0, id);

    // HDEL key field
    yield client.hdel(this.key, id);
  };

  /**
   * Get song by id or object
   *
   * @param  {Object|String} song
   * @return {Promise<Song>}
   */
  this.get = function(song) {

    var id = song.id || song;

    return client.hget(this.key, id).then(deserialize('object'));
  };

  this.getAll = function*() {

    var order = yield this.fetchOrder(),
        songs = yield this.fetchAll();

    return order.map(function(id) {
      return songs[id];
    });
  };
}


module.exports = Playlist;