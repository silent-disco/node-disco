var Notify = require('notifyjs');

var $window = $(window);

var NOTIFICATIONS_ENABLED = 'notificationsEnabled';


function Notifications(config) {

  var windowFocus = false;
  var active = config.get(NOTIFICATIONS_ENABLED, false);

  var $el;

  $window.on('focus', function() { windowFocus = true; });

  $window.on('blur', function() { windowFocus = false; });

  /* switch notifications on or off */
  this.setActive = function(_active) {
    active = _active;

    config.set(NOTIFICATIONS_ENABLED, _active);

    if (active && Notify.needsPermission) {
      Notify.requestPermission(createNotification);
    }

    if ($el) {
      $el[active ? 'addClass' : 'removeClass']('active');
    }
  };

  this.add = function(data) {

    if (!active || windowFocus) {
      return;
    }

    var notification = new Notify(data.title, {
      body: data.message,
      notifyClick: function(e) {
        $window.focus();
      },
      timeout: 5
    });

    notification.show();
  };

  this.bindTo = function(element) {

    throw new Error('implement me');

    $el = $(element);

    var self = this;

    $el.on('click', function() {
      self.setActive(!$el.hasClass('active'));
    });

    this.setActive(active);

    return this;
  };
}


module.exports = Notifications;