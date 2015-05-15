
var h = require('virtual-dom/h');

var inherits = require('inherits');

var Component = require('../../base/components/child');


function PlayerControls(parent) {
  Component.call(this, parent);
}

inherits(PlayerControls, Component);

module.exports = PlayerControls;


PlayerControls.prototype.toNode = function() {

  var roomPage = this.parent;

  return h('.player-controls', [
    h('button', { 'ev-click': roomPage.play.bind(roomPage, null) }, 'play'),
    h('button', { 'ev-click': roomPage.stop.bind(roomPage) }, 'stop'),
    h('.controls', [
      h('.meter', [
        h('span', { style: { width: '25%' } })
      ])
    ])
  ]);
};