var Emitter = require('events');

var io = require('socket.io-client');

var inherits = require('inherits');

var LoginPage = require('./pages/login'),
    RoomPage = require('./pages/room');


function App(config) {

  Emitter.call(this);

  // environment init
  this.config = config;

  this.roomName = roomFromUrl();
  this.socket = createSocket();

  // pages
  this.loginPage = new LoginPage(this);
  this.roomPage = new RoomPage(this);

  window.addEventListener('popstate', this.stateChanged.bind(this));

  this.socket.on('joined', function joined(data) {
    var reconnect = !!this.connected;

    this.user = data.user;
    this.connected = true;

    this.emit('connected', data, reconnect);
  }.bind(this));

  this.socket.on('message', function(data) {
    this.emit('user-message', data);
  }.bind(this));

  this.socket.on('user-joined', function(data) {
    this.emit('user-joined', data);
  }.bind(this));

  this.socket.on('user-left', function(data) {
    this.emit('user-left', data);
  }.bind(this));

  this.socket.on('user-typing', function(data) {
    this.emit('user-typing', data);
  }.bind(this));

  this.socket.on('user-stopped-typing', function (data) {
    this.emit('user-stopped-typing', data);
  }.bind(this));

  this.socket.on('disconnect', function() {
    this.emit('disconnect');
  }.bind(this));

  this.socket.on('reconnect', function() {
    if (this.user) {
      this.joinRoom(this.user);
    }
  }.bind(this));
}

inherits(App, Emitter);

module.exports = App;


App.prototype.stateChanged = function() {
  var newRoomId = roomFromUrl();

  if (this.user && newRoomId !== this.roomName) {
    roomId = newRoomId;

    this.joinRoom();
  }
};

App.prototype.sendMessage = function(text) {
  this.socket.emit('message', text);
};

App.prototype.joinRoom = function(user) {

  if (user) {
    this.user = user;
  }

  if (!this.user) {
    return;
  }

  this.socket.emit('join', this.roomName, this.user.name);

  this.roomPage.activate();
};

App.prototype.startTyping = function() {
  this.socket.emit('typing');
};

App.prototype.stopTyping = function() {
  this.socket.emit('stopped-typing');
};

App.prototype.run = function() {
  this.loginPage.activate();
};


/**
 * Extract the room from the users
 *
 * @return {String} extracted room name
 */
function roomFromUrl() {

  var href = window.location.href;

  var roomMatch = /\/(r\/([A-z0-9_-]+))?(\?.*|)$/.exec(href);

  if (!roomMatch) {
    window.history.replaceState(null, null, '/');
  }

  return (roomMatch && roomMatch[2]) || 'lobby';
}

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