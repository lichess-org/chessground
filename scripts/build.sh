#!/bin/sh

ROOT=$(cd `dirname $0` && pwd)/..

cd $ROOT
# lein cljsbuild clean
# lein cljsbuild once prod

echo "Finalizing chessground.js"

(cat $ROOT/libs/interact.js;
cat $ROOT/scripts/wrapper.beg.txt;
cat $ROOT/out-prod/chessground.prod.js;
cat $ROOT/scripts/wrapper.end.txt) > $ROOT/scripts/chessground.tmp.js

$ROOT/node_modules/.bin/uglifyjs $ROOT/scripts/chessground.tmp.js -o $ROOT/chessground.prod.js

rm $ROOT/scripts/chessground.tmp.js
