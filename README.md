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

- [Typed](https://github.com/ornicar/chessground/tree/master/src/dts) with typescript
- Fast. Uses virtual DOM; runs smoothly even on elder mobile phones
- Small footprint: 12K gzipped (35K unzipped) including dependencies
- Standalone, or composable as a [snabbdom](https://github.com/snabbdom/snabbdom) node
- Entirely configurable and reconfigurable at any time
- Styling with CSS only: board and pieces can be changed by simply switching a class
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

- [snabbdom](https://github.com/snabbdom/snabbdom) - a minimalist virtual DOM library

## Installation

```
npm install --save chessground
```

### Usage

```js
var Chessground = require("chessground");

var ground = Chessground(document.body, options);
```

## Config

- [Config documented types](https://github.com/ornicar/chessground/tree/master/src/dts/config.d.ts)
- [Config default values](https://github.com/ornicar/chessground/tree/master/src/defaults.ts)

## A.P.I.

There are a few functions you can call on a Chessground instance:

### Setters

```js
// reconfigure the instance. Accepts all options mentioned above (bar "viewOnly" & "minimalDom").
// board will be animated accordingly, if animations are enabled.
ground.set(options);

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
