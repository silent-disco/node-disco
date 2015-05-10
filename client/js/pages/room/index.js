var inherits = require('inherits');

var h = require('virtual-dom/h');

var on = require('../../util/on');

var Page = require('../../base/components/page');

var Notifications = require('../../notifications');

var Chat = require('./chat');


function RoomPage(app) {
  Page.call(this, 'room', app);

  this.notifications = new Notifications(app);

  this.chat = new Chat(this);

  this.socket = app.socket;

  on(this.chat, {
    'start-typing': this.startTyping,
    'stop-typing': this.stopTyping,
    'submit': this.sendMessage
  }, this);

  app.on('user-message', function(data) {

    this.notifications.add({
      title: data.user.name + ' wrote',
      message: data.message
    });

    this.addAction({
      user: data.user,
      text: data.message,
      message : true
    });
  }.bind(this));

  app.on('user-joined', function(data) {

    this.notifications.add({
      title: data.user.name + ' joined',
    });

    this.addAction({
      user: data.user,
      text: 'joined'
    });

    this.printParticipants(data);
  }.bind(this));

  app.on('user-left', function(data) {

    this.notifications.add({
      title: data.user.name + ' left'
    });

    this.addAction({
      user: data.user,
      text: 'left'
    });

    this.printParticipants(data);
  }.bind(this));


  // user typing information
  on(this.socket, {
    'user-typing': function(data) {
      this.chat.addTyping(data.user);
    },

    'user-stopped-typing': function (data) {
      this.chat.removeTyping(data.user);
    }
  }, this);


  app.on('connected', function(data, reconnect) {

    if (reconnect) {
      this.log('connection restored');
    } else {
      this.log('welcome to silent disco / ' + data.roomId);
    }

    this.printParticipants(data);
  }.bind(this));


  app.on('disconnect', function() {

    this.log('disconnected from server, trying to reconnect ...');
  }.bind(this));
}

inherits(RoomPage, Page);

module.exports = RoomPage;


RoomPage.prototype.sendMessage = function(text) {
  this.app.sendMessage(text);

  this.addAction({
    user: this.app.user,
    text: text,
    message: true
  });
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
    log: true,
    text: text
  });
};

RoomPage.prototype.printParticipants = function(data) {

  var text;

  if (data.activeUsers === 1) {
    text = 'you are the only one in this room';
  } else {
    text = 'there are ' + data.activeUsers + ' users in this room';
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
      h('a.entry.icon-notifications' + notificationsActive, {
        href: '#',
        title: 'toggle desktop notifications',
        'ev-click': this.toggleNotifications.bind(this)
      })
    ]),
    this.chat.render()
  ]);
};