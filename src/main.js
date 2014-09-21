var ctrl = require('./ctrl');
var view = require('./view');
var api = require('./api');

window.chessground = function(element, config) {

  var controller = new ctrl(config);

  m.module(element, {
    controller: function() {
      return controller;
    },
    view: view
  });

  return api(element, controller, view);
};
