#!/bin/sh

ROOT=$(cd `dirname $0` && pwd)/../

echo "Compiling chessground.js"

cd $ROOT
lein cljsbuild once stage

echo "Finalizing chessground.js"

(cat $ROOT/scripts/wrapper.beg.txt; cat $ROOT/generated-stage/chessground.stage.js; cat $ROOT/scripts/wrapper.end.txt) > $ROOT/chessground.js
