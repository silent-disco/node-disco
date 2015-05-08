var map = require('lodash/collection/map');


function on(element, name, listener, context) {

  if (typeof name === 'object') {

    // shift context arg
    context = listener;

    // iterate over { eventName: fn } hooks
    return map(name, function(fn, key) {
      return on(element, key, fn, context);
    });
  }

  var boundListener = context ? listener.bind(context) : listener;

  return element.on(name, boundListener);
}


module.exports = on;