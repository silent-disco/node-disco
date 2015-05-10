var domReady = require('domready');
var raf = require('raf');

var Delegator = require('dom-delegator');

var Config = require('./config');

var App = require('./app');


// init dom-delegator
Delegator();


domReady(function() {
  var config = new Config('__disco_');

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