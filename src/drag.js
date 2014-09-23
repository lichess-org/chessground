var board = require('./board');
var util = require('./util');
var m = require('mithril');

function move(e) {
  this.draggable.current.pos = [
    e.clientX - this.draggable.current.rel[0],
    e.clientY - this.draggable.current.rel[1]
  ];
  this.draggable.current.over = board.getKeyAtDomPos.call(this, e.clientX, e.clientY);
  m.redraw();
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
  var orig = board.getKeyAtDomPos.call(this, e.clientX, e.clientY);
  var piece = this.pieces.get(orig);
  if (!piece || !board.isDraggable.call(this, orig)) return;
  this.draggable.current = {
    orig: orig,
    rel: [e.clientX, e.clientY],
    pos: [0, 0],
    over: orig,
    move: move.bind(this),
    end: end.bind(this)
  };
  board.setSelected.call(this, orig);
  document.addEventListener('mousemove', this.draggable.current.move);
  document.addEventListener('mouseup', this.draggable.current.end);
}
