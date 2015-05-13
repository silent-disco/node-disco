require("babelify/polyfill");


var domReady = require('domready');
var raf = require('raf');

var Delegator = require('dom-delegator');

var Config = require('./config');

var App = require('./app');


// init dom-delegator
Delegator();


domReady(function() {
  var config = new Config('__disco_');

  config.set('soundcloudClientId', 'e158f9f9cb11f3e88ab951b19ac39544');

  var app = new App('body', config);

  app.run();

  function redraw() {
    if (app.dirty) {
      app.update();
    }

    raf(redraw);
  }

  raf(redraw);
});