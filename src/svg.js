var m = require('mithril');
var key2pos = require('./util').key2pos;

var bounds;

function circleWidth(current) {
  return (current ? 2 : 4) / 512 * bounds.width;
}

function lineWidth(brush, current) {
  return (brush.lineWidth || 10) * (current ? 0.7 : 1) / 512 * bounds.width;
}

function opacity(brush, current) {
  return (brush.opacity || 1) * (current ? 0.6 : 1);
}

function arrowMargin(current) {
  return (current ? 12 : 24) / 512 * bounds.width;
}

function pos2px(pos) {
  var squareSize = bounds.width / 8;
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}

function circle(brush, pos, current) {
  var o = pos2px(pos);
  var width = circleWidth(current);
  var radius = bounds.width / 16;
  return {
    tag: 'circle',
    attrs: {
      key: current ? 'current' : pos + brush.key,
      stroke: brush.color,
      'stroke-width': width,
      fill: 'none',
      opacity: opacity(brush, current),
      cx: o[0],
      cy: o[1],
      r: radius - width / 2 - brush.circleMargin * width * 1.5
    }
  };
}

function arrow(brush, orig, dest, current) {
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
      key: current ? 'current' : orig + dest + brush.key,
      stroke: brush.color,
      'stroke-width': lineWidth(brush, current),
      'stroke-linecap': 'round',
      'marker-end': 'url(#arrowhead-' + brush.key + ')',
      opacity: opacity(brush, current),
      x1: a[0],
      y1: a[1],
      x2: b[0] - xo,
      y2: b[1] - yo
    }
  };
}

function defs(brushes) {
  return {
    tag: 'defs',
    children: [
      brushes.map(function(brush) {
        return {
          key: brush.key,
          tag: 'marker',
          attrs: {
            id: 'arrowhead-' + brush.key,
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
              fill: brush.color
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

function renderShape(orientation, current, brushes) {
  return function(shape) {
    if (shape.orig && shape.dest) return arrow(
      brushes[shape.brush],
      orient(key2pos(shape.orig), orientation),
      orient(key2pos(shape.dest), orientation),
      current);
    else if (shape.orig) return circle(
      brushes[shape.brush],
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
  var usedBrushes = Object.keys(ctrl.data.drawable.brushes).filter(function(name) {
    return (d.current && d.current.dest && d.current.brush === name) || allShapes.filter(function(s) {
      return s.dest && s.brush === name;
    }).length;
  }).map(function(name) {
    return ctrl.data.drawable.brushes[name];
  });
  return {
    tag: 'svg',
    children: [
      defs(usedBrushes),
      allShapes.map(renderShape(ctrl.data.orientation, false, ctrl.data.drawable.brushes)),
      renderShape(ctrl.data.orientation, true, ctrl.data.drawable.brushes)(d.current)
    ]
  };
}
