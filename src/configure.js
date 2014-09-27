var merge = require('lodash-node/modern/objects/merge')
var fen = require('./fen');

module.exports = function(data, config) {

  merge(data, config);

  if (data.fen) {
    data.pieces = fen.read(data.fen);
    delete data.fen;
  }

  data.movable.dropped = null;
};
