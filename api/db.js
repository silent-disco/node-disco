var redis = require('redis');

module.exports.createClient = function() {
  var client = redis.createClient();

  return require('co-redis')(client);
};

