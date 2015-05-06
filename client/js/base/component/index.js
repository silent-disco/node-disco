var inherits = require('inherits');

var h = require('virtual-dom/h');

var createElement = require('virtual-dom/create-element');

var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

var Emitter = require('events');


function Component(parent) {
  Emitter.call(this);

  this.parent = parent;

  this.tree = h('div');

  this.$el = createElement(this.tree);
}

inherits(Component, Emitter);

module.exports = Component;


Component.prototype.changed = function() {

  this.emit('changed');

  if (this.parent) {
    this.parent.changed();
  } else {
    this.update();
  }
};

/**
 * Render the component tree
 *
 * @return {VNode} tree root
 */
Component.prototype.render = function() {
  throw new Error('implement me');
};

Component.prototype.attachTo = function($parent) {

  if (typeof $parent === 'string') {
    $parent = document.querySelector($parent);
  }

  $parent.appendChild(this.$el);

  this.emit('attach', $parent);

  this.changed();

  return this;
};

Component.prototype.focus = function() {

  setTimeout(function() {
    if (!this.isAttached()) {
      return;
    }

    var targetElement = this.$el.querySelector('[autofocus]');

    if (targetElement) {
      targetElement.focus();
    }
  }.bind(this), 50);
};

Component.prototype.detach = function() {

  var $el = this.$el,
      $parent = $el.parentNode;

  if ($parent) {
    this.emit('detach', $parent);

    $parent.removeChild($el);
  }
};

Component.prototype.isAttached = function() {
  return !!this.$el.parentNode;
};

Component.prototype.update = function() {

  var $el = this.$el,
      $parent = $el.parentNode,
      currentTree = this.tree,
      newTree,
      patches;

  if (!$parent) {
    return;
  }

  newTree = this.render();

  patches = diff(currentTree, newTree);
  patch($el, patches);

  this.tree = newTree;
};