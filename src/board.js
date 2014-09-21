var pieces = require('./pieces');
var fen = require('./fen');

var defaults = {
  pieces: new pieces.Pieces(fen.read(fen.initial)),
  orientation: 'white',
  turnColor: 'white', // turn to play. white | black
  check: null, // square currently in check "a2" | nil
  lastMove: null, // squares part of the last move ["c3" "c4"] | nil
  selected: null, // square selected by the user "a1" | nil
  animation: {
    enabled: true,
    duration: 200
  },
  movable: {
    free: true, // all moves are valid - board editor
    color: 'both', // color that can move. white | black | both | nil
    dests: {}, // valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]} | nil
    dropOff: 'trash', // when a piece is dropped outside the board. "revert" | "trash"
    dropped: null, // last dropped dest, not to be animated
    // dragCenter: true, // whether to center the piece under the cursor on drag start
    events: {
      after: function(orig, dest) {} // called after the move has been played
    }
  },
  premovable: {
    enabled: true, // allow premoves for color that can not move
    current: null // keys of the current saved premove ["e2" "e4"] | nil
  },
  events: {
    change: function() {} // called after the situation changes on the board
  }
};

function callUserFunction(f) {
  setTimeout(f(), 20);
}

function setOrientation(color) {
  this.orientation = color;
}

function toggleOrientation() {
  setOrientation.call(this, this.orientation === 'white' ? 'black' : 'white');
}

function baseMove(orig, dest) {
  var success = this.pieces.move(orig, dest);
  if (success) {
    this.lastMove = [orig, dest];
    this.movable.dropped = null;
    this.check = null;
    callUserFunction(this.events.change);
  }
  return success;
}

function apiMove(orig, dest) {
  return baseMove.call(this, orig, dest);
}

function userMove(orig, dest) {
  if (baseMove.call(this, orig, dest)) {
    this.selected = null;
    callUserFunction(this.movable.events.after.bind(null, orig, dest));
  }
}

function selectSquare(key) {
  if (this.selected && canMove.call(this, this.selected, key))
    userMove.call(this, this.selected, key);
  else
    this.selected = key;
}

function canMove(orig, dest) {
  return orig !== dest && isMovable.call(this, orig) && (
    this.movable.free || _.contains(this.movable.dests, dest)
  );
}

function isMovable(orig) {
  var piece = this.pieces.get(orig);
  return piece && (
    this.movable.color === 'both' || (
      this.movable.color === piece.color &&
      this.movable.color === this.turnColor
    ));
}

module.exports = {
  defaults: defaults,
  setOrientation: setOrientation,
  toggleOrientation: toggleOrientation,
  selectSquare: selectSquare,
  apiMove: apiMove
};
