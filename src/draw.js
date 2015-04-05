var board = require('./board');
var util = require('./util');

function hashPiece(piece) {
  return piece ? piece.color + ' ' + piece.role : '';
}

function start(data, e) {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  var position = util.eventPosition(e);
  var bounds = data.bounds();
  var orig = board.getKeyAtDomPos(data, position, bounds);
  data.drawable.current = {
    orig: orig,
    over: orig,
    epos: position,
    bounds: bounds,
    color: e.shiftKey & util.isRightButton(e)
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

function not(f) {
  return function(x) {
    return !f(x);
  };
}

function addCircle(drawable, key) {
  var color = drawable.current.color;
  var sameCircle = function(s) {
    return s.length === 2 && s[0] === color && s[1] === key;
  };
  var exists = drawable.shapes.filter(sameCircle).length > 0;
  if (exists) drawable.shapes = drawable.shapes.filter(not(sameCircle));
  else drawable.shapes.push([color, key]);
}

function addLine(drawable, orig, dest) {
  var color = drawable.current.color;
  var sameLine = function(s) {
    return s.length === 3 && (
      (s[1] === orig && s[2] === dest) ||
      (s[2] === orig && s[1] === dest)
    );
  };
  var exists = drawable.shapes.filter(sameLine).length > 0;
  if (exists) drawable.shapes = drawable.shapes.filter(not(sameLine));
  else drawable.shapes.push([color, orig, dest]);
}

module.exports = {
  start: start,
  move: move,
  end: end,
  cancel: cancel,
  processDraw: processDraw
};
