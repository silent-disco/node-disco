
var promise = require('./create');

module.exports = function(delay) {

  return function(result) {
    return promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(result);
      }, delay);
    });
  };
};