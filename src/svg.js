var m = require('mithril');
var key2pos = require('./util').key2pos;

var colors = [
  // user shapes
  '#15781B', '#882020', '#003088', '#E68F00',
  // automatic shapes
  '#003088'
];
var colorIndexes = colors.map(function(c, i) {
  return i;
});
var opacities = [1, 1, 1, 1, 0.5];
var lineWidths = [10, 10, 10, 10, 15];
var circleMargins = [0, 1, 2, 3, 0];

var bounds;

function circleWidth(current) {
  return (current ? 2 : 4) / 512 * bounds.width;
}

function lineWidth(style, current) {
  return (lineWidths[style] || 10) * (current ? 0.7 : 1) / 512 * bounds.width;
}

function opacity(style, current) {
  return (opacities[style] || 1) * (current ? 0.6 : 1);
}

function arrowMargin(current) {
  return (current ? 12 : 24) / 512 * bounds.width;
}

function pos2px(pos) {
  var squareSize = bounds.width / 8;
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}

function circle(style, pos, current) {
  var o = pos2px(pos);
  var width = circleWidth(current);
  var radius = bounds.width / 16;
  return {
    tag: 'circle',
    attrs: {
      key: current ? 'current' : pos,
      stroke: colors[style],
      'stroke-width': width,
      fill: 'none',
      opacity: opacity(style, current),
      cx: o[0],
      cy: o[1],
      r: radius - width / 2 - circleMargins[style] * width * 1.5
    }
  };
}

function arrow(style, orig, dest, current) {
  var m = arrowMargin(current);
  var a = pos2px(orig);
  var b = pos2px(dest);
  var dx = b[0] - a[0],
    dy = b[1] - a[1],
    angle = Math.atan2(dy, dx);
  var xo = Math.cos(angle) * m,
    yo = Math.sin(angle) * m;
  return {
    tag: 'line',
    attrs: {
      key: current ? 'current' : orig + dest,
      stroke: colors[style],
      'stroke-width': lineWidth(style, current),
      'stroke-linecap': 'round',
      'marker-end': 'url(#arrowhead' + style + ')',
      opacity: opacity(style, current),
      x1: a[0],
      y1: a[1],
      x2: b[0] - xo,
      y2: b[1] - yo
    }
  };
}

function defs(indexes) {
  return {
    tag: 'defs',
    children: [
      indexes.map(function(i) {
        return {
          tag: 'marker',
          attrs: {
            id: 'arrowhead' + i,
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
              fill: colors[i]
            }
          }]
        }
      })
    ]
  };
}

function orient(pos, color) {
  return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
}

function renderShape(orientation, current) {
  return function(shape) {
    if (shape.orig && shape.dest) return arrow(
      shape.style,
      orient(key2pos(shape.orig), orientation),
      orient(key2pos(shape.dest), orientation),
      current);
    else if (shape.orig) return circle(
      shape.style,
      orient(key2pos(shape.orig), orientation),
      current);
  };
}

module.exports = function(ctrl) {
  if (!ctrl.data.bounds) return;
  var d = ctrl.data.drawable;
  var allShapes = d.shapes.concat(d.autoShapes);
  if (!allShapes.length && !d.current.orig) return;
  if (!bounds) bounds = ctrl.data.bounds();
  if (bounds.width !== bounds.height) return;
  var usedColorIndexes = colorIndexes.filter(function(i) {
    return (d.current && d.current.dest && d.current.style === i) || allShapes.filter(function(s) {
      return s.dest && s.style === i;
    }).length;
  });
  return {
    tag: 'svg',
    children: [
      defs(usedColorIndexes),
      allShapes.map(renderShape(ctrl.data.orientation)),
      renderShape(ctrl.data.orientation, true)(d.current)
    ]
  };
}
