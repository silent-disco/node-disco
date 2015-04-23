var redis = require('redis');

module.exports.createClient = function() {
  var client = redis.createClient.apply(redis, arguments);

  return require('co-redis')(client);
};

