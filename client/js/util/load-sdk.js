var loadScript = require('load-script');

var Promise = require('promise');

function whenLoaded(url, globalName) {

  return new Promise(function(resolve, reject) {
    loadScript(url, function(err, script) {

      if (err) {
        return reject(err);
      }

      var sdk = global[globalName];

      if (!sdk) {
        return reject(new Error('SDK not bound to <' + globalName + '>'));
      }

      resolve(sdk);
    });
  });
}

function loadSDK(url, globalName) {

  var loadedPromise;

  return function() {

    if (!loadedPromise) {
      loadedPromise = whenLoaded(url, globalName);
    }

    return loadedPromise;
  };

}

module.exports = loadSDK;