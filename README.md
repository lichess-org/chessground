<img src="https://raw.githubusercontent.com/ornicar/chessground/master/screenshot/twin.jpg" width="100%" alt="Chessground in 2D and 3D" />

**Chessground** is free/libre open source chess UI developed for [lichess.org](https://lichess.org).

It targets modern browsers, as well as mobile development using Cordova.

## License

Chessground is distributed under the **GPL-3.0 license**.
When you use chessground, your website becomes GPL as well, and **you must release your source code**.

Please read more about GPL for JavaScript on [greendrake.info/#nfy0](http://greendrake.info/#nfy0).

## Demos

- [Chess TV](https://lichess.org/tv)
- [Board editor](https://lichess.org/editor)
- [Puzzle solver](https://lichess.org/training)
- [Analysis board](https://lichess.org/ofWXRFGy)
- [Game preview](https://lichess.org/games)

## Features

Chessground is designed to fulfill all lichess.org web and mobile apps needs, so it is pretty featureful.

- Well typed with typescript
- Fast. Uses a custom DOM diff algorithm to reduce DOM writes to the absolute minimum
- Small footprint: 10K gzipped (30K unzipped). No dependencies.
- SVG drawing of circles and arrows on the board
- Entirely configurable and reconfigurable at any time
- Styling with CSS only: board and pieces can be changed by simply switching a class
- Fluid layout: board can be resized at any time
- Support for 3D pieces and boards
- Full mobile support (touchstart, touchmove, touchend)
- Move pieces by click
- Move pieces by drag'n drop
  - minimum distance before drag
  - centralisation of the piece under the cursor
  - piece ghost element
  - drop off revert or trash
- Premove by click or drag
- Drag new pieces onto the board (editor, crazyhouse)
- Animation of pieces: moving and fading away
- Display last move, check, move destinations, and premove destinations (hover effects possible)
- Import and export positions in FEN notation
- User callbacks
- No chess logic inside: can be used for [chess variants](https://lichess.org/variant)

## Installation

```
npm install --save chessground
```

### Usage

```js
var Chessground = require("chessground").Chessground;

var ground = Chessground(document.body, config);
```

### Wrappers

- React: [ruilisi/react-chessground](https://github.com/ruilisi/react-chessground)
- Vue.js: [vitogit/vue-chessboard](https://github.com/vitogit/vue-chessboard)
- More? Make a pull request to include it here.

## Documentation

- [Config documented types](https://github.com/ornicar/chessground/tree/master/src/config.ts)
- [Config default values](https://github.com/ornicar/chessground/tree/master/src/state.ts)
- [API documented type signatures](https://github.com/ornicar/chessground/tree/master/src/api.ts)
- [Examples repo](https://github.com/ornicar/chessground-examples/tree/master/src/units)
- [Base CSS](https://github.com/ornicar/chessground-examples/blob/master/assets/chessground.css)

## Developers

First of all, of course:

```
yarn install
```

To build the node module:
```
tsc -watch
```

To build the standalone:

```
gulp dev  // build once
gulp      // build and watch
gulp prod // build minified
```
