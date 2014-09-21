var board = require('./board');
var pieces = require('./pieces');
var fen = require('./fen');
var util = require('./util');

var controller = function() {

  this.board = board.defaults;

  this.setOrientation = board.setOrientation.bind(this.board);
  this.toggleOrientation = board.toggleOrientation.bind(this.board);

  this.setPieces = this.board.pieces.set.bind(this.board.pieces);

  this.selectSquare = board.selectSquare.bind(this.board);

  this.apiMove = board.apiMove.bind(this.board);
};

module.exports = controller;
