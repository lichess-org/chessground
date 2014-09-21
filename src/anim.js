var util = require('./util');

function makePiece(k, piece, invert) {
  var key = invert ? util.invertKey(k) : k;
  return {
    key: key,
    pos: util.key2pos(key),
    role: piece.role,
    color: piece.color
  };
}

function samePiece(p1, p2) {
  return p1.role === p2.role && p1.color === p2.color;
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.pos[0] - p2.pos[0], 2) + Math.pow(p1.pos[1] - p2.pos[1], 2));
}

function closer(piece, pieces) {
  return pieces.sort(function(p1, p2) {
    return distance(piece, p1) - distance(piece, p2);
  })[0];
}

function compute(prev, current) {
  var anims = {};
  if (prev.pieces) {
    var missings = [],
      news = [],
      invert = prev.orientation !== current.orientation,
      prePieces = {};
    util.allKeys.forEach(function(k) {
      if (prev.pieces[k]) {
        var piece = makePiece(k, prev.pieces[k], invert);
        prePieces[piece.key] = piece;
      }
    });
    util.allKeys.forEach(function(k) {
      if (k !== current.movable.dropped) {
        var curP = current.pieces.get(k);
        var preP = prePieces[k];
        if (curP) {
          if (preP) {
            if (!samePiece(curP, preP)) {
              missings.push(preP);
              news.push(makePiece(k, curP, false));
            }
          } else
            news.push(makePiece(k, curP, false));
        } else if (preP)
          missings.push(preP);
      }
    });
    news.forEach(function(newP) {
      var preP = closer(newP, missings.filter(samePiece.bind(null, newP)));
      if (preP) {
        anims[newP.key] = {
          orig: current.orientation === 'white' ? preP.pos : newP.pos,
          dest: current.orientation === 'white' ? newP.pos : preP.pos,
          duration: current.animation.duration
        };
      }
    });
  }
  return anims;
}

module.exports = function(prev, current) {
  if (current.animation.enabled && prev.pieces) {
    var anims = compute(prev, current);
  }
  prev.orientation = current.orientation;
  prev.pieces = _.clone(current.pieces.all, true);
};
