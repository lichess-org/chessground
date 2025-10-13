import { premove } from '../src/premove';
import * as cg from '../src/types';
import { defaults, HeadlessState } from '../src/state';
import * as fen from '../src/fen';
import * as util from '../src/util';

const diagonallyOpposite = (square: cg.Key): cg.Key =>
  util.pos2keyUnsafe(util.key2pos(square).map(n => 7 - n) as cg.Pos);

const invertPieces = (pieces: cg.Pieces): cg.Pieces =>
  new Map(
    [...pieces].map(([key, piece]) => [
      diagonallyOpposite(key),
      { role: piece.role, color: util.opposite(piece.color) },
    ]),
  );

const makeState = (
  pieces: cg.Pieces,
  trimPremoves: boolean,
  lastMove: cg.Key[] | undefined,
  turnColor: cg.Color,
): HeadlessState => {
  const state = defaults();
  state.pieces = pieces;
  if (!trimPremoves) state.premovable.unrestrictedPremoves = true;
  state.lastMove = lastMove;
  state.turnColor = turnColor;
  return state;
};

const testPosition = (
  pieces: cg.Pieces,
  turnColor: cg.Color,
  lastMove: cg.Key[] | undefined,
  expectedPremoves: Map<cg.Key, Set<cg.Key>>,
  checkInverseToo: boolean,
): void => {
  const state = makeState(pieces, true, lastMove, turnColor);
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
      lastMove?.map(sq => diagonallyOpposite(sq)),
      new Map(
        [...expectedPremoves].map(([start, dests]) => [
          diagonallyOpposite(start),
          new Set(Array.from(dests, diagonallyOpposite)),
        ]),
      ),
      false,
    );
};

test('premoves are trimmed appropriately', () => {
  const expectedPremoves = new Map<cg.Key, Set<cg.Key>>([
    ['f8', new Set(['g8', 'e8', 'd8', 'c8', 'f7', 'f6', 'f5', 'f4', 'f3', 'f2', 'f1'])],
    ['f1', new Set(['h1', 'g1', 'e1', 'd1', 'c1', 'b1', 'a1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7'])],
    ['g5', new Set(['h5', 'f5', 'e5', 'd5', 'c5', 'g6'])],
    ['h8', new Set(['h7', 'g8'])],
    ['e3', new Set(['g3', 'f3', 'd3', 'c3', 'b3', 'e2', 'e1', 'e4', 'e5', 'e6'])],
    ['d6', new Set(['e6', 'f6', 'g6', 'c6', 'b6', 'a6', 'd7', 'd8', 'd5', 'd4', 'd3', 'd2', 'd1'])],
    ['h1', new Set(['h2', 'h3', 'h4', 'g1', 'f1', 'g2', 'f3', 'e4', 'd5', 'c6', 'b7'])],
    ['a4', new Set(['b3', 'b4', 'c4', 'd4', 'e4', 'f4', 'a5', 'a6'])],
    ['c5', new Set(['c4', 'c3', 'd4', 'e3', 'd5', 'e5', 'f5', 'c6', 'b6', 'a7', 'b4'])],
    ['a8', new Set(['b8', 'b7', 'a7'])],
    ['c8', new Set(['e7', 'b6', 'a7'])],
    ['g4', new Set(['h2', 'f6', 'e5', 'e3', 'f2'])],
    ['c2', new Set(['e1', 'e3', 'd4', 'b4', 'a1'])],
    ['b2', new Set(['c1', 'a1', 'c3', 'd4', 'e5', 'f6'])],
    ['c7', new Set(['d8', 'b8', 'b6', 'a5'])],
    ['h6', new Set(['h5'])],
    ['g7', new Set(['g6', 'f6'])],
    ['e5', new Set(['e4', 'd4'])],
    ['b5', new Set(['b4'])],
    ['a3', new Set([])],
  ]);
  testPosition(
    fen.read('k1n2r1r/2bP2p1/3r3p/Ppq1pPr1/qP4n1/p3r1P1/PbnP2KP/R4r1q w - - 0 1'),
    'white',
    ['e7', 'e5'],
    expectedPremoves,
    true,
  );
});

test('anticipate all en passant captures if no last move', () => {
  const expectedPremoves = new Map<cg.Key, Set<cg.Key>>([
    ['a2', new Set(['b1', 'b3', 'c4', 'd5', 'e6', 'f7', 'g8'])],
    ['h2', new Set(['g1', 'g3', 'f4', 'e5', 'd6', 'c7', 'b8'])],
    ['h3', new Set(['g3', 'f3', 'e3', 'd3', 'h4', 'h5'])],
    ['f5', new Set(['e5', 'd5', 'c5', 'b5', 'a5', 'f6', 'f7', 'f8', 'f4', 'f3'])],
    ['c4', new Set(['c5'])],
    ['f4', new Set([])],
    ['g5', new Set(['g6'])],
    ['d3', new Set(['d4', 'e4'])],
  ]);
  testPosition(
    fen.read('8/8/8/5RPp/1pP1pP2/3Pp2R/B6B/8 b - - 0 1'),
    'black',
    undefined,
    expectedPremoves,
    true,
  );
});

test('horde no en passant for first to third rank', () => {
  const expectedPremoves = new Map<cg.Key, Set<cg.Key>>([
    ['f1', new Set(['f2', 'f3'])],
    ['g3', new Set(['g4', 'h4'])],
  ]);
  testPosition(
    fen.read('rnbqkbnr/ppppppp1/8/8/8/6Pp/8/5P2 w kq - 0 1'),
    'black',
    ['g1', 'g3'],
    expectedPremoves,
    true,
  );
});

test('prod bug report lichess-org/lila#18224', () => {
  const expectedPremoves = new Map<cg.Key, Set<cg.Key>>([
    ['a8', new Set(['a7', 'a6', 'a5', 'a4', 'a3', 'a2', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'])],
    ['f2', new Set(['f3', 'g3'])],
    ['g2', new Set(['h1', 'g1', 'f1', 'h2', 'h3', 'g3', 'f3'])],
  ]);
  testPosition(
    fen.read('R7/6k1/8/8/5pp1/8/p4PK1/r7 b - - 0 56'),
    'black',
    ['h2', 'g2'],
    expectedPremoves,
    false,
  );
});

test('promotion premove allowed', () => {
  const expectedPremoves = new Map<cg.Key, Set<cg.Key>>([
    ['c7', new Set(['c8', 'b8', 'd8'])],
    ['e7', new Set(['d8', 'e8', 'f8'])],
    ['g7', new Set(['f8'])],
    ['g8', new Set(['f8', 'e8', 'd8', 'c8', 'b8', 'a8'])],
    ['h7', new Set(['g8'])],
    ['a7', new Set(['a8', 'b8'])],
    ['c1', new Set(['b1', 'b2', 'c2', 'd2', 'd1'])],
  ]);
  testPosition(
    fen.read('n3r1RB/PkP1P1PP/8/8/8/8/8/2K5 b - - 0 1'),
    'black',
    undefined,
    expectedPremoves,
    true,
  );
});
