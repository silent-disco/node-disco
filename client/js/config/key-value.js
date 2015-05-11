
function KeyValueConfig(config) {

  this.get = function(key, defaultValue) {
    return config[key] || defaultValue;
  };

  this.set = function(key, value) {
    config[key] = value;
  };

}

module.exports = KeyValueConfig;