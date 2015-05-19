var nextTick = require('next-tick');

/**
 * A hook that can be added to a container to
 * facilitate auto scrolling behavior.
 *
 * @example
 *
 * ```javascript
 * var autoScroll = require('auto-scroll');
 *
 * function render() {
 *   return h('.container', { scroll: autoScroll() }, [
 *     renderChildren()
 *   ]);
 * }
 * ```
 */
function AutoScroll() {
  if (!(this instanceof AutoScroll)) {
    return new AutoScroll();
  }
}

module.exports = AutoScroll;

AutoScroll.prototype.hook = function(node, propertyName) {

  // capture scroll state changes
  node.addEventListener('scroll', function(event) {
    node.scrollBottom = node.scrollHeight - node.offsetHeight - node.scrollTop;
  });

  nextTick(function() {
    if (!node.scrollBottom) {
      node.scrollTop = node.scrollHeight;
    }
  });
};