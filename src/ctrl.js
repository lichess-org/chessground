var model = require('./model');
var fen = require('./fen');
var util = require('./util');

var controller = function() {
  this.pieces = new model.Pieces(fen.read(fen.initial));
  this.orientation = m.prop('white');
  this.toggleOrientation = function() {
    this.orientation(this.orientation() == 'white' ? 'black' : 'white');
  }.bind(this);
};

module.exports = controller;
