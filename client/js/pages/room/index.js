var inherits = require('inherits');

var h = require('virtual-dom/h');

var Page = require('../../base/page');

var Notifications = require('../../notifications');

var Chat = require('./chat');

function RoomPage(app) {
  Page.call(this, 'room', app);

  var notifications = this.notifications = new Notifications(app);

  var chat = this.chat = new Chat(this);

  chat.on('start-typing', app.startTyping.bind(app));
  chat.on('stop-typing', app.stopTyping.bind(app));

  chat.on('submit', function(text) {
    app.sendMessage(text);

    this.addAction({
      user: app.user,
      text: text,
      message: true
    });
  }.bind(this));

  app.on('user-message', function(data) {

    notifications.add({
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

    notifications.add({
      title: data.user.name + ' joined',
    });

    this.addAction({
      user: data.user,
      text: 'joined'
    });

    this.printParticipants(data);
  }.bind(this));

  app.on('user-left', function(data) {

    notifications.add({
      title: data.user.name + ' left'
    });

    this.addAction({
      user: data.user,
      text: 'left'
    });

    this.printParticipants(data);
  }.bind(this));

  app.on('user-typing', function(data) {
    this.chat.addTyping(data.user);
  }.bind(this));

  app.on('user-stopped-typing', function(data) {
    console.log('user stopped typing', data);

    this.chat.removeTyping(data.user);
  }.bind(this));

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

RoomPage.prototype.render = function() {

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