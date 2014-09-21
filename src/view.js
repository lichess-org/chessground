var util = require('./util');
var _ = require('lodash');

function renderPiece(p) {
  return m('div', {
    class: ['cg-piece', p.role, p.color].join(' ')
  });
}

function renderSquare(ctrl, x, y, asWhite) {
  var styleX = (x - 1) * 12.5 + '%';
  var styleY = (y - 1) * 12.5 + '%';
  var file = util.files[x - 1];
  var rank = y;
  var key = file + rank;
  var attrs = {
    class: util.classSet({
      'cg-square': true,
      'selected': false,
      'check': false,
      'last-move': false,
      'move-dest': false,
      'premove-dest': false,
      'current-premove': false,
      'drag-over': false
    }),
    style: asWhite ? {
      left: styleX,
      bottom: styleY
    } : {
      right: styleX,
      top: styleY
    },
    'data-key': key
  };
  if (y === (asWhite ? 1 : 8)) attrs['data-coord-x'] = file;
  if (x === (asWhite ? 8 : 1)) attrs['data-coord-y'] = rank;
  return {
    tag: 'div',
    attrs: attrs,
    children: ctrl.pieces[key] ? renderPiece(ctrl.pieces[key]) : null
  };
}

module.exports = function(ctrl) {
  var asWhite = ctrl.orientation() === 'white';
  return m('div.cg-board',
    _.flatten(
      _.map(util.ranks, function(y) {
        return _.map(util.ranks, function(x) {
          return renderSquare(ctrl, x, y, asWhite);
        });
      })
    ));
}
