var h = require('virtual-dom/h');

var find = require('lodash/collection/find');
var without = require('lodash/array/without');
var map = require('lodash/collection/map');

var inherits = require('inherits');

var formatDuration = require('../../util/format-duration');

var Component = require('../../base/components/child');


function PlaylistWidget(parent) {
  Component.call(this, parent);

  this.songs = [];
}

inherits(PlaylistWidget, Component);

module.exports = PlaylistWidget;


PlaylistWidget.prototype.get = function(uri) {

  // unwrap song if passed
  uri = uri.uri || uri;

  return find(this.songs, function(song) {
    return uri === song.uri;
  });
};

PlaylistWidget.prototype.contains = function(song) {
  return !!this.get(song);
};

PlaylistWidget.prototype.add = function(song) {
  this.songs.push(song);

  this.changed();
};


PlaylistWidget.prototype.next = function(uri) {
  var song = this.get(uri);

  var idx = this.songs.indexOf(song);

  var nextIdx = idx + 1;

  if (nextIdx === this.songs.length) {
    nextIdx = 0;
  }

  return this.songs[nextIdx];
};

PlaylistWidget.prototype.remove = function(song) {

  var actualSong = this.get(song);

  this.songs = without(this.songs, actualSong);

  this.changed();
};

PlaylistWidget.prototype.playerUpdate = function(data) {
  this.playing = data;

  this.changed();
};

PlaylistWidget.prototype.toNode = function() {

  return h('.playlist', [
    h('.songs', map(this.songs, this.renderSong.bind(this)))
  ]);
};


PlaylistWidget.prototype.select = function(song) {
  this.selected = song;

  this.changed();
};

PlaylistWidget.prototype.renderSong = function(song) {

  var roomPage = this.parent;

  var duration = song.duration;

  var playState = 'stopped';
  var position = 0;

  var songCls = '';

  var playing = this.playing;

  if (playing && playing.song === song) {
    playState = playing.playState;
    position = playing.position || 0;

    songCls += '.active';
  }

  if (this.selected === song) {
    songCls += '.selected';
  }

  songCls += ('.' + playState);

  var buttonCls;

  if (playState === 'loading') {
    buttonCls = '.icon-dots.pulse';
  } else {
    buttonCls = '.icon-play';
  }

  var meterCls = playState === 'loading' ? '.striped' : '';

  var relativePosition = Math.round(position / duration * 1000) / 10;

  function meterClick(event) {
    var percentage = (event.layerX || event.offsetX) / event.currentTarget.offsetWidth;

    var position = Math.round(duration * percentage);

    roomPage.playSong(song, position);
  }

  return h('.song' + songCls, { 'ev-click': this.select.bind(this, song) }, [
    h('.controls', [
      h('a' + buttonCls, { 'ev-click': roomPage.playSong.bind(roomPage, song, null) })
    ]),
    h('.details', [
      h('.info', [
        h('span.title', song.name),
        ' - ',
        h('span.artist', song.artist.name)
      ]),
      h('.progress', [
        h('.elapsed', formatDuration(position)),
        h('.bar', [
          h('.i', {
            'ev-click': meterClick
          }, [
            h('.meter' + meterCls, [
              h('span', { style: { width: relativePosition + '%' } }, [
                h('span')
              ])
            ])
          ])
        ]),
        h('.total', formatDuration(duration))
      ])
    ])
  ]);
};
