# ChessGround

Multipurpose chess UI.

ChessGround is written in [clojurescript](https://github.com/clojure/clojurescript).

This library is meant to replace all [lichess.org](http://lichess.org) chessboards,
and can be used as a drop-in replacement for chessboardjs and pgn4web.

It targets all modern browsers, as well as mobile development using Cordova.

Even thought all code is written in clojurescript, it exposes a JavaScript public API.

## Development

```sh
lein cljsbuild auto dev
```

To serve the examples from a webserver (avoid cross domain requests):

```
sudo npm install -g http-server
http-server
```

Then open [http://localhost:8080/examples/index.html](http://localhost:8080/examples/index.html).

## Production

To make a production build:

```sh
lein cljsbuild once prod
```

Then try it on [http://localhost:8080/examples/index.html?prod](http://localhost:8080/examples/index.html?prod).
