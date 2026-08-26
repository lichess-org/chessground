import * as board from '../src/board';
import { applyMoveToPieces, premove } from '../src/premove';
import { defaults, type HeadlessState } from '../src/state';
import type * as cg from '../src/types';

export const makeState = (pieces: cg.Pieces, turnColor: cg.Color, movableColor: cg.Color): HeadlessState => {
  const state = defaults();
  state.pieces = pieces;
  state.turnColor = turnColor;
  state.movable.color = movableColor;
  state.premovable.multiple = true;
  return state;
};

test('applyMoveToPieces relocates the piece and captures the destination', () => {
  const pieces: cg.Pieces = new Map([
    ['e3', { role: 'knight', color: 'white' }],
    ['h6', { role: 'bishop', color: 'black' }],
  ]);
  const result = applyMoveToPieces(pieces, 'e3', 'h6');
  expect(result.get('e3')).toBeUndefined();
  expect(result.get('h6')).toEqual({ role: 'knight', color: 'white' });
});

test('premove queue computes destinations against a hypothetical board', () => {
  const pieces: cg.Pieces = new Map([
    ['b8', { role: 'knight', color: 'black' }],
    ['e8', { role: 'king', color: 'black' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'white', 'black');

  // On the real board c6 is empty, so no premove destinations.
  expect(new Set(premove(state, 'c6'))).toEqual(new Set());

  // On the hypothetical board the queued knight now sits on c6.
  state.premovable.queue = [{ orig: 'b8', dest: 'c6' }];
  const dests = new Set(premove(state, 'c6'));
  expect(dests.has('e5')).toBe(true);
  expect(dests.has('d4')).toBe(true);
});

test('queue items can chain by continuing to move the same piece', () => {
  const pieces: cg.Pieces = new Map([
    ['b8', { role: 'knight', color: 'black' }],
    ['e8', { role: 'king', color: 'black' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'white', 'black');

  expect(board.userMove(state, 'b8', 'c6')).toBe(true);
  expect(state.premovable.queue).toEqual([{ orig: 'b8', dest: 'c6' }]);
  // The second move starts from the knight's hypothetical destination.
  expect(board.userMove(state, 'c6', 'e5')).toBe(true);
  expect(state.premovable.queue).toEqual([
    { orig: 'b8', dest: 'c6' },
    { orig: 'c6', dest: 'e5' },
  ]);
  expect(state.premovable.current).toEqual(['b8', 'c6']);
});

test('re-queueing an origin replaces that item and everything after it', () => {
  const pieces: cg.Pieces = new Map([
    ['b8', { role: 'knight', color: 'black' }],
    ['e8', { role: 'king', color: 'black' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'white', 'black');
  state.premovable.queue = [
    { orig: 'b8', dest: 'c6' },
    { orig: 'c6', dest: 'e5' },
  ];
  // Re-queueing from c6 (an existing origin) truncates from there and replaces it.
  expect(board.userMove(state, 'c6', 'a5')).toBe(true);
  expect(state.premovable.queue).toEqual([
    { orig: 'b8', dest: 'c6' },
    { orig: 'c6', dest: 'a5' },
  ]);
});

test('queue respects maxQueueLength', () => {
  const pieces: cg.Pieces = new Map([
    ['b8', { role: 'knight', color: 'black' }],
    ['a7', { role: 'pawn', color: 'black' }],
    ['e8', { role: 'king', color: 'black' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'white', 'black');
  state.premovable.maxQueueLength = 2;
  state.premovable.queue = [
    { orig: 'b8', dest: 'c6' },
    { orig: 'a7', dest: 'a6' },
  ];
  // The third move exceeds the cap and is ignored.
  board.userMove(state, 'c6', 'e5');
  expect(state.premovable.queue.length).toBe(2);
});

test('playPremove plays the front and keeps the rest of the queue', () => {
  const pieces: cg.Pieces = new Map([
    ['a7', { role: 'pawn', color: 'black' }],
    ['e8', { role: 'king', color: 'black' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'black', 'black');
  state.movable.free = false;
  state.premovable.queue = [
    { orig: 'a7', dest: 'a6' },
    { orig: 'e8', dest: 'e7' },
  ];
  state.movable.dests = new Map([
    ['a7', ['a6']],
    ['e8', ['e7']],
  ]);

  expect(board.playPremove(state)).toBe(true);
  expect(state.pieces.get('a6')).toEqual({ role: 'pawn', color: 'black' });
  expect(state.pieces.has('a7')).toBe(false);
  expect(state.turnColor).toBe('white');
  // Only one move happens per turn; the second item stays queued.
  expect(state.premovable.queue).toEqual([{ orig: 'e8', dest: 'e7' }]);
  expect(state.premovable.current).toEqual(['e8', 'e7']);
});

test('cancelPremove pops the front and popLastPremove pops the back of the queue', () => {
  const pieces: cg.Pieces = new Map([
    ['b8', { role: 'knight', color: 'black' }],
    ['a7', { role: 'pawn', color: 'black' }],
    ['e8', { role: 'king', color: 'black' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'white', 'black');
  state.premovable.queue = [
    { orig: 'b8', dest: 'c6' },
    { orig: 'a7', dest: 'a6' },
  ];
  state.premovable.current = ['b8', 'c6'];

  board.popLastPremove(state);
  expect(state.premovable.queue).toEqual([{ orig: 'b8', dest: 'c6' }]);

  board.cancelPremoveFront(state);
  expect(state.premovable.queue).toEqual([]);
  expect(state.premovable.current).toBeUndefined();
});

test('cancelPremoveQueue clears the whole queue', () => {
  const pieces: cg.Pieces = new Map([
    ['b8', { role: 'knight', color: 'black' }],
    ['a7', { role: 'pawn', color: 'black' }],
    ['e8', { role: 'king', color: 'black' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'white', 'black');
  state.premovable.queue = [
    { orig: 'b8', dest: 'c6' },
    { orig: 'a7', dest: 'a6' },
  ];
  state.premovable.current = ['b8', 'c6'];

  board.unsetPremoveQueue(state);
  expect(state.premovable.queue).toEqual([]);
  expect(state.premovable.current).toBeUndefined();
});

test('playPremove clears the whole queue when the front becomes illegal', () => {
  const pieces: cg.Pieces = new Map([
    ['a7', { role: 'pawn', color: 'black' }],
    ['e8', { role: 'king', color: 'black' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'black', 'black');
  state.movable.free = false;
  state.premovable.queue = [
    { orig: 'a7', dest: 'a6' },
    { orig: 'e8', dest: 'e7' },
  ];
  state.movable.dests = new Map([['a7', ['a5']]]);

  expect(board.playPremove(state)).toBe(false);
  expect(state.premovable.queue).toEqual([]);
  expect(state.premovable.current).toBeUndefined();
});
