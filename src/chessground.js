var chessground = chessground || {};
var cg = chessground;
var pp = function(x) {
  console.log(x);
  return x;
};

// util

cg.util = {};

cg.util.files = "abcdefgh".split('');
cg.util.ranks = _.range(1, 9);
cg.util.pos2key = function(pos) { return cg.util.files[pos[0] - 1] + pos[1]; }
cg.util.classSet = function(classNames) {
  return Object.keys(classNames).filter(function(className) {
    return classNames[className];
  }).join(' ');
}
cg.fen.read = function(fen) {
  fen = fen.replace(/ .+$/, '');
  var rows = fen.split('/');
  var pieces = {};
  var y = 8;
  for (var i = 0; i < 8; i++) {
    var row = rows[i].split('');
    var colIndex = 0;
    for (var j = 0; j < row.length; j++) {
      var nb = parseInt(row[j]);
      if (nb) colIndex += nb;
      else {
        pieces[cg.util.pos2key([
        var square = COLUMNS[colIndex] + currentRow;
        position[square] = fenToPieceCode(row[j]);
        colIndex++;
      }
    }

    currentRow--;
  }

  return position;
}

// model

cg.model = {};

cg.model.Piece = function(data) {
  this.role = m.prop(data.role);
  this.color = m.prop(data.color);
};

// {a1: {role: 'rook', color: 'white'}, ...}
cg.model.Pieces = Object;

// cg.model.Board = function(data) {
//   this.pieces = m.prop(data.pieces);
//   this.orientation = m.prop(data.orientation);
// };

// controller

cg.controller = function() {
  this.pieces = new cg.model.Pieces({
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

// view

cg.tpl = {};

cg.tpl.piece = function(p) {
  return m('div', {
    class: ['cg-piece', p.role, p.color].join(' ')
  });
};

cg.tpl.square = function(ctrl, x, y, asWhite) {
  var styleX = (x - 1) * 12.5 + '%';
  var styleY = (y - 1) * 12.5 + '%';
  var file = cg.util.files[x - 1];
  var rank = y;
  var key = file + rank;
  var attrs = {
    class: cg.util.classSet({
      'cg-square': true,
      'selected': false,
      'check': false,
      'last-move': false,
      'move-dest': false,
      'premove-dest': false,
      'current-premove': false,
      'drag-over': false
    }),
    style: asWhite ? {
      left: styleX,
      bottom: styleY
    } : {
      right: styleX,
      top: styleY
    },
    'data-key': key
  };
  if (y === (asWhite ? 1 : 8)) attrs['data-coord-x'] = file;
  if (x === (asWhite ? 8 : 1)) attrs['data-coord-y'] = rank;
  return {
    tag: 'div',
    attrs: attrs,
    children: ctrl.pieces[key] ? cg.tpl.piece(ctrl.pieces[key]) : null
  };
};

cg.view = function(ctrl) {
  var asWhite = ctrl.orientation() === 'white';
  return m('div.cg-board', {
      onclick: ctrl.toggleOrientation
    },
    _.flatten(
      _.map(cg.util.ranks, function(y) {
        return _.map(cg.util.ranks, function(x) {
          return cg.tpl.square(ctrl, x, y, asWhite);
        })
      })
    ));
};
