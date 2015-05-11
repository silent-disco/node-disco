var STORAGE = window.localStorage;


function LocalStorageConfig(prefix) {

  this.get = function(key, defaultValue) {
    return (STORAGE && STORAGE[prefix + key]) || defaultValue;
  };

  this.set = function(key, value) {
    if (STORAGE) {
      STORAGE[prefix + key] = (value === false ? '' : value);
    }
  };
}

module.exports = LocalStorageConfig;