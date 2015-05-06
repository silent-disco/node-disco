var $ = require('jquery');

var Delegator = require('dom-delegator');

var Config = require('./config'),
    Notifications = require('./notifications');


var App = require('./js/app');


// init dom-delegator
Delegator();


$(function() {

  var config = new Config('__disco_');

  var notifications = new Notifications(config).bindTo($('.room-page .toggle-notifications'));

  var app = new App(config);

  app.run();
});
