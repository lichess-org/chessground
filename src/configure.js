var fen = require('./fen');
var pieces = require('./pieces');

module.exports = function(board, config) {

  _.merge(board, config);

  if (board.fen) {
    board.pieces = new pieces.Pieces(fen.read(board.fen));
    delete board.fen;
  }

  board.movable.dropped = null;
};
