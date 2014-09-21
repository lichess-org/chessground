var ctrl = require('./ctrl');
var view = require('./view');
var api = require('./api');

window.chessground = function(element, config) {

  // using master branch of mithril
  var controller = m.module(element, {
    controller: ctrl,
    view: view
  });

  return api(element, controller, view);
};
