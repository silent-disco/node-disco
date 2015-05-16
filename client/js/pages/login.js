var inherits = require('inherits');

var h = require('virtual-dom/h');

var Page = require('../base/components/page');


function LoginPage(app) {
  Page.call(this, 'login', app);
}

inherits(LoginPage, Page);

module.exports = LoginPage;


LoginPage.prototype.join = function(e) {

  var userName = e.target.querySelector('.user-name').value;

  if (userName.trim()) {
    this.app.joinRoom({ name: userName });
  }

  e.preventDefault();
};

LoginPage.prototype.toNode = function() {

  return this.renderPage({ 'ev-click': this.focus.bind(this) }, [
    h('form', { 'ev-submit': this.join.bind(this) }, [
      h('h3.title', [
        'Join ',
        h('span.room-name', [ this.app.roomName ]),
        '. What\'s your nick name?'
      ]),
      h('input.user-name', { type: 'text', maxlength: 14, 'autofocus': true })
    ])
  ]);
};