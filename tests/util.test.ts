import {
  adjacentSquares,
  allKeys,
  bishopDir,
  diff,
  distanceSq,
  key2pos,
  kingDirNonCastling,
  knightDir,
  opposite,
  pawnDirAdvance,
  pawnDirCapture,
  pos2key,
  queenDir,
  rookDir,
  samePiece,
  samePos,
  squaresBetween,
  squareShiftedVertically,
  uciToMove,
} from '../src/util';

test('key2pos converts squares to coordinates', () => {
  expect(key2pos('a1')).toEqual([0, 0]);
  expect(key2pos('h1')).toEqual([7, 0]);
  expect(key2pos('a8')).toEqual([0, 7]);
  expect(key2pos('e4')).toEqual([4, 3]);
});

test('pos2key converts coordinates to squares', () => {
  expect(pos2key([0, 0])).toBe('a1');
  expect(pos2key([7, 7])).toBe('h8');
  expect(pos2key([4, 3])).toBe('e4');
  expect(pos2key([8, 0])).toBe(undefined);
  expect(pos2key([0, -1])).toBe(undefined);
});

test('uciToMove parses moves and drops', () => {
  expect(uciToMove(undefined)).toBe(undefined);
  expect(uciToMove('e2e4')).toEqual(['e2', 'e4']);
  expect(uciToMove('P@e4')).toEqual(['e4']);
});

test('opposite flips colors', () => {
  expect(opposite('white')).toBe('black');
  expect(opposite('black')).toBe('white');
});

test('diff and distanceSq', () => {
  expect(diff(0, 3)).toBe(3);
  expect(distanceSq([0, 0], [3, 4])).toBe(25);
  expect(samePos([1, 2], [1, 2])).toBe(true);
  expect(samePos([1, 2], [2, 1])).toBe(false);
  expect(samePiece({ role: 'pawn', color: 'white' }, { role: 'pawn', color: 'white' })).toBe(true);
  expect(samePiece({ role: 'pawn', color: 'white' }, { role: 'pawn', color: 'black' })).toBe(false);
});

test('knight direction', () => {
  expect(knightDir(4, 4, 5, 6)).toBe(true);
  expect(knightDir(4, 4, 6, 5)).toBe(true);
  expect(knightDir(4, 4, 5, 5)).toBe(false);
});

test('rook, bishop, queen and king directions', () => {
  expect(rookDir(0, 0, 0, 5)).toBe(true);
  expect(rookDir(0, 0, 5, 5)).toBe(false);
  expect(bishopDir(2, 0, 5, 3)).toBe(true);
  expect(bishopDir(2, 0, 2, 3)).toBe(false);
  expect(queenDir(0, 0, 0, 5)).toBe(true);
  expect(queenDir(2, 0, 5, 3)).toBe(true);
  expect(queenDir(0, 0, 1, 2)).toBe(false);
  expect(kingDirNonCastling(4, 4, 5, 5)).toBe(true);
  expect(kingDirNonCastling(4, 4, 6, 6)).toBe(false);
});

test('pawn capture and advance', () => {
  expect(pawnDirCapture(4, 1, 5, 2, true)).toBe(true);
  expect(pawnDirCapture(4, 1, 4, 2, true)).toBe(false);
  expect(pawnDirAdvance(4, 1, 4, 2, true)).toBe(true);
  expect(pawnDirAdvance(4, 1, 4, 3, true)).toBe(true);
  expect(pawnDirAdvance(4, 2, 4, 4, true)).toBe(false);
});

test('squaresBetween returns exclusive squares on a line', () => {
  expect(squaresBetween(0, 0, 0, 3)).toEqual(['a2', 'a3']);
  expect(squaresBetween(0, 0, 3, 3)).toEqual(['b2', 'c3']);
  expect(squaresBetween(0, 0, 0, 1)).toEqual([]);
  expect(squaresBetween(0, 0, 1, 2)).toEqual([]);
});

test('adjacentSquares and squareShiftedVertically', () => {
  expect(adjacentSquares('e4')).toEqual(['d4', 'f4']);
  expect(adjacentSquares('a1')).toEqual(['b1']);
  expect(squareShiftedVertically('e2', 1)).toBe('e3');
  expect(squareShiftedVertically('e8', 1)).toBe(undefined);
});

test('allKeys contains 64 squares', () => {
  expect(allKeys.length).toBe(64);
  expect(allKeys).toContain('e4');
});
