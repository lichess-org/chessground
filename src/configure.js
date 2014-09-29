var merge = require('lodash-node/modern/objects/merge')
var board = require('./board');
var fen = require('./fen');

module.exports = function(data, config) {

  var dests;
  if (config.movable) {
    dests = config.movable.dests;
    delete config.movable.dests;
  }

  merge(data, config);

  if (dests !== undefined)
    data.movable.dests = dests;

  if (data.fen) {
    data.pieces = fen.read(data.fen);
    delete data.fen;
  }

  data.movable.dropped = [];

  // fix move/premove dests
  if (data.selected) board.setSelected(data, data.selected);

  if (data.animation.duration < 10) data.animation.enabled = false;
};
