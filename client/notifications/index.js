var $ = require('jquery');

var Notify = require('notifyjs');

var $window = $(window);


function Notifications() {

  var windowFocus = false;
  var active = false;

  var $el;

  $window.on('focus', function() { windowFocus = true; });

  $window.on('blur', function() { windowFocus = false; });

  /* switch notifications on or off */
  this.setActive = function(_active) {
    active = _active;

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

    $el = $(element);

    var self = this;

    $el.on('click', function() {
      self.setActive(!$el.hasClass('active'));
    });

    return this;
  };
}


module.exports = Notifications;