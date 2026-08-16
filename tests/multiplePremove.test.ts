import { afterEach, expect, test, vi } from 'vitest';

import { start } from '../src/api';
import { playPremove, setPieces, userMove } from '../src/board';
import { configure } from '../src/config';
import { defaults, type HeadlessState, type State } from '../src/state';
import type * as cg from '../src/types';

const position = (whiteKing: cg.Key, blackKing: cg.Key = 'h8'): cg.Pieces =>
  new Map([
    [whiteKing, { role: 'king', color: 'white' }],
    [blackKing, { role: 'king', color: 'black' }],
  ]);

const makeState = (maxCount: number): HeadlessState => {
  const state = defaults();
  state.pieces = position('g2');
  state.turnColor = 'black';
  state.movable.color = 'white';
  state.movable.free = false;
  state.premovable.maxCount = maxCount;
  return state;
};

const flushPreview = (): void => vi.runAllTimers();

const applyAuthoritativePosition = (state: HeadlessState, piecesFen: string, dests: cg.Dests): void => {
  configure(state, {
    fen: piecesFen,
    turnColor: 'white',
    movable: {
      color: 'white',
      free: false,
      dests,
    },
  });
};

afterEach(() => vi.useRealTimers());

test('single premove mode keeps the legacy non-preview behaviour', () => {
  const state = makeState(1);

  expect(userMove(state, 'g2', 'f2')).toBe(true);
  expect(state.premovable.queue).toEqual([['g2', 'f2']]);
  expect(state.premovable.current).toEqual(['g2', 'f2']);
  expect(state.pieces.has('g2')).toBe(true);
  expect(state.pieces.has('f2')).toBe(false);
});

test('multiple premoves build a speculative position and execute in order', () => {
  vi.useFakeTimers();
  const state = makeState(4);

  expect(userMove(state, 'g2', 'f2')).toBe(true);
  // Preserve the established async callback contract: preview is built after the callback tick.
  expect(state.pieces.has('g2')).toBe(true);
  flushPreview();
  expect(state.pieces.has('f2')).toBe(true);

  expect(userMove(state, 'f2', 'e2')).toBe(true);
  flushPreview();
  expect(state.pieces.has('e2')).toBe(true);
  expect(state.premovable.queue).toEqual([
    ['g2', 'f2'],
    ['f2', 'e2'],
  ]);

  applyAuthoritativePosition(state, '7k/8/8/8/8/8/6K1/8 w - - 0 1', new Map([['g2', ['f2']]]));

  expect(playPremove(state)).toBe(true);
  expect(state.premovable.queue).toEqual([['f2', 'e2']]);
  // Callbacks see the normal post-head board before the dependent preview is restored.
  expect(state.pieces.has('f2')).toBe(true);
  expect(state.pieces.has('e2')).toBe(false);
  flushPreview();
  expect(state.pieces.has('e2')).toBe(true);
  expect(state.pieces.has('f2')).toBe(false);

  applyAuthoritativePosition(state, '8/7k/8/8/8/8/5K2/8 w - - 0 1', new Map([['f2', ['e2']]]));

  expect(playPremove(state)).toBe(true);
  expect(state.premovable.queue).toEqual([]);
  expect(state.premovable.current).toBeUndefined();
  expect(state.pieces.has('e2')).toBe(true);
});

test('getFen reports the authoritative base while a speculative queue is displayed', () => {
  vi.useFakeTimers();
  const state = makeState(4);
  const api = start(state as State, () => {});

  expect(userMove(state, 'g2', 'f2')).toBe(true);
  flushPreview();

  expect(state.pieces.has('f2')).toBe(true);
  expect(api.getFen()).toBe('7k/8/8/8/8/8/6K1/8');
});

test('an illegal queue head cancels the dependent tail and restores the real position', () => {
  vi.useFakeTimers();
  const state = makeState(4);

  expect(userMove(state, 'g2', 'f2')).toBe(true);
  flushPreview();
  expect(userMove(state, 'f2', 'e2')).toBe(true);
  flushPreview();

  applyAuthoritativePosition(state, '8/7k/8/8/8/8/6K1/8 w - - 0 1', new Map([['g2', ['h2']]]));

  expect(playPremove(state)).toBe(false);
  expect(state.premovable.queue).toEqual([]);
  expect(state.premovable.current).toBeUndefined();
  expect(state.pieces.has('g2')).toBe(true);
  expect(state.pieces.has('h7')).toBe(true);
  expect(state.pieces.has('h8')).toBe(false);
  expect(state.pieces.has('f2')).toBe(false);
  expect(state.pieces.has('e2')).toBe(false);
});

test('programmatic piece updates are retained when rebuilding a queued preview', () => {
  vi.useFakeTimers();
  const state = makeState(4);

  expect(userMove(state, 'g2', 'f2')).toBe(true);
  flushPreview();
  expect(userMove(state, 'f2', 'e2')).toBe(true);
  flushPreview();

  applyAuthoritativePosition(state, '7k/8/8/8/8/8/6K1/8 w - - 0 1', new Map([['g2', ['f2']]]));
  expect(playPremove(state)).toBe(true);

  // Models a synchronous downstream board correction performed by an existing
  // move callback (promotion, en passant or atomic explosion) before preview rebuild.
  setPieces(state, new Map([['h8', undefined]]));
  flushPreview();

  expect(state.premovable.basePieces?.has('h8')).toBe(false);
  expect(state.pieces.has('h8')).toBe(false);
  expect(state.pieces.has('e2')).toBe(true);
});

test('disabling premoves clears the queue and restores authoritative pieces', () => {
  vi.useFakeTimers();
  const state = makeState(4);

  expect(userMove(state, 'g2', 'f2')).toBe(true);
  flushPreview();
  expect(userMove(state, 'f2', 'e2')).toBe(true);
  flushPreview();
  expect(state.pieces.has('e2')).toBe(true);

  configure(state, { premovable: { enabled: false } });

  expect(state.premovable.enabled).toBe(false);
  expect(state.premovable.queue).toEqual([]);
  expect(state.premovable.current).toBeUndefined();
  expect(state.pieces.has('g2')).toBe(true);
  expect(state.pieces.has('f2')).toBe(false);
  expect(state.pieces.has('e2')).toBe(false);
});

test('switching multiple premoves to single keeps only the head without previewing it', () => {
  vi.useFakeTimers();
  const state = makeState(4);

  expect(userMove(state, 'g2', 'f2')).toBe(true);
  flushPreview();
  expect(userMove(state, 'f2', 'e2')).toBe(true);
  flushPreview();
  expect(state.pieces.has('e2')).toBe(true);

  configure(state, { premovable: { maxCount: 1 } });

  expect(state.premovable.maxCount).toBe(1);
  expect(state.premovable.queue).toEqual([['g2', 'f2']]);
  expect(state.premovable.current).toEqual(['g2', 'f2']);
  expect(state.pieces.has('g2')).toBe(true);
  expect(state.pieces.has('f2')).toBe(false);
  expect(state.pieces.has('e2')).toBe(false);
});

test('consuming the last queued premove emits the legacy unset callback', () => {
  vi.useFakeTimers();
  const state = makeState(2);
  const unset = vi.fn();
  state.premovable.events.unset = unset;

  expect(userMove(state, 'g2', 'f2')).toBe(true);
  flushPreview();
  applyAuthoritativePosition(state, '7k/8/8/8/8/8/6K1/8 w - - 0 1', new Map([['g2', ['f2']]]));

  expect(playPremove(state)).toBe(true);
  expect(state.premovable.queue).toEqual([]);
  expect(unset).not.toHaveBeenCalled();
  flushPreview();
  expect(unset).toHaveBeenCalledTimes(1);
});
