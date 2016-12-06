<img src="https://raw.githubusercontent.com/ornicar/chessground/master/screenshot/3d.png" width=512 height=512 alt="Chessground in 3D mode" />

**Chessground** is the opensource chess UI developed for [lichess.org](http://lichess.org).

It targets modern browsers, as well as mobile development using Cordova.

### Demos

- [Chess TV](http://lichess.org/tv)
- [Board editor](http://lichess.org/editor)
- [Puzzle solver](http://lichess.org/training)
- [Analysis board](http://lichess.org/ofWXRFGy)
- [Game preview](http://lichess.org/games)
- [Chess Captcha](http://lichess.org/signup)

## Features

Chessground is designed to fulfill all lichess.org web and mobile apps needs, so it is pretty featureful.

- Fast. Uses virtual DOM; runs smoothly even on elder mobile phones
- Small footprint: 12K gzipped (35K unzipped) including dependencies
- Standalone, or composable as a mithril.js module
- Entirely configurable and reconfigurable at any time
- Styling with CSS: board and pieces can be changed by simply switching a class
- Fluid layout: board can be resized at any time
- Support for 3D pieces and boards
- Full mobile support (touchstart, touchmove, touchend)
- Move pieces by click
- Move pieces by drag'n drop
  - minimum distance before drag
  - centralisation of the piece under the cursor
  - square target element for mobile
  - piece ghost
  - drop off revert or trash
- Premove by click or drag
- Animation of pieces: moving and fading away
- Display last move, check, move destinations, and premove destinations
- SVG drawing of circles and arrows on the board
- Import and export positions in FEN notation
- User callbacks
- No chess logic inside: can be used for chess variations

### Dependencies

- [mithril.js](https://github.com/lhorie/mithril.js) - a minimalist virtual DOM library

## Installation

```
npm install --save chessground
```

### Usage

```js
var Chessground = require("chessground");

var ground = Chessground(document.body, options);
```

## Options

All options are, well, optional.

```js
{
  fen: '2r3k1/pp2Qpbp/4b1p1/3p4/3n1PP1/2N4P/Pq6/R2K1B1R w -', // or leave null for initial position
  orientation: "white",   // board orientation (or view angle) "white" | "black"
  turnColor: "white",     // turn to play. "white" | "black"
  check: null,            // square currently in check "a2" | null
  lastMove: null,         // squares part of the last move ["c3", "c4"] | null
  selected: null,         // square currently selected "a1" | null
  coordinates: true,      // display board coordinates as square ::after elements
  viewOnly: false,        // don't bind events: the user will never be able to move pieces around
  minimalDom: false,      // don't use square elements. Optimization to use only with viewOnly
  disableContextMenu: false
  highlight: {
    lastMove: true,       // add last-move class to squares
    check: true,          // add check class to squares
    dragOver: true        // add drag-over class to square when dragging over it
  },
  animation: {
    enabled: true,        // enable piece animations, moving and fading
    duration: 200,        // animation duration in milliseconds
  },
  movable: {
    free: true,           // all moves are valid - board editor
    color: "both",        // color that can move. "white" | "black" | "both" | null
    dests: {},            // valid moves. {a2: ["a3", "a4"], b1: ["a3", "c3"]} | null
    dropOff: "revert",    // when a piece is dropped outside the board. "revert" | "trash"
    showDests: true,      // add the move-dest class to squares
    events: {
                          // called after the move has been played
      after: function(orig, dest, metadata) {}
    }
  },
  premovable: {
    enabled: true,        // allow premoves for color that can not move
    showDests: true,      // add the premove-dest class to squares
    current: null         // keys of the current saved premove ["e2", "e4"] | null
      events: {
                          // called after the premove has been set
        set: function(orig, dest) {},
                          // called after the premove has been unset
        unset: function() {}
      }
  },
  draggable: {
    enabled: true,        // allow moves & premoves to use drag'n drop
    distance: 3,          // minimum distance to initiate a drag, in pixels
    squareTarget: false,  // display big square target; intended for mobile
    centerPiece: true,    // center the piece on cursor at drag start
    showGhost: true,      // show ghost of piece being dragged
  },
  selectable: {
    enabled: true         // disable to enforce dragging over click-click move
  },
  drawable: {
    enabled: true         // enable SVG circle and arrow drawing on the board
  },
  events: {
    change: function() {},   // called after the situation changes on the board
    // called after a piece has been moved.
    // capturedPiece is null or like {color: 'white', 'role': 'queen'}
    move: function(orig, dest, capturedPiece) {},
    select: function(key) {} // called when a square is selected
  }
}
```

## A.P.I.

There are a few functions you can call on a Chessground instance:

### Setters

```js
// reconfigure the instance. Accepts all options mentioned above (bar "viewOnly" & "minimalDom").
// board will be animated accordingly, if animations are enabled.
ground.set(options);

// sets the king of this color in check
// if no color is provided, the current turn color is used
ground.setCheck(color);

// change the view angle
ground.toggleOrientation();

// perform a move programmatically
ground.move("e2", "e4");

// add and/or remove arbitrary pieces on the board
ground.setPieces({a1: null, c5: {color: "black", role: "queen"}});

// play the current premove, if any
ground.playPremove();

// cancel the current premove, if any
ground.cancelPremove();

// cancel the current move being made
ground.cancelMove();

// cancels current move and prevent further ones
ground.stop();
```

### Getters

```js
// get the view angle
var orientation = ground.getOrientation();

// get pieces on the board
// {a1: {color: "white", role: "rook"}, b1: {color: "white", role: "knight"}}
var pieces = ground.getPieces();

// get the material difference between white and black
// {white: {pawn: 3 queen: 1}, black: {bishop: 2}}
var diff = ground.getMaterialDiff();

// get the current FEN position
// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
var fen = ground.getFen();

// get the current orientation
var orientation = ground.getOrientation();
```

## Developers

### Build

```
npm install
gulp
```

Then open `examples/index.html` in your browser.
The examples are non exhaustive, but feel free to try things out by editing `index.html`.
