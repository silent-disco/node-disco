var inherits = require('inherits');

var h = require('virtual-dom/h');

var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

var createElement = require('virtual-dom/create-element');

var Base = require('./base');


/**
 * The root of a component hierarchy.
 *
 * @param {Element} [$parent]
 */
function Root($parent) {
  Base.call(this);

  this.node = h('div');

  this.$el = createElement(this.node);

  if ($parent) {
    this.attachTo($parent);
  }
}

inherits(Root, Base);

module.exports = Root;


/**
 * Append this component to the specified dom element
 *
 * @param  {Element} $parent
 *
 * @return {Root} self
 */
Root.prototype.attachTo = function($parent) {

  if (typeof $parent === 'string') {
    $parent = document.querySelector($parent);
  }

  $parent.appendChild(this.$el);

  return this;
};

Root.prototype.detach = function() {

  var $el = this.$el,
      $parent = $el.parentNode;

  if ($parent) {
    this.emit('detach', $parent);

    $parent.removeChild($el);
  }
};

Root.prototype.update = function() {

  var $el = this.$el,
      $parent = $el.parentNode;

  if (!$parent) {
    return;
  }

  var node = this.node,
      newNode = this.render();

  var patches = diff(node, newNode);

  console.log('update', $el, patches);

  this.$el = patch($el, patches);
  this.node = newNode;

  this.dirty = false;
};