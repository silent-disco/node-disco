var io = require('socket.io-client');

var inherits = require('inherits');

var h = require('virtual-dom/h');

var Root = require('./base/components/root');

var LoginPage = require('./pages/login'),
    RoomPage = require('./pages/room');

var SOCKET_DISCONNECTED = 'disconnected',
    SOCKET_RECONNECTING = 'reconnecting',
    SOCKET_CONNECTED = 'connected';

var Player = require('./player');


function App($parent, config) {

  Root.call(this, $parent);

  this.player = new Player(config);

  // environment init
  this.config = config;

  this.roomName = roomFromUrl();
  this.socket = createSocket();

  // disconnected
  // connected
  // reconnecting
  this.socketState = SOCKET_DISCONNECTED;

  // pages
  this.loginPage = new LoginPage(this);
  this.roomPage = new RoomPage(this);

  this.activePage = null;

  window.addEventListener('popstate', this.stateChanged.bind(this));

  this.socket.on('joined', function joined(data) {
    var reconnect = this.socketState === SOCKET_RECONNECTING;

    this.user = data.user;

    this.emit('connected', data, reconnect);

    this.socketState = SOCKET_CONNECTED;
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

  this.socket.on('disconnect', function() {
    this.emit('disconnect');

    this.socketState = SOCKET_RECONNECTING;
  }.bind(this));

  this.socket.on('reconnect', function() {
    if (this.user) {
      this.joinRoom(this.user);
    }
  }.bind(this));
}

inherits(App, Root);

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

  this.checkSong(text.trim());
};

App.prototype.checkSong = async function(text) {

  var player = this.player,
      song = await player.fetchInfo(text);

  if (song) {

    this.roomPage.addAction({
      user: this.user,
      type: 'song',
      song: song
    });
  }
};

App.prototype.play = async function(song) {
  return this.player.play(song);
};


App.prototype.joinRoom = function(user) {

  if (user) {
    this.user = user;
  }

  if (!this.user) {
    return;
  }

  this.socket.emit('join', this.roomName, this.user.name);

  this.activatePage(this.roomPage);
};

App.prototype.activatePage = function(page) {
  this.emit('page.activate', page);

  this.activePage = page;

  this.changed();
};

App.prototype.run = function() {
  this.activatePage(this.loginPage);
};

App.prototype.render = function() {
  return h('.disco', [
    this.loginPage.render(),
    this.roomPage.render()
  ]);
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
