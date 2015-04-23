/**
 * Create a deserializers for the given type.
 *
 * Returns a deserialization function that accepts an object
 * and returns the deserialized version of it.
 *
 * To be used together with promises like this:
 *
 * @example
 *
 * somePromise
 *   .then(deserialize('hash'))
 *   .then(function(deserializedHash) {
 *     console.log(deserializedHash);
 *   });
 *
 * @param  {String}   type
 * @return {Function} deserializer fn
 */
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

module.exports = deserialize;