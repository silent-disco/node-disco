var co = require('co');


function LifeCycle(events) {

  function shutdown() {
    console.log('\033[2K\033[4D[node-disco] server shutting down');

    co(function*() {
      yield events.emit('shutdown');

      console.log('[node-disco] over and out.');

      process.exit(0);
    });
  }

  // start reading from stdin so we don't exit.
  process.stdin.resume();


  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('SIGHUP', shutdown);
}


module.exports = LifeCycle;


LifeCycle.configure = function(events) {
  return new LifeCycle(events);
};