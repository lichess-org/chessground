## ChessGround - multipurpose chess UI.

Chessground targets all modern browsers, as well as mobile development using Cordova.

See it in action on [lichess.org board editor](http://lichess.org/editor)
and [lichess.org puzzle solver](http://lichess.org/training).

Note that Chessground is only the UI, and has no knowledge of the rules of chess.
You have to feed it with the correct moves using backend or frontend chess logic.

#### Dependencies

- [lodash-node](https://github.com/lodash/lodash-node) - just a handful of selected functions, not the whole thing
- [mithril.js](https://github.com/lhorie/mithril.js) - a pretty awesome virtual DOM library

### Installation

```
npm install --save git://github.com/ornicar/chessground.git
```

### Usage

```js
var Chessground = require("chessground");

var ground = Chessground(document.body, options);
```

### Options

All options are, well, optional.

```js
{
  orientation: "white",         // board orientation (or view angle) "white" | "black"
  turnColor: "white",           // turn to play. "white" | "black"
  check: null,                  // square currently in check "a2" | null
  lastMove: null,               // squares part of the last move ["c3", "c4"] | null
  selected: null,               // square currently selected "a1" | null
  animation: {
    enabled: true,              // enable piece animations, moving and fading
    duration: 200,              // animation duration in milliseconds
  },
  movable: {
    free: true,                 // all moves are valid - board editor
    color: "both",              // color that can move. "white" | "black" | "both" | null
    dests: {},                  // valid moves. {a2: ["a3", "a4"], b1: ["a3", "c3"]} | null
    dropOff: "revert",          // when a piece is dropped outside the board. "revert" | "trash"
    events: {
      after: function(orig, dest) {} // called after the move has been played
    }
  },
  premovable: {
    enabled: true,              // allow premoves for color that can not move
    current: null               // keys of the current saved premove ["e2", "e4"] | null
  },
  draggable: {
    enabled: true,              // allow moves & premoves to use drag'n drop
    distance: 3,                // minimum distance to initiate a drag, in pixels
    squareTarget: false,        // display big square target; intended for mobile
    centerPiece: true,          // center the piece on cursor at drag start
    showGhost: true,            // show ghost of piece being dragged
  },
  events: {
    change: function() {}       // called after the situation changes on the board
  }
}
```

### A.P.I.

There are a few functions you can call on a Chessground instance:

```js
var ground = Chessground(document.body, options);

// reconfigure the instance. Accepts all options mentioned above.
// board will be animated accordingly, if animations are enabled.
ground.set(options);

// change the view angle
ground.toggleOrientation();

// get the view angle
var orientation = ground.getOrientation();

// get pieces on the board
// {a1: {color: "white", role: "rook"}, b1: {color: "white", role: "knight"}}
var pieces = ground.getPieces();

// get the current FEN position
// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
var fen = ground.getFen();

// perform a move programmatically
ground.move("e2", "e4");

// add and/or remove arbitrary pieces on the board
ground.setPieces({a1: null, c5: {color: "black", role: "queen"}});

// play the current premove, if any
ground.playPremove();
```
