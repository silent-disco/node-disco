var co = require('co');


function LifeCycle(events) {

  function cleanup() {
    console.log('\033[2K\033[4D[node-disco] server shutting down');

    return co(function*() {
      yield events.emit('shutdown');

      console.log('[node-disco] over and out.');
    });
  }

  function shutdown() {
    return cleanup().then(function() {
      process.exit(0);
    });
  }


  // start reading from stdin so we don't exit.
  process.stdin.resume();


  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('SIGHUP', shutdown);

  // nodemon signal integration, cleanly shutting down
  // the app after cleanup
  process.once('SIGUSR2', function() {
    return cleanup().then(function() {
      process.kill(process.pid, 'SIGUSR2');
    });
  });
}


module.exports = LifeCycle;


LifeCycle.configure = function(events) {
  return new LifeCycle(events);
};