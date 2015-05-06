var inherits = require('inherits');

var Page = require('../../base/page');

var Chat = require('./chat');

function RoomPage(app) {
  Page.call(this, 'room', app);

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


    /*notifications.add({
      title: data.user.name + ' says',
      message: data.message
    });
    */

  app.on('user-message', function(data) {

    this.addAction({
      user: data.user,
      text: data.message,
      message : true
    });
  }.bind(this));

  app.on('user-joined', function(data) {

    this.addAction({
      user: data.user,
      text: 'joined'
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

  app.on('user-left', function(data) {

    this.addAction({
      user: data.user,
      text: 'left'
    });

    this.printParticipants(data);
  }.bind(this));

  app.on('connected', function(data, reconnect) {

    if (reconnect) {
      this.log('welcome to silent disco / ' + data.roomId);
    } else {
      this.log('connection restored');
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


RoomPage.prototype.render = function() {
  return this.renderPage([
    this.chat.render()
  ]);
};