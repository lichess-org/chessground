var isEmpty = require('lodash-node/modern/objects/isEmpty')
var board = require('./board');
var util = require('./util');
var m = require('mithril');

function move(e) {
  if (isEmpty(this.draggable.current)) return;
  var position = util.eventPosition(e);
  console.log('move', position);
  this.draggable.current.pos = [
    position[0] - this.draggable.current.rel[0],
    position[1] - this.draggable.current.rel[1]
  ];
  this.draggable.current.isDragging = true;
  this.draggable.current.over = board.getKeyAtDomPos.call(this, position);
  this.render();
}

function end(e) {
  console.log('end');
  var orig = this.draggable.current.orig,
  dest = this.draggable.current.over;
  if (orig !== dest) this.movable.dropped = dest;
  board.userMove.call(this, orig, dest);
  this.draggable.current = {};
  m.redraw();
}

function start(e) {
  e.stopPropagation();
  e.preventDefault();
  if (!this.render) return; // needs the DOM element
  var position = util.eventPosition(e);
  var square = e.target.parentNode;
  var orig = board.getKeyAtDomPos.call(this, position);
  var piece = this.pieces.get(orig);
  if (!piece || !board.isDraggable.call(this, orig)) return;
  this.draggable.current = {
    isDragging: false,
    orig: orig,
    rel: position,
    pos: [0, 0],
    over: orig
  };
}

module.exports = {
  start: start,
  move: move,
  end: end
};


