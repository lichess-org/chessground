import { bentArrowPath, isKnightMove } from '../src/svg';
import type * as cg from '../src/types';

// Square board (width = height), white orientation, so pos2user reduces to
// x = file - 3.5, y = 3.5 - rank. These match the coordinates svg.ts computes.
const centerOf = (key: cg.Key): cg.NumberPair => {
  const [file, rank] = [key.charCodeAt(0) - 97, key.charCodeAt(1) - 49];
  return [file - 3.5, 3.5 - rank];
};

const pathPoints = (d: string): cg.NumberPair[] =>
  d
    .split(/\s+/)
    .filter(t => t !== 'M' && t !== 'L')
    .map(t => t.split(',').map(Number));

test('isKnightMove only matches (1,2)/(2,1) deltas', () => {
  expect(isKnightMove('g1', 'e2')).toBe(true);
  expect(isKnightMove('c6', 'e5')).toBe(true);
  expect(isKnightMove('e2', 'e4')).toBe(false); // same file pawn double
  expect(isKnightMove('e2', 'e5')).toBe(false); // straight three
  expect(isKnightMove('e2', 'e2')).toBe(false); // no move
});

test('knight bend pivots on the long (2-square) leg and ends on the destination', () => {
  // g1 -> e2: 2 files, 1 rank -> long leg runs along the file.
  const from = centerOf('g1'),
    to = centerOf('e2'),
    d = bentArrowPath({ orig: 'g1', dest: 'e2' }, from, to, 0);
  const [p1, p2, p3] = pathPoints(d);
  expect(p1).toEqual([2.5, 3.5]);
  expect(p2).toEqual([0.5, 3.5]); // pivot level with dest on file, orig on rank
  expect(p3).toEqual([0.5, 2.5]);
});

test('knight bend handles the rank-long orientation', () => {
  // e5 -> d7: 1 file, 2 ranks -> long leg runs along the rank.
  const from = centerOf('e5'),
    to = centerOf('d7'),
    d = bentArrowPath({ orig: 'e5', dest: 'd7' }, from, to, 0);
  const [p1, p2, p3] = pathPoints(d);
  expect(p1).toEqual([0.5, -0.5]);
  expect(p2).toEqual([0.5, -2.5]); // pivot level with orig on file, dest on rank
  expect(p3).toEqual([-0.5, -2.5]);
});

test('knight bend shortens the final segment so the arrowhead is not overlapped', () => {
  const from = centerOf('g1'),
    to = centerOf('e2'),
    m = 10 / 64,
    d = bentArrowPath({ orig: 'g1', dest: 'e2' }, from, to, m);
  const [, , p3] = pathPoints(d);
  // The straight-line code shortens the arrow by moving its endpoint back along
  // the incoming direction; here the last leg runs downward, so the endpoint
  // moves back up toward the pivot (2.5 + m), leaving room for the arrowhead.
  expect(p3[0]).toBeCloseTo(0.5);
  expect(p3[1]).toBeCloseTo(2.5 + m);
});
