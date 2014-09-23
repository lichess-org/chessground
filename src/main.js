var ctrl = require('./ctrl');
var view = require('./view');
var api = require('./api');

// for usage outside of mithril
function init(element, config) {

  var controller = new ctrl(config);

  m.module(element, {
    controller: function() {
      return controller;
    },
    view: view
  });

  return api(element, controller, view);
}

module.exports = init;
init.controller = ctrl;
init.view = view;
