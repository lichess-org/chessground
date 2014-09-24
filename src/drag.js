var board = require('./board');
var util = require('./util');
var m = require('mithril');

function move(e) {
  var position = util.eventPosition(e);
  this.draggable.current.pos = [
    position[0] - this.draggable.current.rel[0],
    position[1] - this.draggable.current.rel[1]
  ];
  this.draggable.current.over = board.getKeyAtDomPos.call(this, position);
  this.render();
}

function end(e) {
  document.removeEventListener(util.isTouchDevice() ? 'touchmove' : 'mousemove', this.draggable.current.move);
  document.removeEventListener(util.isTouchDevice() ? 'touchend' : 'mouseup', this.draggable.current.end);
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
  if (!this.render) return; // needs the DOM element
  var position = util.eventPosition(e);
  var square = e.target.parentNode;
  var orig = board.getKeyAtDomPos.call(this, position);
  var piece = this.pieces.get(orig);
  if (!piece || !board.isDraggable.call(this, orig)) return;
  this.draggable.current = {
    orig: orig,
    rel: position,
    pos: [0, 0],
    over: orig,
    move: move.bind(this),
    end: end.bind(this)
  };
  board.setSelected.call(this, orig);
  document.addEventListener(util.isTouchDevice() ? 'touchmove' : 'mousemove', this.draggable.current.move);
  document.addEventListener(util.isTouchDevice() ? 'touchend' : 'mouseup', this.draggable.current.end);
};
