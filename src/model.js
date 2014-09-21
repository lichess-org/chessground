
// model

var model = {};

model.Piece = function(data) {
  this.role = m.prop(data.role);
  this.color = m.prop(data.color);
};

// {a1: {role: 'rook', color: 'white'}, ...}
model.Pieces = Object;

// cg.model.Board = function(data) {
//   this.pieces = m.prop(data.pieces);
//   this.orientation = m.prop(data.orientation);
// };

module.exports = model;
