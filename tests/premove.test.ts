import { premove } from '../src/premove';
import * as cg from '../src/types';
import { defaults, HeadlessState } from '../src/state';
import * as fen from '../src/fen';
import * as util from '../src/util';

const makeState = (
  fenOfPos: cg.FEN,
  trimPremoves: boolean,
  lastMove: cg.Key[] | undefined,
): HeadlessState => {
  const state = defaults();
  state.pieces = fen.read(fenOfPos);
  if (!trimPremoves) state.premovable.unrestrictedPremoves = true;
  state.lastMove = lastMove;
  state.turnColor = fenOfPos.includes(' w ') ? 'white' : 'black';
  return state;
};

const testPosition = (
  fenOfPos: cg.FEN,
  lastMove: cg.Key[] | undefined,
  expectedPremoves: Map<cg.Key, Set<cg.Key>>,
): void => {
  const state = makeState(fenOfPos, true, lastMove);
  for (const [from, expectedDests] of expectedPremoves) {
    expect(new Set(premove(state, from))).toEqual(expectedDests);
  }
  expect(
    util.allKeys.filter(sq => !expectedPremoves.has(sq)).every(sq => !premove(state, sq as cg.Key).length),
  ).toEqual(true);
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
    'k1n2r1r/2bP2p1/3r3p/Ppq1pPr1/qP4n1/p3r1P1/PbnP2KP/R4r1q w - - 0 1',
    ['e7', 'e5'],
    expectedPremoves,
  );
});
