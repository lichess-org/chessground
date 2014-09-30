var board = require('./board');
var data = require('./data');
var fen = require('./fen');
var configure = require('./configure');
var anim = require('./anim');
var util = require('./util');

module.exports = function(cfg) {

  this.data = data(cfg);

  this.getFen = function() {
    return fen.write(this.data.pieces);
  }.bind(this);

  this.reconfigure = anim(configure, this.data);

  this.reset = util.partial(board.reset, this.data);

  this.toggleOrientation = anim(board.toggleOrientation, this.data);

  this.setPieces = anim(board.setPieces, this.data);

  this.selectSquare = util.partial(board.selectSquare, this.data);

  this.apiMove = anim(board.apiMove, this.data);

  this.playPremove = anim(board.playPremove, this.data);
};
