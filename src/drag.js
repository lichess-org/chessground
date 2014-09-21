var board = require('./board');
var util = require('./util');

function start(e) {
  var square = e.target.parentNode;
  var orig = square.getAttribute('data-key');
  var piece = this.pieces.get(orig);
  if (!piece || !board.isDraggable.call(this, orig)) return;
  this.draggable.current = {
    orig: orig,
    bounds: square.parentNode.getBoundingClientRect(),
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

function move(e) {
  this.draggable.current.pos = [
    e.pageX - this.draggable.current.rel[0],
    e.pageY - this.draggable.current.rel[1]
  ];
  this.draggable.current.over = overKey.call(this, e);
  m.redraw();
}

function overKey(e) {
  var bounds = this.draggable.current.bounds;
  var file = Math.ceil(8 * ((e.pageX - bounds.left) / bounds.width));
  file = this.orientation === 'white' ? file : 9 - file;
  var rank = Math.ceil(8 - (8 * ((e.pageY - bounds.top) / bounds.height)));
  rank = this.orientation === 'white' ? rank : 9 - rank;
  if (file > 0 && file < 9 && rank > 0 && rank < 9) return util.pos2key([file, rank]);
}

function end(e) {
  document.removeEventListener('mousemove', this.draggable.current.move);
  document.removeEventListener('mouseup', this.draggable.current.end);
  board.userMove.call(this, this.draggable.current.orig, this.draggable.current.over);
  this.draggable.current = {};
  m.redraw();
}

module.exports = {
  start: start
};
