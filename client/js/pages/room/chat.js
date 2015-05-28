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

var PlayerWidget = require('./player-widget');

var TYPING_TIMER = 800;


var entryMap = {
  log: LogEntry,
  song: SongEntry,
  __default: DefaultEntry
};


function Chat(room) {
  Component.call(this, room);

  this.entries = [];
  this.selected = null;

  // sent from player widgets
  this.on('play-song', function(song, position) {
    room.playSong(song, position);
  });

  // sent from player widgets
  this.on('select', this.select.bind(this));
}

inherits(Chat, Component);

module.exports = Chat;

Chat.prototype.removeTyping = function(user) {

  var idx = findIndex(this.entries, function(entry) {
    var action = entry.action;

    return action.type === 'typing' && action.user.id === user.id;
  });

  var wasTyping = idx !== -1;

  if (wasTyping) {
    this.entries.splice(idx, 1);

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

Chat.prototype.select = function(entry) {

  var previousSelection = this.selected;

  if (previousSelection) {
    previousSelection.setSelected(false);
  }

  entry.setSelected(true);

  this.selected = entry;
};

Chat.prototype.playerUpdate = function(status) {

  this.entries.forEach(function(entry) {
    if (entry && entry.song === status.song) {
      entry.setPlaying(status);
    }
  });
};

Chat.prototype.addAction = function(action, options) {

  options = options || {};

  var fade = options.fade;

  if (action.type === 'typing' || action.type === 'message') {
    fade = this.removeTyping(action.user);
  }

  action = assign({ fade: fade }, action);

  var Entry = entryMap[action.type] || entryMap.__default;

  this.entries.push(new Entry(this, action));

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
  return map(this.entries, function(entry) {
    return entry.render();
  });
};

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

function ActionEntry(parent, action) {
  Component.call(this, parent);

  this.action = action;

  this.setSelected = function(selected) {
    this.selected = selected;
  };

  this.renderBody = function() {
    throw new Error('subclass responsibility');
  };

  this.toNode = function() {

    var actionSelector = '.action.' + action.type;

    if (action.fade) {
      actionSelector += '.fade';
    }

    return h(actionSelector, this.renderBody());
  };
}

inherits(ActionEntry, Component);


function LogEntry(parent, action) {
  ActionEntry.call(this, parent, action);

  this.renderBody = function() {
    return [
      h('span.body', renderText(action.text))
    ];
  };
}

inherits(LogEntry, ActionEntry);


function DefaultEntry(parent, action) {
  ActionEntry.call(this, parent, action);

  this.renderBody = function() {

    var user = action.user;

    return [
      h('span.author', [
        h('span.name', {
          style: {
            color: getUserColor(user)
          }
        }, user.name)
      ]),
      h('span.body', renderText(action.text))
    ];
  };
}

inherits(DefaultEntry, ActionEntry);


function SongEntry(parent, action) {
  PlayerWidget.call(this, parent, action.song);

  this.action = action;
}

inherits(SongEntry, PlayerWidget);