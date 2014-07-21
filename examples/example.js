function chessToDests(chess) {
  var dests = {};
  chess.SQUARES.forEach(function(s) {
    var ms = chess.moves({square: s});
    if (ms.length) dests[s] = ms.map(function(m) { return m.substr(-2); });
  });
  return dests;
}

function chessToColor(chess) {
  return (chess.turn() == "w") ? "white" : "black";
}
