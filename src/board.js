var partial = require('lodash-node/modern/functions/partial');
var util = require('./util');
var premove = require('./premove');
var anim = require('./anim');

function callUserFunction(f) {
  setTimeout(f, 20);
}

function toggleOrientation(board) {
  board.orientation = util.opposite(board.orientation);
}

function setPieces(board, pieces) {
  board.pieces.set(pieces);
  board.movable.dropped = null;
}

function baseMove(board, orig, dest) {
  var success = anim(board, function() {
    var success = board.pieces.move(orig, dest);
    if (success) {
      board.lastMove = [orig, dest];
      board.check = null;
      callUserFunction(board.events.change);
    }
    return success;
  })();
  if (success) board.movable.dropped = null;
  return success;
}

function apiMove(board, orig, dest) {
  return baseMove(board, orig, dest);
}

function userMove(board, orig, dest) {
  if (!dest) {
    setSelected(board, null);
    if (board.movable.dropOff === 'trash') {
      board.pieces.remove(orig);
      callUserFunction(board.events.change);
    }
  } else if (canMove(board, orig, dest)) {
    if (baseMove(board, orig, dest)) {
      setSelected(board, null);
      callUserFunction(partial(board.movable.events.after, orig, dest));
    }
  } else if (canPremove(board, orig, dest)) {
    board.premovable.current = [orig, dest];
    setSelected(board, null);
  } else if (isMovable(board, dest) || isPremovable(board, dest))
    setSelected(board, dest);
  else setSelected(board, null);
}

function selectSquare(board, key) {
  if (board.selected) {
    if (board.selected !== key) userMove(board, board.selected, key)
  } else if (isMovable(board, key) || isPremovable(board, key))
    setSelected(board, key);
}

function setSelected(board, key) {
  board.selected = key;
  if (key && isPremovable(board, key))
    board.premovable.dests = premove(board.pieces, key);
  else
    board.premovable.dests = null;
}

function isMovable(board, orig) {
  var piece = board.pieces.get(orig);
  return piece && (
    board.movable.color === 'both' || (
      board.movable.color === piece.color &&
      board.turnColor === piece.color
    ));
}

function canMove(board, orig, dest) {
  return orig !== dest && isMovable(board, orig) && (
    board.movable.free || util.containsX(board.movable.dests[orig], dest)
  );
}

function isPremovable(board, orig) {
  var piece = board.pieces.get(orig);
  return piece && board.premovable.enabled && (
    board.movable.color === piece.color &&
    board.turnColor !== piece.color
  );
}

function canPremove(board, orig, dest) {
  return orig !== dest &&
    isPremovable(board, orig) &&
    util.containsX(premove(board.pieces, orig), dest);
}

function isDraggable(board, orig) {
  var piece = board.pieces.get(orig);
  return piece && board.draggable.enabled && (
    board.movable.color === 'both' || (
      board.movable.color === piece.color && (
        board.turnColor === piece.color || board.premovable.enabled
      )
    )
  );
}

function playPremove(board) {
  var move = board.premovable.current;
  if (move) {
    var orig = move[0],
      dest = move[1];
    if (canMove(board, orig, dest)) {
      if (baseMove(board, orig, dest)) {
        callUserFunction(partial(board.movable.events.after, orig, dest));
      }
    }
    board.premovable.current = null;
  }
}

function getKeyAtDomPos(board, pos, bounds) {
  if (!bounds && !board.bounds) return;
  bounds = bounds || board.bounds(); // use provided value, or compute it
  var file = Math.ceil(8 * ((pos[0] - bounds.left) / bounds.width));
  file = board.orientation === 'white' ? file : 9 - file;
  var rank = Math.ceil(8 - (8 * ((pos[1] - bounds.top) / bounds.height)));
  rank = board.orientation === 'white' ? rank : 9 - rank;
  if (file > 0 && file < 9 && rank > 0 && rank < 9) return util.pos2key([file, rank]);
}

module.exports = {
  toggleOrientation: toggleOrientation,
  setPieces: setPieces,
  selectSquare: selectSquare,
  setSelected: setSelected,
  isDraggable: isDraggable,
  canMove: canMove,
  userMove: userMove,
  apiMove: apiMove,
  playPremove: playPremove,
  getKeyAtDomPos: getKeyAtDomPos
};
