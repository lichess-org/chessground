export function toDests(chess: any): Dests {
  const dests = {};
  chess.SQUARES.forEach(s => {
    const ms = chess.moves({square: s, verbose: true});
    if (ms.length) dests[s] = ms.map(m => m.to);
  });
  return dests;
}

export function toColor(chess: any): Color {
  return (chess.turn() === 'w') ? 'white' : 'black';
}
