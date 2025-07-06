import { premove } from '../src/premove';
import * as cg from '../src/types';

function createMockPieces(): cg.Pieces {
  return new Map<cg.Key, cg.Piece>([
    ['e4', { role: 'pawn', color: 'white' }],
    ['e1', { role: 'rook', color: 'white' }],
    ['g1', { role: 'rook', color: 'white' }],
    ['d1', { role: 'king', color: 'white' }],
  ]);
}

test('rook premoves behind friendlies by default', () => {
  expect(new Set(premove(createMockPieces(), 'e1', false))).toEqual(
    new Set(['d1', 'c1', 'b1', 'a1', 'f1', 'g1', 'h1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8']),
  );
});

test('rook only premoves up to friendlies when specified', () => {
  expect(new Set(premove(createMockPieces(), 'e1', false, true))).toEqual(
    new Set(['d1', 'e2', 'e3', 'e4', 'f1', 'g1']),
  );
});
