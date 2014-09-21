var util = require('./util');
var _ = require('lodash');

function renderPiece(p) {
  return m('div', {
    class: ['cg-piece', p.role, p.color].join(' ')
  });
}

function renderSquare(ctrl, x, y) {
  var styleX = (x - 1) * 12.5 + '%';
  var styleY = (y - 1) * 12.5 + '%';
  var file = util.files[x - 1];
  var rank = y;
  var key = file + rank;
  var piece = ctrl.board.pieces.get(key);
  var attrs = {
    class: util.classSet({
      'cg-square': true,
      'selected': ctrl.board.selected === key,
      'check': false,
      'last-move': _.contains(ctrl.board.lastMove, key),
      'move-dest': false,
      'premove-dest': false,
      'current-premove': false,
      'drag-over': false
    }),
    style: ctrl.board.orientation === 'white' ? {
      left: styleX,
      bottom: styleY
    } : {
      right: styleX,
      top: styleY
    },
    'data-key': key
  };
  if (y === (ctrl.board.orientation === 'white' ? 1 : 8)) attrs['data-coord-x'] = file;
  if (x === (ctrl.board.orientation === 'white' ? 8 : 1)) attrs['data-coord-y'] = rank;
  return {
    tag: 'div',
    attrs: attrs,
    children: piece ? renderPiece(piece) : null
  };
}

module.exports = function(ctrl) {
  return m('div.cg-board', {
      onclick: function(e) {
        var key = e.toElement.getAttribute('data-key') || e.toElement.parentNode.getAttribute('data-key');
        ctrl.selectSquare(key);
      }
    },
    _.flatten(
      _.map(util.ranks, function(y) {
        return _.map(util.ranks, function(x) {
          return renderSquare(ctrl, x, y);
        });
      })
    ));
}
