require("babelify/polyfill");


var domReady = require('domready');
var raf = require('raf');

var Delegator = require('dom-delegator');

var Config = require('./config');

var App = require('./app');

var io = require('socket.io-client');

// init dom-delegator
Delegator();


/**
 * Creates a new socket.io instance.
 *
 * @return {IoSocket}
 */
function createSocket() {
  var split = window.location.host.split(':');

  // fix websocket connection port on open shift
  if (split[0].indexOf('rhcloud.com') !== -1) {
    split[1] = 8443;
  }

  return io(split.join(':'));
}


domReady(function() {
  var config = new Config('__disco_');

  config.set('soundcloudClientId', 'e158f9f9cb11f3e88ab951b19ac39544');

  var socket = createSocket();

  var app = new App('body', config, socket);

  app.on('changed', function(component) {
    raf(function() {
      component.update();
    });
  });

  app.run();
});