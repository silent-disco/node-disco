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

var formatDuration = require('../../util/format-duration');
var extractUrls = require('../../util/extract-urls');
var extractEmojis = require('../../util/extract-emojis');


var TYPING_TIMER = 800;


function Chat(parent) {
  Component.call(this, parent);

  this.actions = [];

  this.actionRenderers = new ActionRenderers(this);
}

inherits(Chat, Component);

module.exports = Chat;

Chat.prototype.removeTyping = function(user) {

  var idx = findIndex(this.actions, function(a) {
    return a.type === 'typing' && a.user.id === user.id;
  });

  var wasTyping = idx !== -1;

  if (wasTyping) {
    this.actions.splice(idx, 1);

    this.changed();
  }

  return wasTyping;
};

Chat.prototype.addTyping = function(user) {

  this.addAction({
    type: 'typing',
    user: user,
    text: 'is typing'
  });

  this.changed();
};

Chat.prototype.addAction = function(action, options) {

  options = options || {};

  var fade = options.fade;

  if (action.type === 'typing' || action.type === 'message') {
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

  setTimeout(this.stopTyping.bind(this), TYPING_TIMER);
};

Chat.prototype.stopTyping = function() {
  var typingStart = this.typing;
  var t = now();

  if (typingStart && (t - typingStart >= TYPING_TIMER)) {
    this.emit('stop-typing');
    this.typing = false;
  }
};

Chat.prototype.toNode = function() {

  return h('.chat', { 'ev-click': this.onclick.bind(this) }, [
    h('ul.actions', {
        scroll: autoScroll()
      }, [
      this.renderActions()
    ]),
    h('form.new-message', { 'ev-keypress': this.oninput.bind(this) }, [
      h('textarea', {
        placeholder: 'Type here...',
        autofocus: true
      })
    ])
  ]);
};

Chat.prototype.renderActions = function() {
  var actions = this.actions;

  var actionRenderers = this.actionRenderers;

  return map(actions, function(action) {

    var type = action.type;

    var actionSelector = '.action.' + action.type;

    if (action.fade) {
      actionSelector += '.fade';
    }

    var renderer = actionRenderers[type] || actionRenderers['default'];

    return h(actionSelector, renderer(action));
  });
};


function ActionRenderers(chat) {

  this['default'] = function(action) {

    var user = action.user;

    return [
      h('span.author', [
        h('span.name', {
          style: {
            color: getUserColor(user)
          }
        }, action.user.name)
      ]),
      h('span.body', renderText(action.text))
    ];
  };

  this['log'] = function(action) {
    return [
      h('span.body', renderText(action.text))
    ];
  };

  var room = chat.parent;

  this['song'] = function(action) {
    var song = action.song;

    return [
      h('img.artwork', { src: song.pictureUrl }),
      h('.summary', [
        h('a', { href: song.permalinkUrl, target: '_blank' }, song.name),
        ' - ',
        h('a', { href: song.artist.permalinkUrl, target: '_blank' }, song.artist.name),
        ' (',
        h('span.duration', formatDuration(song.duration)),
        ')'
      ]),
      h('.controls', [
        h('button.play', { 'ev-click': room.playSong.bind(room, song, 0) }, 'play'),
        h('button.add', { 'ev-click': room.addSong.bind(room, song) }, 'add')
      ])
    ];
  };
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
