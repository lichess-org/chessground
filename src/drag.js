var board = require('./board');
var util = require('./util');
var m = require('mithril');

function start(ctrl, e) {
  e.stopPropagation();
  e.preventDefault();
  if (!ctrl.board.render) return; // needs the DOM element
  var position = util.eventPosition(e);
  var bounds = ctrl.board.bounds();
  var orig = board.getKeyAtDomPos.call(ctrl.board, position, bounds);
  var piece = ctrl.board.pieces.get(orig);
  if (!piece || !board.isDraggable.call(ctrl.board, orig)) return;
  ctrl.board.draggable.current = {
    orig: orig,
    rel: position,
    pos: [0, 0],
    bounds: bounds,
    over: ctrl.board.animation.squareOverEnabled ? orig : null
  };
}

function move(ctrl, e) {
  var cur = ctrl.board.draggable.current;
  var position = util.eventPosition(e);

  if (cur.orig === undefined) return;

  cur.pos = [
    position[0] - cur.rel[0],
    position[1] - cur.rel[1]
  ];
  if (ctrl.board.animation.squareOverEnabled)
    cur.over = board.getKeyAtDomPos.call(ctrl.board, position, cur.bounds);
  ctrl.board.render();
}

function end(ctrl, e) {
  if (ctrl.board.draggable.current.orig === undefined) return;
  var orig = ctrl.board.draggable.current.orig,
  dest = ctrl.board.draggable.current.over;
  if (orig !== dest) ctrl.board.movable.dropped = dest;
  board.userMove.call(ctrl.board, orig, dest);
  ctrl.board.draggable.current = {};
  m.redraw();
}

module.exports = {
  start: start,
  move: move,
  end: end
};
