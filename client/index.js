var domReady = require('domready');

var Delegator = require('dom-delegator');

var Config = require('./js/config');

var App = require('./js/app');


// init dom-delegator
Delegator();


domReady(function() {
  var config = new Config('__disco_');

  var app = new App(config);

  app.run();
});
