var _ = require('lodash');
var util = require('./util');

var initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

var roles = {
  p: "pawn",
  r: "rook",
  n: "knight",
  b: "bishop",
  q: "queen",
  k: "king"
};

function read(fen) {
  fen = fen.replace(/ .+$/, '');
  var rows = fen.split('/');
  var pieces = {};
  _.forEach(fen.replace(/ .+$/, '').split('/'), function(row, y) {
    var x = 0;
    _.forEach(row, function(v, x) {
      var nb = parseInt(v);
      if (nb) x += nb;
      else {
        x++;
        pieces[util.pos2key([x, 8 - y])] = {
          role: roles[v.toLowerCase()],
          color: v === v.toLowerCase() ? 'black' : 'white'
        };
      }
    });
  });

  return pieces;
}

module.exports = {
  initial: initial,
  read: read
};
