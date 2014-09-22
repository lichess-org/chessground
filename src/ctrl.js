var board = require('./board');
var configure = require('./configure');
var anim = require('./anim');

module.exports = function(cfg) {

  this.board = board.defaults();

  this.reconfigure = anim(this.board, configure.bind(null, this.board));

  if (cfg) this.reconfigure(cfg);

  this.toggleOrientation = board.toggleOrientation.bind(this.board);

  this.setPieces = board.setPieces.bind(this.board);

  this.selectSquare = anim(this.board, board.selectSquare);

  this.apiMove = board.apiMove.bind(this.board);

  this.playPremove = board.playPremove.bind(this.board);
};
