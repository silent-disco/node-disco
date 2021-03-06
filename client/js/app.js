var inherits = require('inherits');

var h = require('virtual-dom/h');

var Root = require('./base/components/root');

var LoginPage = require('./pages/login'),
    RoomPage = require('./pages/room');

var SOCKET_DISCONNECTED = 'disconnected',
    SOCKET_RECONNECTING = 'reconnecting',
    SOCKET_CONNECTED = 'connected';


function App($parent, config, socket) {

  Root.call(this, $parent);

  // environment init
  this.config = config;

  this.socket = socket;

  this.roomName = roomFromUrl();

  // disconnected
  // connected
  // reconnecting
  this.socketState = SOCKET_DISCONNECTED;

  // pages
  this.loginPage = new LoginPage(this);
  this.roomPage = new RoomPage(this, socket, config);

  this.activePage = null;

  window.addEventListener('popstate', this.stateChanged.bind(this));

  this.socket.on('joined', function joined(data) {
    var reconnect = this.socketState === SOCKET_RECONNECTING;

    this.user = data.user;

    this.emit('connected', data, reconnect);

    this.socketState = SOCKET_CONNECTED;
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
  var newRoomName = roomFromUrl();

  if (this.user && newRoomName !== this.roomName) {
    this.roomName = newRoomName;

    this.joinRoom();
  }
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
