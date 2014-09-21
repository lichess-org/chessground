var model = require('./model');
var view = require('./view');
var ctrl = require('./ctrl');

// how to expose that?
window.chessground = {
  mithrilModule: {
    controller: ctrl,
    view: view
  }
};
