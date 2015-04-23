/**
 * Serialize an object to its string representation.
 *
 * @param  {Object} obj
 * @return {String}
 */
function serialize(obj) {
  return JSON.stringify(obj);
}

module.exports = serialize;