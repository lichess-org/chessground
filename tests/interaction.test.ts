import { Chessground } from '../src/chessground';
import type * as cg from '../src/types';

const rect = { top: 0, left: 0, width: 400, height: 400, right: 400, bottom: 400 };
beforeAll(() => {
  HTMLElement.prototype.getBoundingClientRect = () => rect as DOMRect;
});
beforeEach(() => {
  document.body.innerHTML = '';
});

const centerOf = (key: cg.Key): cg.NumberPair => {
  const [f, r] = [key.charCodeAt(0) - 97, key.charCodeAt(1) - 49];
  return [((f + 0.5) * 400) / 8, ((7 - r + 0.5) * 400) / 8];
};

const makeBoard = (config: Record<string, any>) => {
  const el = document.createElement('div');
  document.body.appendChild(el);
  el.className = 'cg-wrap';
  return Chessground(el as any, config);
};

const mdoc = (type: string, clientX: number, clientY: number) =>
  new MouseEvent(type, {
    clientX,
    clientY,
    bubbles: true,
    cancelable: true,
    isTrusted: true,
  } as MouseEventInit);

const click = (key: cg.Key) => {
  const [x, y] = centerOf(key);
  const b = document.querySelector('cg-board')!;
  b.dispatchEvent(mdoc('mousedown', x, y));
  document.dispatchEvent(mdoc('mouseup', x, y));
};

const BOARD_FEN = '8/8/8/4k3/8/8/4P3/4K1N1 w - - 0 1'; // e2 pawn, g1 knight, e5 black king

test('config-enabled multi-premove queue via click-click', () => {
  const ground = makeBoard({
    fen: BOARD_FEN,
    turnColor: 'black',
    movable: { color: 'white', dests: new Map() },
    premovable: { enabled: true, multiple: true, showDests: true },
    trustAllEvents: true,
  });
  click('e2');
  click('e4');
  click('g1');
  click('f3');
  expect(ground.state.premovable.queue).toEqual([
    { orig: 'e2', dest: 'e4' },
    { orig: 'g1', dest: 'f3' },
  ]);
});

test('single-premove mode holds exactly one premove (queue stays empty)', () => {
  const ground = makeBoard({
    fen: BOARD_FEN,
    turnColor: 'black',
    movable: { color: 'white', dests: new Map() },
    premovable: { enabled: true, multiple: false },
    trustAllEvents: true,
  });
  click('e2');
  click('e4');
  // Single mode: one premove, no queue.
  expect(ground.state.premovable.current).toEqual(['e2', 'e4']);
  expect(ground.state.premovable.queue).toEqual([]);
});

test('reconfiguring via set() preserves multiple/maxQueueLength and the queue', () => {
  const ground = makeBoard({
    fen: BOARD_FEN,
    turnColor: 'black',
    movable: { color: 'white', dests: new Map() },
    premovable: { enabled: true, multiple: true, maxQueueLength: 4 },
    trustAllEvents: true,
  });
  click('e2');
  click('e4');
  expect(ground.state.premovable.queue.length).toBe(1);
  // A typical host reconfigures on every turn, often without re-passing premovable.
  ground.set({ fen: BOARD_FEN, turnColor: 'black', movable: { color: 'white', dests: new Map() } });
  expect(ground.state.premovable.multiple).toBe(true);
  expect(ground.state.premovable.maxQueueLength).toBe(4);
  expect(ground.state.premovable.queue).toEqual([{ orig: 'e2', dest: 'e4' }]);
});

test('config flags land on state', () => {
  const ground = makeBoard({
    premovable: { multiple: true, maxQueueLength: 3 },
    drawable: { enabled: true, knightMoveBend: true },
  });
  expect(ground.state.premovable.multiple).toBe(true);
  expect(ground.state.premovable.maxQueueLength).toBe(3);
  expect(ground.state.drawable.knightMoveBend).toBe(true);
});

test('knightMoveBend renders a two-segment bent path for a knight arrow', () => {
  const ground = makeBoard({
    drawable: {
      enabled: true,
      knightMoveBend: true,
      autoShapes: [{ orig: 'g1', dest: 'f3', brush: 'green' }],
    },
  });
  const g = ground.state.dom.elements.shapes!.querySelector('g')!;
  const arrowPaths = Array.from(g.querySelectorAll('path')).filter(p => p.getAttribute('d')!.includes('L'));
  expect(arrowPaths.length).toBe(1);
  expect(
    arrowPaths[0]
      .getAttribute('d')!
      .split(/\s/)
      .filter(t => t === 'L').length,
  ).toBe(2);
});

test('non-knight arrows stay straight even with knightMoveBend enabled', () => {
  const ground = makeBoard({
    drawable: {
      enabled: true,
      knightMoveBend: true,
      autoShapes: [{ orig: 'e2', dest: 'e4', brush: 'green' }],
    },
  });
  const g = ground.state.dom.elements.shapes!.querySelector('g')!;
  expect(g.querySelectorAll('line').length).toBeGreaterThan(0);
});

test('multi mode: clicking empty/unrelated squares never clears the queue', () => {
  const ground = makeBoard({
    fen: BOARD_FEN,
    turnColor: 'black',
    movable: { color: 'white', dests: new Map() },
    premovable: { enabled: true, multiple: true },
    trustAllEvents: true,
  });
  click('e2');
  click('e4');
  expect(ground.state.premovable.queue.length).toBe(1);
  // Clicking an empty square / a black king square must be a no-op for the queue.
  click('a8');
  click('e5');
  expect(ground.state.premovable.queue).toEqual([{ orig: 'e2', dest: 'e4' }]);
});

test('multi mode renders ordinal queue highlight classes on the squares', () => {
  const ground = makeBoard({
    fen: BOARD_FEN,
    turnColor: 'black',
    movable: { color: 'white', dests: new Map() },
    premovable: { enabled: true, multiple: true },
    trustAllEvents: true,
  });
  click('e2');
  click('e4');
  click('g1');
  click('f3');
  ground.state.dom.redrawNow();
  const squares = Array.from(ground.state.dom.elements.board.querySelectorAll('square'));
  const hasClass = (key: cg.Key, cls: string) =>
    squares.some(sq => (sq as any).cgKey === key && sq.classList.contains(cls));
  expect(hasClass('e2', 'premove-queue-1')).toBe(true);
  expect(hasClass('e4', 'premove-queue-1')).toBe(true);
  expect(hasClass('g1', 'premove-queue-2')).toBe(true);
  expect(hasClass('f3', 'premove-queue-2')).toBe(true);
});
