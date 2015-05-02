var Room = require('./room');


/**
 * A rooms resource
 *
 * @param {DbClient} client
 */
function RoomsModel(client) {

  /**
   * Get a room, skeleton that may or may not yet
   * exist in the database.
   *
   * @param {String} roomId
   *
   * @yield {Room}
   */
  this.get = function*(roomId, create) {

    var room = new Room(client, roomId);

    if (create) {
      yield room.create();
    }

    return room;
  };

  this.remove = function*(roomId) {
    var room = yield this.get(roomId);

    yield room.remove();
  };

  // SET{STRING} rooms = 1 2 3 4 5 6
  this.getAll = function*() {
    return yield client.smembers('rooms');
  };


  /**
   * Clear all rooms. Dangerous stuff.
   */
  this.clear = function*() {

    var roomIds = yield this.getAll();

    var self = this;

    yield roomIds.map(function*(id) {
      return yield self.remove(id);
    });
  };
}


module.exports = RoomsModel;