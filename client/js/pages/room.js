var inherits = require('inherits');

var h = require('virtual-dom/h');

var on = require('../util/on');

var Page = require('../base/components/page');

var Notifications = require('../notifications');

var Chat = require('./room/chat');

var UsersList = require('./room/users');

var PlayerControls = require('./room/player-controls');


function RoomPage(app) {
  Page.call(this, 'room', app);

  this.notifications = new Notifications(app);

  this.player = app.player;

  this.socket = app.socket;


  this.chat = new Chat(this);

  this.users = new UsersList(this);

  this.playerControls = new PlayerControls(this);


  on(this.chat, {
    'start-typing': this.startTyping,
    'stop-typing': this.stopTyping,
    'submit': this.sendMessage
  }, this);


  this.socket.on('message', this.channelMessage.bind(this));

  this.socket.on('user-joined', this.channelJoin.bind(this));

  this.socket.on('user-left', this.channelLeave.bind(this));


  // user typing information
  this.socket.on('user-typing', function(data) {

    this.chat.addTyping(data.user);
  }.bind(this));

  this.socket.on('user-stopped-typing', function (data) {

    this.chat.removeTyping(data.user);
  }.bind(this));


  app.on('connected', this.connected.bind(this));

  app.on('disconnect', this.disconnected.bind(this));
}

inherits(RoomPage, Page);

module.exports = RoomPage;


RoomPage.prototype.connected = function(data, reconnect) {

  if (reconnect) {
    this.log('connection restored');
  } else {
    this.log('welcome to silent disco / ' + data.roomId);
  }

  this.users.updateList(data.activeUsers);

  this.printParticipants(data);
};

RoomPage.prototype.disconnected = function() {
  this.log('disconnected from server, trying to reconnect ...');
};

RoomPage.prototype.channelMessage = function(data) {

  var text = data.message;

  this.notifications.add({
    title: data.user.name + ' wrote',
    message: text
  });

  this.addAction({
    type: 'message',
    user: data.user,
    text: text
  });

  this.checkSong(text.trim());
};

RoomPage.prototype.channelJoin = function(data) {

  this.notifications.add({
    title: data.user.name + ' joined',
  });

  this.users.add(data.user);

  this.addAction({
    type: 'status',
    user: data.user,
    text: 'joined'
  });

  this.printParticipants(data);
};

RoomPage.prototype.channelLeave = function(data) {

  this.notifications.add({
    title: data.user.name + ' left'
  });

  this.users.remove(data.user);

  this.addAction({
    type: 'status',
    user: data.user,
    text: 'left'
  });

  this.printParticipants(data);
};

RoomPage.prototype.sendMessage = function(text) {
  this.socket.emit('message', text);

  this.addAction({
    user: this.app.user,
    text: text,
    type: 'message'
  });

  this.checkSong(text.trim());
};

RoomPage.prototype.checkSong = async function(text) {

  var player = this.player,
      song = await player.fetchInfo(text);

  if (song) {

    this.addAction({
      user: this.user,
      type: 'song',
      song: song
    });
  }
};

RoomPage.prototype.play = async function(song) {
  return this.player.play(song);
};

RoomPage.prototype.stop = function() {
  this.player.stop();
};

RoomPage.prototype.startTyping = function() {
  this.socket.emit('typing');
};

RoomPage.prototype.stopTyping = function() {
  this.socket.emit('stopped-typing');
};

RoomPage.prototype.addAction = function(action) {
  return this.chat.addAction(action);
};

RoomPage.prototype.log = function(text) {
  return this.addAction({
    type: 'log',
    text: text
  });
};

RoomPage.prototype.printParticipants = function(data) {
  var text;

  if (data.activeUsers.length === 1) {
    text = 'you are the only one in this room';
  } else {
    text = 'there are ' + data.activeUsers.length + ' users in this room';
  }

  this.log(text);
};

RoomPage.prototype.toggleNotifications = function() {
  this.notifications.toggle();

  this.changed();
};

RoomPage.prototype.toNode = function() {

  var notificationsActive = this.notifications.isActive() ? '.active' : '';

  return this.renderPage([
    h('.page-menu', [
      h('a.entry.icon-bell' + notificationsActive, {
        href: '#',
        title: 'toggle desktop notifications',
        'ev-click': this.toggleNotifications.bind(this)
      })
    ]),
    this.playerControls.render(),
    this.chat.render(),
    this.users.render()
  ]);
};
