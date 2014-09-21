var util = require('./util');
var fen = require('./fen');
var model = require('./model');
var ctrl = require('./ctrl');
var view = require('./view');

console.log(ctrl);

// how to expose that?
window.chessground = {
  util: util,
  fen: fen,
  model: model,
  ctrl: ctrl,
  view: view
};
