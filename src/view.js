var util = require('./util');
var board = require('./board');
var drag = require('./drag');
var anim = require('./anim');

function renderPiece(ctrl, key, p) {
  var attrs = {
    class: ['cg-piece', p.role, p.color].join(' ')
  };
  if (ctrl.board.draggable.current.orig === key) {
    attrs.style = {
      webkitTransform: util.translate(ctrl.board.draggable.current.pos)
    }
    attrs.class = attrs.class + ' dragging';
  }
  return {
    tag: 'div',
    attrs: attrs
  };
}

function renderSquare(ctrl, pos) {
  var styleX = (pos[0] - 1) * 12.5 + '%';
  var styleY = (pos[1] - 1) * 12.5 + '%';
  var file = util.files[pos[0] - 1];
  var rank = pos[1];
  var key = file + rank;
  var piece = ctrl.board.pieces.get(key);
  var attrs = {
    class: util.classSet({
      'cg-square': true,
      'selected': ctrl.board.selected === key,
      'check': ctrl.board.check === key,
      'last-move': _.contains(ctrl.board.lastMove, key),
      'move-dest': _.contains(ctrl.board.movable.dests[ctrl.board.selected], key),
      'premove-dest': _.contains(ctrl.board.premovable.dests, key),
      'current-premove': _.contains(ctrl.board.premovable.current, key),
      'drag-over': ctrl.board.draggable.current.over === key
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
  if (pos[1] === (ctrl.board.orientation === 'white' ? 1 : 8)) attrs['data-coord-x'] = file;
  if (pos[0] === (ctrl.board.orientation === 'white' ? 8 : 1)) attrs['data-coord-y'] = rank;
  return {
    tag: 'div',
    attrs: attrs,
    children: piece ? renderPiece(ctrl, key, piece) : null
  };
}

module.exports = function(ctrl) {
  return m('div.cg-board', {
      config: function(el, isInit, context) {
        anim(context, ctrl.board);
      },
      onclick: function(e) {
        var key = e.target.getAttribute('data-key') || e.target.parentNode.getAttribute('data-key');
        ctrl.selectSquare(key);
      },
      onmousedown: drag.start.bind(ctrl.board)
    },
    util.allPos.map(function(pos) {
      return renderSquare(ctrl, pos);
    })
  );
}
