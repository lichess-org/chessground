var board = require('./board');
var util = require('./util');
var m = require('mithril');

function start(ctrl, e) {
  e.stopPropagation();
  e.preventDefault();
  var position = util.eventPosition(e);
  var bounds = ctrl.data.bounds();
  var orig = board.getKeyAtDomPos(ctrl.data, position, bounds);
  var piece = ctrl.data.pieces[orig];
  if (!piece || !board.isDraggable(ctrl.data, orig)) return;
  var pieceBounds = e.target.getBoundingClientRect();
  ctrl.data.draggable.current = {
    orig: orig,
    rel: position,
    pos: [0, 0],
    dec: [
      position[0] - (pieceBounds.left + pieceBounds.width / 2),
      position[1] - (pieceBounds.top + pieceBounds.height / 2)
    ],
    bounds: bounds
  };
}

function move(ctrl, e) {
  var cur = ctrl.data.draggable.current;
  if (!cur.orig) return;

  var position = util.eventPosition(e);

  cur.pos = [
    position[0] - cur.rel[0],
    position[1] - cur.rel[1]
  ];
  cur.over = board.getKeyAtDomPos(ctrl.data, position, cur.bounds);
  m.redraw();
}

function end(ctrl, e) {
  var draggable = ctrl.data.draggable;
  var orig = draggable.current.orig;
  if (!orig) return;
  dest = draggable.current.over;
  if (orig !== dest) ctrl.data.movable.dropped = dest;
  board.userMove(ctrl.data, orig, dest);
  draggable.current = {};
  m.redraw();
}

module.exports = {
  start: start,
  move: move,
  end: end
};
