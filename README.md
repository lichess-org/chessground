# ChessGround

Multipurpose chess UI.

ChessGround is written in [clojurescript](https://github.com/clojure/clojurescript).

It uses [interact.js](https://github.com/taye/interact.js) as single javascript
dependency.

This library is meant to replace all [lichess.org](http://lichess.org) chessboards,
and can be used as a drop-in replacement for chessboardjs and pgn4web.

It targets all modern browsers, as well as mobile development using Cordova.

Even thought all code is written in clojurescript, it exposes a JavaScript public API.

## Usage

Chessground can be required in a browserify environment, or loaded with a script
tag.

Attach a board to a DOM element with defaults options:

```javascript
var ground = chessground.main(document.getElementById('ground'));
```

## Build

### Prerequisites

You will need the Java SDK,
[Leiningen](https://github.com/technomancy/leiningen) and
[npm](https://github.com/npm/npm) to build chessground.

### Development

```sh
lein cljsbuild auto dev
```

To serve the examples from a webserver (avoid cross domain requests):

```
sudo npm install -g http-server
http-server
```

Then open [http://localhost:8080/examples/index.html](http://localhost:8080/examples/index.html).

The code compiled using dev-profile enables one to use the
[Weasel](https://github.com/tomjakubowski/weasel) browser REPL (Read, Eval, Print,
Loop) to live code in the browser using ClojureScript. To get this working, first
start a regular Clojure repl inside the project either via `lein repl` or from your
nREPL supporting editor, and then call the `start-repl` function defined in your
`user` namespace. You should see the following:

```sh
$ lein repl
nREPL server started on port 54321 on host 127.0.0.1
REPL-y 0.3.0
Clojure 1.6.0
    Docs: (doc function-name-here)
          (find-doc "part-of-name-here")
  Source: (source function-name-here)
 Javadoc: (javadoc java-object-or-class-here)
    Exit: Control+D or (exit) or (quit)
 Results: Stored in vars \*1, \*2, \*3, an exception in \*e
user=> (start-repl)
<< started Weasel server on ws://127.0.0.1:9001 \>\>
Type ':cljs/quit' to stop the ClojureScript REPL
nil
cljs.user=\>
```

Next open up the examples/index.html page, and if you open the browser console, you
should see a message stating:

>Opened Websocket REPL connection. 

This means that your ClojureScript REPL is now connected to the browser window and
you can start evaluating CLJS code. Try `(js/alert "Hello")` and you should see an
alert popping up.

### Production

To make a production build:

```sh
npm install
npm run build
```

This will generate a chessground.js file in the project root.

Then try it on [http://localhost:8080/examples/index.html?prod](http://localhost:8080/examples/index.html?prod).
