var Notify = require('notifyjs');

var NOTIFICATIONS_ENABLED = 'notificationsEnabled';


function Notifications(app) {

  var config = app.config;

  var windowFocus = false;
  var active = config.get(NOTIFICATIONS_ENABLED, false);

  window.addEventListener('focus', function() { windowFocus = true; });

  window.addEventListener('blur', function() { windowFocus = false; });

  /* switch notifications on or off */
  this.toggle = function() {
    active = !active;

    config.set(NOTIFICATIONS_ENABLED, active);

    if (active && Notify.needsPermission) {
      Notify.requestPermission();
    }
  };

  this.add = function(data) {

    if (!active || windowFocus) {
      return;
    }

    var notification = new Notify(data.title, {
      body: data.message || '',
      notifyClick: function(e) {
        window.focus();
      },
      timeout: 5
    });

    notification.show();
  };

  this.isActive = function() {
    return active;
  };
}


module.exports = Notifications;