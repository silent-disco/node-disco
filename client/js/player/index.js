var inherits = require('inherits');

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach'),
    map = require('lodash/collection/map');

var Emitter = require('events');

var SoundCloud = require('./soundcloud');

var MUTED_ACTIVE = 'mutedActive';


function Player(config) {

  this.config = config;

  this.setAdapters({
    'soundcloud': new SoundCloud(config)
  });

  this.toggleMuted(config.get(MUTED_ACTIVE, false));
}

inherits(Player, Emitter);

module.exports = Player;


Player.prototype.toggleMuted = function(value) {

  var muted = value !== undefined ? value : !this.muted;

  this.muted = muted;

  this.config.set(MUTED_ACTIVE, muted);

  forEach(this.adapters, function(adapter) {
    adapter.setMuted(muted);
  });
};

Player.prototype.isMuted = function() {
  return this.muted;
};

Player.prototype.setAdapters = function(adapters) {

  this.adapters = assign({}, adapters);

  var self = this;

  forEach(this.adapters, function(adapter, id) {
    adapter.id = id;

    adapter.on('finish', function(song) {
      self.emit('finish', song);
    });

    adapter.on('update', self.changed.bind(self));
  });
};

Player.prototype.getAdapter = function(song) {
  return this.adapters[song.adapter];
};


Player.prototype.changed = function(status) {
  this.status = status;

  this.emit('update', status);
};

/**
 * Play the given song at the specified position.
 *
 * @param  {Song} song
 * @param  {Number} [position=0]
 *
 * @return {Boolean} true, if the song is actually playing
 */
Player.prototype.play = async function(song, position) {

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

  await adapter.play(song, position);
};

Player.prototype.stop = async function() {
  var adapter = this.getCurrentAdapter();

  if (adapter) {
    return await adapter.stop();
  }
};

Player.prototype.getCurrentAdapter = function() {

  var currentSong = this.getCurrentSong();

  if (!currentSong) {
    return null;
  }

  return this.getAdapter(currentSong);
};

Player.prototype.getCurrentSong = function() {
  return this.status && this.status.song;
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