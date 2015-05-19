var h = require('virtual-dom/h');

var inherits = require('inherits');

var formatDuration = require('../../util/format-duration');

var Component = require('../../base/components/child');


function PlayerWidget(parent, player) {
  Component.call(this, parent);

  player.on('update', this.playerUpdate.bind(this));
}

inherits(PlayerWidget, Component);

module.exports = PlayerWidget;


PlayerWidget.prototype.playerUpdate = function(data) {
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

PlayerWidget.prototype.toNode = function() {

  var data = this.data;
  return h('.player-widget', data && this.renderPlayer(data));
};


PlayerWidget.prototype.renderPlayer = function(data) {

  var roomPage = this.parent;

  var playState = data.playState;

  var stopped = playState === 'stopped';

  var buttonCls = playState === 'loading' ? '.pulse' : '';

  var meterCls = playState === 'loading' ? '.striped' : '';

  var duration = data.song.duration;

  var position = data.position || 0;

  var relativePosition = Math.round(position / duration * 1000) / 10;

  function meterClick(event) {
    var percentage = (event.layerX || event.offsetX) / event.currentTarget.offsetWidth;

    var position = Math.round(duration * percentage);

    roomPage.play(data.song, position);
  }

  return [
    h('.controls', [
      stopped ?
        h('a.icon-play', { 'ev-click': roomPage.play.bind(roomPage, null, 0) }) :
        h('a.icon-stop' + buttonCls, { 'ev-click': roomPage.stop.bind(roomPage) })
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
  ];
};