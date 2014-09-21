
// controller

var controller = function() {
  this.pieces = new cg.model.Pieces({
    a1: {
      role: 'rook',
      color: 'white'
    },
    a2: {
      role: 'knight',
      color: 'white'
    },
    b1: {
      role: 'pawn',
      color: 'white'
    }
  });
  this.orientation = m.prop('white');
};

module.exports = controller;
