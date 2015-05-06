var h = require('virtual-dom/h');

var inherits = require('inherits');

var Component = require('../../base/component');

var assign = require('lodash/object/assign'),
    findIndex = require('lodash/array/findIndex'),
    map = require('lodash/collection/map');


var now = require('../../util/now');
var extractUrls = require('../../util/extract-urls');


var TYPING_TIMER = 400;


function Chat(parent) {
  Component.call(this, parent);

  this.actions = [];
}

inherits(Chat, Component);

module.exports = Chat;

Chat.prototype.removeTyping = function(user) {

  var idx = findIndex(this.actions, function(a) {
    return a.typing && a.user.id === user.id;
  });

  if (idx !== -1) {
    this.actions.splice(idx, 1);
  }

  if (idx !== -1) {
    this.changed();
  }

  return idx !== -1;
};

Chat.prototype.addTyping = function(user) {

  this.addAction({
    typing: true,
    user: user,
    text: 'is typing'
  });

  this.changed();
};

Chat.prototype.addAction = function(action, options) {

  options = options || {};

  var fade = options.fade;

  if (action.typing || action.message) {
    fade = this.removeTyping(action.user);
  }

  action = assign({ fade: fade }, action);

  this.actions.push(action);

  this.changed();
};

Chat.prototype.toggleNotifications = function(event) {
  console.log('toggle desktop notifications', event);
};

Chat.prototype.oninput = function(event) {

  if (event.charCode === 13 && !event.shiftKey) {
    event.preventDefault();

    var $textarea = event.target;

    var text = $textarea.value.trim();

    if (text) {
      this.emit('submit', text);
    }

    $textarea.value = '';

    return;
  }

  if (!this.typing) {
    this.emit('start-typing');
  }

  this.typing = now();

  function stopTyping() {

    var typingStart = this.typing;
    var t = now();

    if (typingStart && (t - typingStart >= TYPING_TIMER)) {
      this.emit('stop-typing');
      this.typing = false;
    }
  }

  setTimeout(stopTyping.bind(this), TYPING_TIMER);
};

Chat.prototype.render = function() {

  return h('#chat', [
    h('.page-menu', [
      h('a.icon-notifications', {
        href: '#',
        title: 'toggle desktop notifications',
        'ev-click': this.toggleNotifications.bind(this)
      })
    ]),
    h('.chat', [
      h('ul.actions', [
        renderActions(this.actions)
      ])
    ]),
    h('form.new-message', { 'ev-keypress': this.oninput.bind(this) }, [
      h('textarea', {
        placeholder: 'Type here...',
        autofocus: true
      })
    ])
  ]);
};


function renderActions(actions) {

  return map(actions, function(action) {

    var user = action.user;

    var actionSelector = user ? '.action' : '.log';

    if (action.typing) {
      actionSelector += '.typing';
    }

    if (action.fade) {
      actionSelector += '.fade';
    }

    if (action.message) {
      actionSelector += '.message';
    }

    return h(actionSelector, [
      user ? h('span.author', [
        h('span.name', {
          style: {
            color: getUserColor(user)
          }
        }, action.user.name)
      ]) : '',
      h('span.body', renderText(action.text))
    ]);
  });

}


var COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];

function getUserColor(user) {
  var id = user.id;

  // Compute hash code
  var hash = 7;
  for (var i = 0; i < id.length; i++) {
     hash = id.charCodeAt(i) + (hash << 5) - hash;
  }
  // Calculate color
  var index = Math.abs(hash % COLORS.length);
  return COLORS[index];
}

function renderText(text) {

  var parts = extractUrls(text);

  return parts.map(function(part) {
    if (part.url) {
      return h('a', { href: part.url, target: '_blank' }, part.url);
    } else {
      return part.text;
    }
  });
}