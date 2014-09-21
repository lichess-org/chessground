function read(fen) {
  fen = fen.replace(/ .+$/, '');
  var rows = fen.split('/');
  var pieces = {};
  var y = 8;
  // for (var i = 0; i < 8; i++) {
  //   var row = rows[i].split('');
  //   var colIndex = 0;
  //   for (var j = 0; j < row.length; j++) {
  //     var nb = parseInt(row[j]);
  //     if (nb) colIndex += nb;
  //     else {
  //       pieces[cg.util.pos2key([
  //       var square = COLUMNS[colIndex] + currentRow;
  //       position[square] = fenToPieceCode(row[j]);
  //       colIndex++;
  //     }
  //   }

  //   currentRow--;
  // }

  return pieces;
}

module.exports = {
  read: read
};
