'use strict';

var h = require('virtual-dom/h');

var inherits = require('inherits');

var Component = require('../../base/components/child');

var assign = require('lodash/object/assign'),
    findIndex = require('lodash/array/findIndex'),
    map = require('lodash/collection/map');

var matchesSelector = require('matches-selector');

var autoScroll = require('../../base/hooks/auto-scroll');

var now = require('../../util/now');

var getUserColor = require('./util').getUserColor;

var extractUrls = require('../../util/extract-urls');
var extractEmojis = require('../../util/extract-emojis');


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

Chat.prototype.onclick = function(event) {

  // focus the chat window whenever a user clicks on
  // our the message area.
  if (matchesSelector(event.target, '.action, .actions')) {
    this.focus();
  }
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

Chat.prototype.toNode = function() {

  return h('.chat', { 'ev-click': this.onclick.bind(this) }, [
    h('ul.actions', {
        scroll: autoScroll()
      }, [
      renderActions(this.actions)
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

function renderText(text) {

  var parts = extractUrls(extractEmojis(text));

  return parts.map(function(part) {
    if (part.url) {
      return h('a', { href: part.url, target: '_blank' }, part.url);
    } else
    if (part.emoji) {
      return h('span.twa.twa-lg.twa-' + part.emoji, { title: part.emoji });
    } else {
      return part.text;
    }
  });
}
