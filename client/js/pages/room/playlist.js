var h = require('virtual-dom/h');

var without = require('lodash/array/without');
var map = require('lodash/collection/map');

var inherits = require('inherits');

var Component = require('../../base/components/child');

var PlayerWidget = require('./player-widget');


function Playlist(room) {
  Component.call(this, room);

  this.songs = [];
  this.widgets = {};
  this.selected = null;

  // sent from player widgets
  this.on('play-song', function(song, position) {
    room.playSong(song, position);
  });

  // sent from player widgets
  this.on('select', this.select.bind(this));
}

inherits(Playlist, Component);

module.exports = Playlist;


Playlist.prototype.get = function(uri) {

  // unwrap song if passed
  uri = uri.uri || uri;

  var widget = this.widgets[uri];

  return widget && widget.song;
};

Playlist.prototype.contains = function(song) {
  return !!this.get(song);
};

Playlist.prototype.add = function(song) {

  if (!song.uri) {
    throw new Error('song must have a unique uri');
  }

  var widget = new PlayerWidget(this, song);

  this.songs.push(song);
  this.widgets[song.uri] = widget;

  this.changed();
};

Playlist.prototype.remove = function(song) {

  var actualSong = this.get(song);

  this.songs = without(this.songs, actualSong);
  this.widgets[actualSong.uri] = null;

  this.changed();
};

Playlist.prototype.getNext = function(uri) {
  var song = this.get(uri),
      songs = this.songs;

  var idx = songs.indexOf(song);

  var nextIdx = idx + 1;

  if (nextIdx === songs.length) {
    nextIdx = 0;
  }

  return songs[nextIdx];
};

Playlist.prototype.getPlayer = function(song) {
  return this.widgets[song.uri];
};

Playlist.prototype.playerUpdate = function(status) {

  // song can be outside playlist; if so, skip update
  var song = this.get(status && status.song);

  if (song) {
    this.getPlayer(song).setPlaying(status);
  }

  // set paused indication based on whether
  // or not the current playing song is in the
  // playlist
  this.setPaused(!song);
};

Playlist.prototype.setPaused = function(paused) {

  var oldPaused = this.paused;

  if (oldPaused !== paused) {
    this.paused = paused;

    this.changed();
  }
};

Playlist.prototype.select = function(songOrWidget) {
  var previousSelected = this.selected;

  var song = this.get(songOrWidget.song || songOrWidget);

  if (previousSelected) {
    if (previousSelected === song) {
      return;
    } else {
      this.getPlayer(previousSelected).setSelected(false);
    }
  }

  this.getPlayer(song).setSelected(true);

  this.selected = song;
};

Playlist.prototype.isSelected = function(song) {
  return this.selected === song;
};

Playlist.prototype.toNode = function() {

  var pausedCls = this.paused ? '.paused' : '';

  return h('.playlist' + pausedCls, [
    h('.songs', map(this.songs, this.renderSong.bind(this)))
  ]);
};

Playlist.prototype.renderSong = function(song) {
  return this.widgets[song.uri].render();
};