var deserialize = require('./util/deserialize'),
    serialize = require('./util/serialize');


/**
 * A members resource representation
 *
 * @param {DbClient} client
 * @param {String} roomId
 */
function Members(client, roomId) {

  // HASH{id:STRING}
  this.key = `room:${roomId}:members`;

  this.fetchMembers = function() {
    return client.hgetall(this.key).then(deserialize('hash'));
  };

  this.add = function(member) {
    return client.hset(this.key, member.id, serialize(member));
  };

  this.remove = function(member) {
    var id = member.id || member;

    return client.hdel(this.key, id);
  };

  this.count = function() {
    return client.hlen(this.key);
  };

  this.getAll = function() {
    return this.fetchMembers();
  };
}


module.exports = Members;
