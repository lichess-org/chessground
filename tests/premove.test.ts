import { premove } from '../src/premove';
import * as cg from '../src/types';
import { defaults, HeadlessState } from '../src/state';
import * as fen from '../src/fen';
import * as util from '../src/util';

const invertSquare = (square: cg.Key): cg.Key => {
  const asPos = util.key2pos(square);
  return util.pos2keyUnsafe([asPos[0], 7 - asPos[1]] as cg.Pos);
};

const invertPieces = (pieces: cg.Pieces): cg.Pieces =>
  new Map(
    [...pieces].map(([key, piece]) => [
      invertSquare(key),
      { role: piece.role, color: util.opposite(piece.color) },
    ]),
  );

const makeState = (pieces: cg.Pieces, turnColor: cg.Color): HeadlessState => {
  const state = defaults();
  state.pieces = pieces;
  state.turnColor = turnColor;
  return state;
};

const testPosition = (
  pieces: cg.Pieces,
  turnColor: cg.Color,
  expectedPremoves: Map<cg.Key, Set<cg.Key>>,
  checkInverseToo: boolean,
): void => {
  const state = makeState(pieces, turnColor);
  for (const [from, expectedDests] of expectedPremoves) {
    expect(new Set(premove(state, from))).toEqual(expectedDests);
  }
  expect(
    util.allKeys.filter(sq => !expectedPremoves.has(sq)).every(sq => !premove(state, sq as cg.Key).length),
  ).toEqual(true);
  if (checkInverseToo)
    testPosition(
      invertPieces(pieces),
      util.opposite(turnColor),
      new Map(
        [...expectedPremoves].map(([start, dests]) => [
          invertSquare(start),
          new Set(Array.from(dests, invertSquare)),
        ]),
      ),
      false,
    );
};

test('premoves are found', () => {
  const expectedPremoves = new Map<cg.Key, Set<cg.Key>>([
    ['a7', new Set(['a6', 'a5', 'b6'])],
    ['b7', new Set(['b6', 'b5', 'a6', 'c6'])],
    ['c7', new Set(['c6', 'c5', 'b6', 'd6'])],
    ['d7', new Set(['d6', 'd5', 'c6', 'e6'])],
    ['e7', new Set(['e6', 'e5', 'd6', 'f6'])],
    ['f6', new Set(['f5', 'e5', 'g5'])],
    ['g7', new Set(['g6', 'g5', 'f6', 'h6'])],
    ['h7', new Set(['h6', 'h5', 'g6'])],
    ['a8', new Set(['a7', 'a6', 'a5', 'a4', 'a3', 'a2', 'a1', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'])],
    ['b8', new Set(['a6', 'c6', 'd7'])],
    ['c8', new Set(['a6', 'b7', 'd7', 'e6', 'f5', 'g4', 'h3'])],
    [
      'd8',
      new Set([
        'd7',
        'd6',
        'd5',
        'd4',
        'd3',
        'd2',
        'd1',
        'e8',
        'f8',
        'g8',
        'h8',
        'c8',
        'b8',
        'a8',
        'e7',
        'f6',
        'g5',
        'h4',
        'c7',
        'b6',
        'a5',
      ]),
    ],
    ['e8', new Set(['d8', 'f8', 'd7', 'e7', 'f7', 'g8', 'h8', 'c8', 'a8'])],
    ['f8', new Set(['g7', 'h6', 'e7', 'd6', 'c5', 'b4', 'a3'])],
    ['g8', new Set(['h6', 'f6', 'e7'])],
    ['h8', new Set(['h7', 'h6', 'h5', 'h4', 'h3', 'h2', 'h1', 'g8', 'f8', 'e8', 'd8', 'c8', 'b8', 'a8'])],
  ]);

  testPosition(
    fen.read('rnbqkbnr/ppppp1pp/5p2/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
    'white',
    expectedPremoves,
    true,
  );
});
