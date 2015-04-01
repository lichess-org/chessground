var board = require('./board');
var util = require('./util');
var hold = require('./hold');

var originTarget;

// cache access to dom elements
var draggingPiece;
var squareTarget;

function hashPiece(piece) {
  return piece ? piece.color + ' ' + piece.role : '';
}

function fixDraggingPieceElementAfterDrag() {
  if (draggingPiece) {
    draggingPiece.classList.remove('dragging');
    draggingPiece.removeAttribute('style');
  }
  if (squareTarget && squareTarget.parentNode) {
    squareTarget.parentNode.removeChild(squareTarget);
  }
}

function start(data, e) {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  originTarget = e.target;
  var previouslySelected = data.selected;
  var position = util.eventPosition(e);
  var bounds = data.bounds();
  var orig = board.getKeyAtDomPos(data, position, bounds);
  var hadPremove = !!data.premovable.current;
  board.selectSquare(data, orig);
  var stillSelected = data.selected === orig;
  if (data.pieces[orig] && stillSelected && board.isDraggable(data, orig)) {
    var pieceBounds = data.element.querySelector('.' + orig).getBoundingClientRect();
    data.draggable.current = {
      previouslySelected: previouslySelected,
      orig: orig,
      piece: hashPiece(data.pieces[orig]),
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
    hold.start();
  } else if (hadPremove) board.unsetPremove(data);
  data.render();
  draggingPiece = data.element.querySelector('.' + data.draggable.current.orig + ' > .cg-piece');
  processDrag(data, e);
}

function processDrag(data, e) {
  var cur = data.draggable.current;
  if (cur.orig) {
    // cancel animations while dragging
    if (data.animation.current.start &&
      Object.keys(data.animation.current.anims).indexOf(cur.orig) !== -1)
      data.animation.current.start = false;

    // if moving piece is gone, cancel
    if (hashPiece(data.pieces[cur.orig]) !== cur.piece) cancel(data);
    else {
      if (!cur.started && util.distance(cur.epos, cur.rel) >= data.draggable.distance) {
        if (!cur.started) {
          // intended for mobile only: big pieces and position in top center
          if (data.draggable.squareTarget) {
            draggingPiece.style.width = '200%';
            draggingPiece.style.height = '200%';
            var pieceBounds = draggingPiece.getBoundingClientRect();
            var position = util.eventPosition(e);
            data.draggable.current.dec = data.draggable.centerPiece ? [
              position[0] - (pieceBounds.left + pieceBounds.width / 2),
              0
            ] : [0, 0];
          }
          cur.started = true;
          // render once for ghost and dragging style
          data.render();
        }
      }
      if (cur.started) {
        cur.pos = [
          cur.epos[0] - cur.rel[0],
          cur.epos[1] - cur.rel[1]
        ];
        // render once for square target
        if (!cur.over) {
          cur.over = board.getKeyAtDomPos(data, cur.epos, cur.bounds);
          data.render();
          squareTarget = document.getElementById('cg-square-target');
        }
        cur.over = board.getKeyAtDomPos(data, cur.epos, cur.bounds);

        // update dom live to avoid mithril costly rendering on each touchmove
        draggingPiece.style[util.transformProp()] = util.translate([
          cur.pos[0] + cur.dec[0],
          cur.pos[1] + cur.dec[1]
        ]);
        // only mobile board will render square target so this apply only to
        // mobile devices
        if (cur.over && squareTarget) {
          var stPos = util.key2pos(cur.over),
            stX = data.orientation === 'white' ? stPos[0] : 9 - stPos[0],
            stY = data.orientation === 'white' ? stPos[1] : 9 - stPos[1];
          squareTarget.style.left = (stX - 1.5) * cur.bounds.width / 8 + 'px';
          squareTarget.style.top = (7.5 - stY) * cur.bounds.height / 8 + 'px';
        }
      }
    }
  }
}

function move(data, e) {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only

  if (data.draggable.current.orig) {
    data.draggable.current.epos = util.eventPosition(e);
    processDrag(data, e);
  }
}

function end(data, e) {
  var draggable = data.draggable;
  var orig = draggable.current ? draggable.current.orig : null;
  var dest;
  fixDraggingPieceElementAfterDrag();
  if (!orig) return;
  // comparing with the origin target is an easy way to test that the end event
  // has the same touch origin
  if (e && e.type === "touchend" && originTarget !== e.target) return;
  board.unsetPremove(data);
  if (draggable.current.started) {
    dest = draggable.current.over;
    if (orig !== dest) data.movable.dropped = [orig, dest];
    board.userMove(data, orig, dest);
  } else if (draggable.current.previouslySelected === orig) {
    board.setSelected(data, null);
  }
  draggable.current = {};
  data.render();
}

function cancel(data) {
  fixDraggingPieceElementAfterDrag();
  if (data.draggable.current.orig) {
    data.draggable.current = {};
    board.selectSquare(data, null);
  }
}

module.exports = {
  start: start,
  move: move,
  end: end,
  cancel: cancel,
  processDrag: processDrag
};
