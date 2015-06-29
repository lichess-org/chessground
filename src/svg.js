var m = require('mithril');
var key2pos = require('./util').key2pos;

var colors = ['#15781B', '#882020', '#003088', '#E68F00'];
var colorIndexes = colors.map(function(c, i) { return i; });

var bounds;

function circleWidth(light) {
  return (light ? 2 : 4) / 512 * bounds.width;
}

function lineWidth(light) {
  return (light ? 7 : 10) / 512 * bounds.width;
}

function opacity(light) {
  return light ? 0.5 : 1;
}

function arrowMargin() {
  return 24 / 512 * bounds.width;
}

function pos2px(pos) {
  var squareSize = bounds.width / 8;
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}

function circle(drawColor, pos, light) {
  var o = pos2px(pos);
  var width = circleWidth(light);
  var radius = bounds.width / 16;
  return {
    tag: 'circle',
    attrs: {
      stroke: colors[drawColor],
      'stroke-width': width,
      fill: 'none',
      opacity: opacity(light),
      cx: o[0],
      cy: o[1],
      r: radius - width / 2 - drawColor * width * 1.5
    }
  };
}

function arrow(drawColor, orig, dest, light) {
  var m = arrowMargin();
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
      stroke: colors[drawColor],
      'stroke-width': lineWidth(light),
      'stroke-linecap': 'round',
      'marker-end': 'url(#arrowhead' + drawColor + ')',
      opacity: opacity(light),
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

function renderShape(orientation, light) {
  return function(shape) {
    if (shape.orig && shape.dest) return arrow(
      shape.drawColor,
      orient(key2pos(shape.orig), orientation),
      orient(key2pos(shape.dest), orientation),
      light);
    else if (shape.orig) return circle(
      shape.drawColor,
      orient(key2pos(shape.orig), orientation),
      light);
  };
}

module.exports = function(ctrl) {
  if (!ctrl.data.bounds) return;
  var d = ctrl.data.drawable;
  if (!d.shapes.length && !d.current.orig) return;
  if (!bounds) bounds = ctrl.data.bounds();
  if (bounds.width !== bounds.height) return;
  var usedColorIndexes = colorIndexes.filter(function(i) {
    return (d.current && d.current.dest && d.current.drawColor === i) || d.shapes.filter(function(s) {
      return s.dest && s.drawColor === i;
    }).length;
  });
  return {
    tag: 'svg',
    children: [
      defs(usedColorIndexes),
      d.shapes.map(renderShape(ctrl.data.orientation)),
      renderShape(ctrl.data.orientation, true)(d.current)
    ]
  };
}
