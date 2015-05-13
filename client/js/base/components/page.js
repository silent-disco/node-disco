var inherits = require('inherits');

var Child = require('./child');

var h = require('virtual-dom/h');


function Page(name, app) {

  Child.call(this);

  this.app = app;
  this.name = name;

  function activated(page) {

    this.active = page === this;

    if (this.active) {
      this.attachTo(app);

      this.focus();
    } else {
      this.detach();
    }
  }

  app.on('page.activate', activated.bind(this));
}

inherits(Page, Child);

module.exports = Page;


Page.prototype.renderPage = function(opts, children) {

  var pageSelector = '.page.' + this.name + '-page';

  if (this.active) {
    pageSelector += '.active';
  }

  return h(pageSelector, opts, children);
};
