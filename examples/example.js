function chessToDests(chess) {
  var dests = {};
  chess.SQUARES.forEach(function(s) {
    var ms = chess.moves({square: s});

    if (ms.length) dests[s] = ms.reduce(function(a, m) {
        a[m.substr(-2)] = true;
      return a;
    }, {});
  });
  return dests;
}

function chessToColor(chess) {
  return (chess.turn() == "w") ? "white" : "black";
}
