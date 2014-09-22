var ctrl = require('./ctrl');
var view = require('./view');
var api = require('./api');

// for usage outside of mithril
function standalone(element, config) {

  var controller = new ctrl(config);

  m.module(element, {
    controller: function() {
      return controller;
    },
    view: view
  });

  return api(element, controller, view);
}

window.chessground = standalone;

module.exports = {
  standalone: standalone,
  mithril: {
    controller: ctrl,
    view: view
  }
};
