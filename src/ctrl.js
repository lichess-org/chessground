var model = require('./model');
var util = require('./util');

var controller = function() {
  this.pieces = new model.Pieces({
    a1: {
      role: 'rook',
      color: 'white'
    },
    a2: {
      role: 'knight',
      color: 'white'
    },
    b1: {
      role: 'pawn',
      color: 'white'
    }
  });
  this.orientation = m.prop('white');
  this.toggleOrientation = function() {
    this.orientation(this.orientation() == 'white' ? 'black' : 'white');
  }.bind(this);
};

module.exports = controller;
