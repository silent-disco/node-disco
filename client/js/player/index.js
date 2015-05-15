var map = require('lodash/collection/map');

var SoundCloud = require('./soundcloud');


function Player(config) {

  this.adapters = {
    'soundcloud': new SoundCloud('soundcloud', config)
  };

}

module.exports = Player;

Player.prototype.play = async function(song) {
  var adapter = this.adapters[song.adapter];

  return adapter.play(song);
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