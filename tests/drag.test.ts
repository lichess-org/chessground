import { afterEach, expect, test, vi } from 'vitest';

import { type DragCurrent, move } from '../src/drag';
import type { State } from '../src/state';
import type * as cg from '../src/types';

afterEach(() => vi.restoreAllMocks());

test('drag moves are coalesced into one animation frame', () => {
  const callbacks: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callbacks.push(callback);
    return callbacks.length;
  });
  const current = { pos: [0, 0] } as DragCurrent;
  const state = { draggable: { current } } as State;

  move(state, { clientX: 1, clientY: 2 } as cg.MouchEvent);
  move(state, { clientX: 3, clientY: 4 } as cg.MouchEvent);

  expect(callbacks).toHaveLength(1);
  expect(current.pos).toEqual([3, 4]);

  state.draggable.current = undefined;
  callbacks[0](0);
  expect(callbacks).toHaveLength(1);
});
