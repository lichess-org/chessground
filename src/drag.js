var board = require('./board');
var util = require('./util');
var m = require('mithril');

var originTarget;

function start(data, e) {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  originTarget = e.target;
  var position = util.eventPosition(e);
  var bounds = data.bounds();
  var orig = board.getKeyAtDomPos(data, position, bounds);
  board.selectSquare(data, orig);
  var stillSelected = data.selected === orig;
  if (data.pieces[orig] && stillSelected && board.isDraggable(data, orig)) {
    var pieceBounds = data.element.querySelector('.' + orig).getBoundingClientRect();
    data.draggable.current = {
      orig: orig,
      rel: position,
      epos: position,
      pos: [0, 0],
      dec: data.draggable.centerPiece ? [
        position[0] - (pieceBounds.left + pieceBounds.width / 2),
        position[1] - (pieceBounds.top + pieceBounds.height / 2)
      ] : [0, 0],
      bounds: bounds,
      started: false
    };
  }
  processDrag(data);
}

function processDrag(data) {
  requestAnimationFrame(function() {
    var cur = data.draggable.current;
    if (cur.orig) {
      // cancel animations while dragging
      if (data.animation.current.start &&
        Object.keys(data.animation.current.anims).indexOf(cur.orig) !== -1)
        data.animation.current = {};
      if (!cur.started && util.distance(cur.epos, cur.rel) >= data.draggable.distance)
        cur.started = true;
      if (cur.started) {
        cur.pos = [
          cur.epos[0] - cur.rel[0],
          cur.epos[1] - cur.rel[1]
        ];
        cur.over = board.getKeyAtDomPos(data, cur.epos, cur.bounds);
      }
    }
    data.render();
    if (cur.orig) processDrag(data);
  });
}

function move(data, e) {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only

  if (data.draggable.current.orig)
    data.draggable.current.epos = util.eventPosition(e);
}

function end(data, e) {
  var draggable = data.draggable;
  var orig = draggable.current ? draggable.current.orig : null;
  if (!orig) return;
  // comparing with the origin target is an easy way to test that the end event
  // has the same touch origin
  if (e.type === "touchend" && originTarget !== e.target) return;
  if (draggable.current.started) {
    dest = draggable.current.over;
    if (orig !== dest) data.movable.dropped = [orig, dest];
    board.userMove(data, orig, dest);
  }
  draggable.current = {};
}

module.exports = {
  start: start,
  move: move,
  end: end,
  processDrag: processDrag
};
