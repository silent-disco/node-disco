var inherits = require('inherits');

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach'),
    map = require('lodash/collection/map');

var Emitter = require('events');

var SoundCloud = require('./soundcloud');


function Player(config) {

  this.setAdapters({
    'soundcloud': new SoundCloud(config)
  });
}

inherits(Player, Emitter);

module.exports = Player;

Player.prototype.setAdapters = function(adapters) {

  this.adapters = assign({}, adapters);

  var self = this;

  forEach(this.adapters, function(adapter, id) {
    adapter.id = id;

    adapter.on('update', function(status) {
      self.emit('update', status);
    });
  });
};

Player.prototype.getAdapter = function(song) {
  return this.adapters[song.adapter];
};


Player.prototype.changed = function(status) {
  this.status = status;

  this.emit('update', status);
};

Player.prototype.play = async function(song) {

  var currentSong = this.getCurrentSong();

  if (currentSong) {
    if (song) {
      if (song.uri !== currentSong.uri) {
        await this.stop();
      }
    } else {
      song = currentSong;
    }
  }

  if (!song) {
    return;
  }

  var adapter = this.getAdapter(song);

  await adapter.play(song);

  this.changed({
    playState: 'playing',
    song: song,
    position: 0
  });
};

Player.prototype.stop = async function() {

  var song = this.getCurrentSong();

  if (!song) {
    return;
  }

  var adapter = this.getAdapter(song);
  await adapter.stop();
};

Player.prototype.getCurrentSong = function() {
  return this.status && this.status.song;
};

Player.prototype.stop = async function() {

  var status = this.status;

  if (!status) {
    return;
  }

  var song = status.song;

  var adapter = this.getAdapter(song);

  await adapter.stop();

  this.changed({
    playState: 'stopped',
    song: song
  });
};

Player.prototype.fetchInfo = async function(identifier) {

  var adapters = this.adapters;

  var compatibileAdapters = await* map(adapters, async function(adapter) {
    var canPlay = await adapter.isSong(identifier);
    return canPlay ? adapter : null;
  });

  var adapter = compatibileAdapters.find(function(adapter) {
    return !!adapter;
  });

  var song;

  if (adapter) {
    song = await adapter.fetchInfo(identifier);
    song.adapter = adapter.id;
  }

  return song;
};