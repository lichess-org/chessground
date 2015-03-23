var m = require('mithril');
var key2pos = require('./util').key2pos;

var color = '#008800';

var bounds;

function circleWidth(light) {
  return (light ? 2 : 4) / 512 * bounds.width;
}

function lineWidth(light) {
  return (light ? 7 : 10) / 512 * bounds.width;
}

function opacity(light) {
  return light ? 0.2 : 0.5;
}

function pos2px(pos) {
  var squareSize = bounds.width / 8;
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}

function circle(pos, light) {
  var o = pos2px(pos);
  var width = circleWidth(light);
  var radius = bounds.width / 16;
  return {
    tag: 'circle',
    attrs: {
      stroke: color,
      'stroke-width': width,
      fill: 'none',
      opacity: opacity(light),
      cx: o[0],
      cy: o[1],
      r: radius - width / 2
    }
  };
}

function arrow(orig, dest, withHead, light) {
  var o = pos2px(orig);
  var d = pos2px(dest);
  return {
    tag: 'line',
    attrs: {
      stroke: color,
      'stroke-width': lineWidth(light),
      'marker-end': withHead ? 'url(#arrowhead)' : null,
      opacity: opacity(light),
      x1: o[0],
      y1: o[1],
      x2: d[0],
      y2: d[1],
      'stroke-linecap': 'round'
    }
  };
}

var defs = {
  tag: 'defs',
  children: [{
    tag: 'marker',
    attrs: {
      id: 'arrowhead',
      orient: 'auto',
      markerWidth: 4,
      markerHeight: 8,
      refX: 2.05,
      refY: 2.01
    },
    children: [{
      tag: 'path',
      attrs: {
        d: 'M0,0 V4 L3,2 Z',
        fill: color
      }
    }]
  }]
};

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

function lineOrigs(shapes) {
  var origs = [];
  shapes.forEach(function(s) {
    if (s.length === 2) origs.push(s[0]);
  });
  return origs;
}

function samePos(p1, p2) {
  return p1[0] === p2[0] && p1[1] === p2[1];
}

function renderCurrent(data) {
  var c = data.drawable.current;
  if (!c || !c.orig || !c.over) return;
  var shape = computeShape(data.orientation)(c.orig === c.over ? [c.orig] : [c.orig, c.over]);
  return shape.length === 1 ?
    circle(shape[0], true) :
    arrow(shape[0], shape[1], true, true);
}

module.exports = function(ctrl) {
  if (!ctrl.data.bounds) return;
  var shapes = ctrl.data.drawable.shapes.map(computeShape(ctrl.data.orientation));
  var current = ctrl.data.drawable.current;
  if (!shapes.length && !current.length) return;
  if (!bounds) bounds = ctrl.data.bounds();
  var origs = lineOrigs(shapes);
  return {
    tag: 'svg',
    children: [
      defs,
      shapes.map(function(shape) {
        if (shape.length === 1) return circle(shape[0], false);
        if (shape.length === 2) return arrow(
          shape[0],
          shape[1],
          origs.filter(function(o) {
            return samePos(o, shape[1]);
          }).length === 0,
          false);
      }),
      renderCurrent(ctrl.data)
    ]
  };
}
