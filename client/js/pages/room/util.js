'use strict';

var COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];

function getUserColor(user) {
  var id = user.id;

  // Compute hash code
  var hash = 7;
  for (var i = 0; i < id.length; i++) {
     hash = id.charCodeAt(i) + (hash << 5) - hash;
  }
  // Calculate color
  var index = Math.abs(hash % COLORS.length);
  return COLORS[index];
}

exports.getUserColor = getUserColor;
