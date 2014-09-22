var fen = require('./fen');
var pieces = require('./pieces');

module.exports = function(config) {

  _.merge(this, config);

  if (this.fen) {
    this.pieces = new pieces.Pieces(fen.read(this.fen));
    delete this.fen;
  }

  this.movable.dropped = null;
};
