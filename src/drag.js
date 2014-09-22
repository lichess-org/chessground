var board = require('./board');
var util = require('./util');

function move(e) {
  this.draggable.current.pos = [
    e.pageX - this.draggable.current.rel[0],
    e.pageY - this.draggable.current.rel[1]
  ];
  this.draggable.current.over = overKey(this.orientation, this.draggable.current.bounds, e);
  m.redraw();
}

// which key (a1, a2) is this event happening on, based on cached board DOM bounds?
function overKey(orientation, bounds, e) {
  var file = Math.ceil(8 * ((e.pageX - bounds.left) / bounds.width));
  file = orientation === 'white' ? file : 9 - file;
  var rank = Math.ceil(8 - (8 * ((e.pageY - bounds.top) / bounds.height)));
  rank = orientation === 'white' ? rank : 9 - rank;
  if (file > 0 && file < 9 && rank > 0 && rank < 9) return util.pos2key([file, rank]);
}

function end(e) {
  document.removeEventListener('mousemove', this.draggable.current.move);
  document.removeEventListener('mouseup', this.draggable.current.end);
  var orig = this.draggable.current.orig,
  dest = this.draggable.current.over;
  if (orig !== dest) this.movable.dropped = dest;
  board.userMove.call(this, orig, dest);
  this.draggable.current = {};
  m.redraw();
}

module.exports = function(e) {
  e.stopPropagation();
  e.preventDefault();
  if (e.button !== 0) return; // only left click
  var square = e.target.parentNode;
  var bounds = square.parentNode.getBoundingClientRect();
  var orig = overKey(this.orientation, bounds, e);
  var piece = this.pieces.get(orig);
  if (!piece || !board.isDraggable.call(this, orig)) return;
  this.draggable.current = {
    orig: orig,
    bounds: bounds,
    rel: [e.pageX, e.pageY],
    pos: [0, 0],
    over: orig,
    move: move.bind(this),
    end: end.bind(this)
  };
  board.setSelected.call(this, orig);
  document.addEventListener('mousemove', this.draggable.current.move);
  document.addEventListener('mouseup', this.draggable.current.end);
}
