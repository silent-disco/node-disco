var inherits = require('inherits');

var Emitter = require('events');

var count = 0;

/**
 * Base component, a simple event emitter
 */
function Base() {
  this.key = 'c' + count++;
}

inherits(Base, Emitter);

module.exports = Base;

/**
 * Render the component tree
 *
 * @return {VNode} tree root
 */
Base.prototype.render = function() {

  if (typeof this.toNode === 'function') {
    return this.toNode();
  }

  throw new Error('subclass responsibility');
};


/**
 * Notify the component that it or any of its
 * children changed.
 */
Base.prototype.changed = function(child) {

  var component = child || this;

  if (component === this) {
    this.dirty = true;
  }

  // emit changed event
  this.emit('changed', component);

  if (this.parent) {
    // bubble up the changed trigger
    this.parent.changed(component);
  }
};


/**
 * Update the given component
 */
Base.prototype.update = function() { };
