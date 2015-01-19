var util = require('./util');

var initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

var roles = {
  p: "pawn",
  r: "rook",
  n: "knight",
  b: "bishop",
  q: "queen",
  k: "king"
};

var letters = {
  pawn: "p",
  rook: "r",
  knight: "n",
  bishop: "b",
  queen: "q",
  king: "k"
};

function read(fen) {
  if (fen === 'start') fen = initial;
  var pieces = {};
  fen.replace(/ .+$/, '').split('/').forEach(function(row, y) {
    var x = 0;
    row.split('').forEach(function(v) {
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

function write(pieces) {
  return [8, 7, 6, 5, 4, 3, 2].reduce(
    function(str, nb) {
      return str.replace(new RegExp(Array(nb + 1).join('1'), 'g'), nb);
    },
    util.invRanks.map(function(y) {
      return util.ranks.map(function(x) {
        var piece = pieces[util.pos2key([x, y])];
        if (piece) {
          var letter = letters[piece.role];
          return piece.color === 'white' ? letter.toUpperCase() : letter;
        } else return '1';
      }).join('');
    }).join('/'));
}

module.exports = {
  initial: initial,
  read: read,
  write: write
};
