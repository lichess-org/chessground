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
  var bounds = data.bounds;
  var orig = board.getKeyAtDomPos(data, position, bounds);
  var hadPremove = !!data.premovable.current;
  board.selectSquare(data, orig);
  var stillSelected = data.selected === orig;
  if (data.pieces[orig] && stillSelected && board.isDraggable(data, orig)) {
    var bpos = util.boardpos(util.key2pos(orig), data.orientation === 'white');
    data.draggable.current = {
      previouslySelected: previouslySelected,
      orig: orig,
      piece: hashPiece(data.pieces[orig]),
      rel: position,
      epos: position,
      pos: [0, 0],
      dec: [
        position[0] - (bounds.left + (bounds.width * bpos.left / 100) + (bounds.width * 0.25) / 2),
        position[1] - (bounds.top + bounds.height - (bounds.height * bpos.bottom / 100) + 10)
      ],
      bounds: bounds,
      started: false
    };
    draggingPiece = data.element.querySelector('.' + data.draggable.current.orig + ' > .cg-piece');
    hold.start();
  } else if (hadPremove) board.unsetPremove(data);
  data.renderRAF();
  processDrag(data, e);
}

function processDrag(data) {
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
        // render once for ghost and dragging style
        cur.started = true;
        data.renderRAF();
      }
      if (cur.started) {
        cur.pos = [
          cur.epos[0] - cur.rel[0],
          cur.epos[1] - cur.rel[1]
        ];

        // square target setup
        if (!cur.over) {
          cur.over = board.getKeyAtDomPos(data, cur.epos, cur.bounds);
          if (cur.over) {
            cur.prevTarget = cur.over;
            data.render();
            squareTarget = document.getElementById('cg-square-target');
          } else {
            squareTarget = null;
            data.render();
          }
        }
        cur.over = board.getKeyAtDomPos(data, cur.epos, cur.bounds);

        // move piece
        draggingPiece.style[util.transformProp()] = util.translate([
          cur.pos[0] + cur.dec[0],
          cur.pos[1] + cur.dec[1]
        ]);

        // move square target
        if (cur.over && squareTarget && cur.over !== cur.prevTarget) {
          var squareWidth = cur.bounds.width / 8,
            asWhite = data.orientation === 'white',
            stPos = util.key2pos(cur.over),
            vector = [
              (asWhite ? stPos[0] - 1 : 8 - stPos[0]) * squareWidth,
              (asWhite ? 8 - stPos[1] : stPos[1] - 1) * squareWidth
            ];
          squareTarget.style[util.transformProp()] = util.translate(vector);
          cur.prevTarget = cur.over;
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
  requestAnimationFrame(fixDraggingPieceElementAfterDrag);
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
  data.renderRAF();
}

function cancel(data) {
  requestAnimationFrame(fixDraggingPieceElementAfterDrag);
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
  processDrag: processDrag // must be exposed for board editors
};
