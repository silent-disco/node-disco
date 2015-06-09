var h = require('virtual-dom/h');

var inherits = require('inherits');

var Component = require('../../base/components/child');

var formatDuration = require('../../util/format-duration');


/**
 * An entry displaying a song with play controls,
 * progress and more.
 */
function SongEntry(parent, song) {
  Component.call(this, parent);

  this.song = song;
  this.playing = null;
}

inherits(SongEntry, Component);

module.exports = SongEntry;


SongEntry.prototype.setPlaying = function(playing) {
  this.playing = playing;

  this.changed();
};

SongEntry.prototype.setSelected = function(selected) {
  this.selected = selected;

  debugger;

  console.log(this.$el);

  this.changed();
};

SongEntry.prototype.toNode = function() {

  var self = this;

  var parent = this.parent,
      song = this.song,
      playing = this.playing,
      selected = this.selected;

  var duration = song.duration;

  var playState = 'stopped';
  var position = 0;

  var songCls = '';

  if (playing) {
    playState = playing.playState;
    position = playing.position || 0;

    if (playState !== 'stopped') {
      songCls += '.active';
    }
  }

  if (selected) {
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

  function select() {
    parent.emit('select', self);
  }

  function play(position) {
    parent.emit('play-song', song, isNaN(position) ? null : position);
  }

  function meterClick(event) {
    var percentage = (event.layerX || event.offsetX) / event.currentTarget.offsetWidth;

    var position = Math.round(duration * percentage);

    play(position);
  }

  return h('.player-widget' + songCls, { 'ev-click': select }, [
    h('.header', [
      h('.controls', [
        h('a' + buttonCls, { 'ev-click': play })
      ]),
      h('a.artwork', { href: song.permalinkUrl, target: '_blank'}, [
        h('img', { src: song.pictureUrl })
      ]),
    ]),
    h('.details', [
      h('.info', [
        h('span.title', song.name),
        ' - ',
        h('span.artist', song.artist.name),
        h('span.duration', [
          ' (', formatDuration(song.duration), ')'
        ])
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