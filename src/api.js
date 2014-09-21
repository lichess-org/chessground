module.exports = function(element, controller, view) {

  var action = function(computation) {
    return function() {
      computation.apply(null, arguments);
      m.render(element, view(controller));
    }
  };

  return {
    setOrientation: action(controller.setOrientation),
    toggleOrientation: action(controller.toggleOrientation)
  }
};
