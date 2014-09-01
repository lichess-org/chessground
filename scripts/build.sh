#!/bin/sh

ROOT=$(cd `dirname $0` && pwd)/..

cd $ROOT
lein cljsbuild clean
lein cljsbuild once prod

echo "Finalizing chessground.js"

$ROOT/node_modules/.bin/uglifyjs $ROOT/libs/interact.js -o $ROOT/libs/interact.min.js

(cat $ROOT/libs/interact.min.js;
cat $ROOT/scripts/wrapper.beg.txt;
cat $ROOT/out-prod/chessground.prod.js;
cat $ROOT/scripts/wrapper.end.txt) > $ROOT/chessground.prod.js
