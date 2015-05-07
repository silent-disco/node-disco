var inherits = require('inherits');

var Component = require('../component');

var h = require('virtual-dom/h');


function Page(name, app) {

  Component.call(this);

  this.name = name;
  this.app = app;


  function activated(page) {

    this.active = page === this;

    if (this.active) {
      this.attachTo('body');

      this.focus();
    } else {
      this.detach();
    }
  }

  app.on('page.activate', activated.bind(this));
}

inherits(Page, Component);

module.exports = Page;

Page.prototype.renderPage = function(opts, children) {

  var pageSelector = '.page.' + this.name + '-page';

  if (this.active) {
    pageSelector += '.active';
  }

  return h(pageSelector, opts, children);
};

Page.prototype.activate = function() {
  this.app.emit('page.activate', this);
};