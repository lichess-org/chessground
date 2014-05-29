# ChessGround

Browser based chessboard written in clojurescript and react.

## Development

```sh
lein cljsbuild auto dev
```

To serve the examples from a webserver (avoid cross domain requests):

```
lein ring server
```

Then open [http://localhost:3000/examples/index.html](http://localhost:3000/examples/index.html).
