var inherits = require('inherits');

var h = require('virtual-dom/h');

var createElement = require('virtual-dom/create-element');

var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

var Base = require('./base');


function Child(parent) {
  Base.call(this);

  this.parent = parent;

  this.node = h('div');

  this.$el = createElement(this.node);
}

inherits(Child, Base);

module.exports = Child;


/**
 * Attach to the given parent component
 *
 * @param {Base} parent
 *
 * @return {Child} self
 */
Child.prototype.attachTo = function(parent) {

  if (this.parent !== parent) {
    this.detach();
  }

  this.emit('attach', parent);

  this.parent = parent;

  this.changed();

  return this;
};

Child.prototype.detach = function() {

  var parent = this.parent;

  if (parent) {
    this.emit('detach', parent);

    this.parent = null;

    this.changed();

    parent.changed();
  }
};

Child.prototype.focus = function() {

  function delayedFocus() {
    if (!this.isAttached()) {
      return;
    }

    var targetElement = this.$el.querySelector('[autofocus]');

    if (targetElement) {
      targetElement.focus();
    }
  }

  setTimeout(delayedFocus.bind(this), 50);
};

Child.prototype.isAttached = function() {
  return !!this.parent;
};

Child.prototype.render = function() {
  return new Tree(this);
};

Child.prototype.update = function() {
  this.render().init();
};

function Tree(component) {
  this.component = component;

  this.key = this.component.key;
}

Tree.prototype.type = "Widget";

Tree.prototype.init = function() {
  var $el = this.component.$el;
  return this.update(null, $el) || $el;
};

Tree.prototype.update = function(previous, $el) {
  var component = this.component;

  if (component.dirty === false) {
    return;
  }

  var node = component.node,
      newNode = component.toNode(),
      patches = diff(node, newNode);

  component.$el = patch($el, patches);

  component.node = newNode;
  component.dirty = false;

  if (component.$el !== $el) {
    return component.$el;
  }
};

Tree.prototype.destroy = function(domNode) {
  console.log('destroy', this);
};