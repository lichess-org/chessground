module.exports = function(element, controller, view) {

  var action = function(computation) {
    return function() {
      var result = computation.apply(null, arguments);
      m.render(element, view(controller));
      return result;
    }
  };

  return {
    setOrientation: action(controller.setOrientation),
    toggleOrientation: action(controller.toggleOrientation),
    getOrientation: function() {
      return controller.board.orientation;
    },
    getPieces: function() {
      return controller.board.pieces.all;
    },
    move: action(controller.apiMove),
    setPieces: action(controller.setPieces)
  }
};
