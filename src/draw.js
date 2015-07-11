var board = require('./board');
var util = require('./util');

function hashPiece(piece) {
  return piece ? piece.color + ' ' + piece.role : '';
}

function start(data, e) {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  board.cancelMove(data);
  var position = util.eventPosition(e);
  var bounds = data.bounds;
  var orig = board.getKeyAtDomPos(data, position, bounds);
  data.drawable.current = {
    orig: orig,
    over: orig,
    epos: position,
    bounds: bounds
  };
  processDraw(data);
}

function processDraw(data) {
  util.requestAnimationFrame(function() {
    var cur = data.drawable.current;
    if (cur.orig) cur.over = board.getKeyAtDomPos(data, cur.epos, cur.bounds);
    data.render();
    if (cur.orig) processDraw(data);
  });
}

function move(data, e) {
  if (data.drawable.current.orig)
    data.drawable.current.epos = util.eventPosition(e);
}

function end(data, e) {
  var drawable = data.drawable;
  var orig = drawable.current.orig;
  var dest = drawable.current.over;
  if (!orig || !dest) return;
  if (orig === dest) addCircle(drawable, orig);
  else addLine(drawable, orig, dest);
  drawable.current = {};
  data.render();
}

function cancel(data) {
  if (data.drawable.current.orig) data.drawable.current = {};
}

function clear(data, e) {
  if (e.button !== 0 || e.shiftKey) return; // only left click
  data.drawable.shapes = [];
  data.render();
}

function not(f) {
  return function(x) {
    return !f(x);
  };
}

function addCircle(drawable, key) {
  var sameCircle = function(s) {
    return s.length === 1 && s[0] === key;
  };
  var exists = drawable.shapes.filter(sameCircle).length > 0;
  if (exists) drawable.shapes = drawable.shapes.filter(not(sameCircle));
  else drawable.shapes.push([key]);
}

function addLine(drawable, orig, dest) {
  var sameLine = function(s) {
    return s.length === 2 && (
      (s[0] === orig && s[1] === dest) ||
      (s[1] === orig && s[0] === dest)
    );
  };
  var exists = drawable.shapes.filter(sameLine).length > 0;
  if (exists) drawable.shapes = drawable.shapes.filter(not(sameLine));
  else drawable.shapes.push([orig, dest]);
}

module.exports = {
  start: start,
  move: move,
  end: end,
  cancel: cancel,
    clear: clear,
  processDraw: processDraw
};
