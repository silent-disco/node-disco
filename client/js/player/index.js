var inherits = require('inherits');

var map = require('lodash/collection/map');

var Emitter = require('events');

var SoundCloud = require('./soundcloud');


function Player(config) {

  this.adapters = {
    'soundcloud': new SoundCloud('soundcloud', config)
  };

}

inherits(Player, Emitter);

module.exports = Player;

Player.prototype.getAdapter = function(song) {
  return this.adapters[song.adapter];
};


Player.prototype.changed = function(status) {
  this.status = status;

  this.emit('changed', status);
};

Player.prototype.play = async function(song) {

  if (!song && this.status) {
    song = this.status.song;
  }

  if (!song) {
    return;
  }

  var adapter = this.getAdapter(song);

  await adapter.play(song);

  this.changed({
    mode: 'playing',
    song: song,
    progress: 0
  });
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
    mode: 'stopped',
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