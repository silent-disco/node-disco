
var h = require('virtual-dom/h');

var inherits = require('inherits');

var Component = require('../../base/components/child');


function PlayerControls(parent, player) {
  Component.call(this, parent, player);

  player.on('update', this.playerUpdate.bind(this));
}

inherits(PlayerControls, Component);

module.exports = PlayerControls;


PlayerControls.prototype.playerUpdate = function(data) {
  this.data = data;

  /*
  this.data = {
    song: {
      name: 'foo',
      permalinkUrl: 'http://foo',
      pictureUrl: 'https://placehold.it/100x100',
      duration: 240000,
      artist: {
        name: 'some artist',
        permalinkUrl: 'http://bar'
      }
    },
    // loading
    // stopped
    // playing
    playState: 'playing',
    position: 40000,
    // time loaded
    loaded: 81201
  };
  */

  this.changed();
};

PlayerControls.prototype.toNode = function() {

  var data = this.data;
  return h('.player-widget', data && this.renderPlayer(data));
};


PlayerControls.prototype.renderPlayer = function(data) {

  var roomPage = this.parent;

  var playState = data.playState;

  var stopped = playState === 'stopped';

  var animateCls = playState === 'loading' ? '.animate' : '';

  var duration = data.song.duration;

  var position = (playState === 'loading' ? data.loaded : data.position) || 0;

  var relativePosition = Math.round(position / duration * 1000) / 10;

  return [
    h('.controls', [
      stopped ?
        h('a.icon-play', { 'ev-click': roomPage.play.bind(roomPage, null) }) :
        h('a.icon-stop', { 'ev-click': roomPage.stop.bind(roomPage) })
    ]),
    h('.details', [
      h('.info', [
        h('span.title', data.song.name),
        ' - ',
        h('span.artist', data.song.artist.name)
      ]),
      h('.progress', [
        h('.elapsed', formatDuration(position)),
        h('.bar', [
          h('.meter' + animateCls, [
            h('span', { style: { width: relativePosition + '%' } })
          ])
        ]),
        h('.total', formatDuration(duration))
      ])
    ])
  ];
};


function padDuration(duration) {
  if (duration < 10) {
    return '0' + String(duration);
  } else {
    return String(duration);
  }
}

function formatDuration(ms) {

  var s = Math.round(ms / 1000);

  var seconds = s % 60;

  var m = (s - seconds) / 60;

  var minutes = m % 60;

  var hours = (m - minutes) / 60;

  var results = [];

  if (hours > 0) {
    results.push(hours);
  }

  results.push(padDuration(minutes));
  results.push(padDuration(seconds));

  return results.join(':');
}