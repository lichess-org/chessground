var m = require('mithril');
var key2pos = require('./util').key2pos;

var color = '#008800';

function circleWidth(light, bounds) {
  return (light ? 2 : 4) / 512 * bounds.width;
}

function lineWidth(light, bounds) {
  return (light ? 7 : 10) / 512 * bounds.width;
}

function opacity(light, bounds) {
  return light ? 0.5 : 1;
}

function arrowMargin(bounds) {
  return 24 / 512 * bounds.width;
}

function pos2px(pos, bounds) {
  var squareSize = bounds.width / 8;
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}

function circle(pos, light, bounds) {
  var o = pos2px(pos, bounds);
  var width = circleWidth(light, bounds);
  var radius = bounds.width / 16;
  return {
    tag: 'circle',
    attrs: {
      stroke: color,
      'stroke-width': width,
      fill: 'none',
      opacity: opacity(light, bounds),
      cx: o[0],
      cy: o[1],
      r: radius - width / 2
    }
  };
}

function arrow(orig, dest, light, bounds) {
  var m = arrowMargin(bounds);
  var a = pos2px(orig, bounds);
  var b = pos2px(dest, bounds);
  var dx = b[0] - a[0],
    dy = b[1] - a[1],
    angle = Math.atan2(dy, dx);
  var xo = Math.cos(angle) * m,
    yo = Math.sin(angle) * m;
  return {
    tag: 'line',
    attrs: {
      stroke: color,
      'stroke-width': lineWidth(light, bounds),
      'stroke-linecap': 'round',
      'marker-end': 'url(#arrowhead)',
      opacity: opacity(light, bounds),
      x1: a[0],
      y1: a[1],
      x2: b[0] - xo,
      y2: b[1] - yo
    }
  };
}

var defs = m('defs',
  m('marker', {
    id: 'arrowhead',
    orient: 'auto',
    markerWidth: 4,
    markerHeight: 8,
    refX: 2.05,
    refY: 2.01
  }, m('path', {
    d: 'M0,0 V4 L3,2 Z',
    fill: color
  })));

function orient(pos, color) {
  return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
}

function computeShape(orientation) {
  return function(s) {
    return s.map(function(k) {
      return orient(key2pos(k), orientation);
    });
  };
}

function samePos(p1, p2) {
  return p1[0] === p2[0] && p1[1] === p2[1];
}

function renderCurrent(data) {
  var c = data.drawable.current;
  if (!c.orig || !c.over) return;
  var shape = computeShape(data.orientation)(c.orig === c.over ? [c.orig] : [c.orig, c.over]);
  return shape.length === 1 ?
    circle(shape[0], true, data.bounds) :
    arrow(shape[0], shape[1], true, data.bounds);
}

module.exports = function(ctrl) {
  if (!ctrl.data.bounds) return;
  var bounds = ctrl.data.bounds;
  var shapes = ctrl.data.drawable.shapes.map(computeShape(ctrl.data.orientation));
  if (!shapes.length && !ctrl.data.drawable.current.orig) return;
  if (bounds.width !== bounds.height) return;
  return {
    tag: 'svg',
    children: [
      defs,
      shapes.map(function(shape) {
        if (shape.length === 1) return circle(shape[0], false, bounds);
        if (shape.length === 2) return arrow(
          shape[0],
          shape[1],
          false,
          bounds);
      }),
      renderCurrent(ctrl.data)
    ]
  };
}
