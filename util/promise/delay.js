
var Promise = require('promise');

module.exports = function(delay) {

  return function(result) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(result);
      }, delay);
    });
  };
};