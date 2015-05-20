'use strict';

var h = require('virtual-dom/h');

var inherits = require('inherits');

var Component = require('../../base/components/child');

var map = require('lodash/collection/map'),
    filter = require('lodash/collection/filter');

var getUserColor = require('./util').getUserColor;

/*
  User List
    - On join get current users
    - listen to new users joining
    - listen to users leaving
    - request current users after 5mins (TODO)
*/

function UsersList(parent) {
  Component.call(this, parent);

  this.actions = [];
}

inherits(UsersList, Component);

module.exports = UsersList;


UsersList.prototype.updateList = function(users) {
    this.users = users;

    this.changed();
};

UsersList.prototype.add = function(user) {
    this.users.push(user);

    this.changed();
};

UsersList.prototype.remove = function(user) {

    this.users = filter(this.users, function(userObj) {
        return user.id !== userObj.id;
    });

    this.changed();
};

UsersList.prototype.toNode = function() {
    return h('ul.users', [ renderUsers(this.users) ]);
};

function renderUsers(users) {
    return map(users, function(user) {
        return h('li.user', [ h('span.rect', {style: { backgroundColor: getUserColor(user) }}), h('p.user-name', user.name) ]);
    });
}
