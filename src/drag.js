var board = require('./board');
var util = require('./util');
var m = require('mithril');

function start(ctrl, e) {
  e.stopPropagation();
  e.preventDefault();
  if (!ctrl.data.render) return; // needs the DOM element
  var position = util.eventPosition(e);
  var bounds = ctrl.data.bounds();
  var orig = board.getKeyAtDomPos(ctrl.data, position, bounds);
  var piece = ctrl.data.pieces.get(orig);
  if (!piece || !board.isDraggable(ctrl.data, orig)) return;
  ctrl.data.draggable.current = {
    orig: orig,
    rel: position,
    pos: [0, 0],
    bounds: bounds,
    over: ctrl.data.animation.squareOverEnabled ? orig : null
  };
}

function move(ctrl, e) {
  var cur = ctrl.data.draggable.current;
  var position = util.eventPosition(e);

  if (cur.orig === undefined) return;

  cur.pos = [
    position[0] - cur.rel[0],
    position[1] - cur.rel[1]
  ];
  if (ctrl.data.animation.squareOverEnabled)
    cur.over = board.getKeyAtDomPos(ctrl.data, position, cur.bounds);
  m.redraw();
}

function end(ctrl, e) {
  var orig = ctrl.data.draggable.current.orig;
  if (!orig) return;
  dest = ctrl.data.draggable.current.over || board.getKeyAtDomPos(ctrl.data, util.eventPosition(e), ctrl.data.draggable.current.bounds);
  if (orig !== dest) ctrl.data.movable.dropped = dest;
  board.userMove(ctrl.data, orig, dest);
  ctrl.data.draggable.current = {};
  m.redraw();
}

module.exports = {
  start: start,
  move: move,
  end: end
};
