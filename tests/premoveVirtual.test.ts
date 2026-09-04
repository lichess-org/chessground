import { Chessground } from '../src/chessground';
import * as board from '../src/board';
import { configure } from '../src/config';
import { applyMoveToPieces, fullPremovePieces } from '../src/premove';
import { stageAt } from '../src/premovePieces';
import { defaults, type HeadlessState } from '../src/state';
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

const BOARD_FEN = '8/8/8/4k3/8/8/4P3/4K1N1 w - - 0 1';
const makeState = (pieces: cg.Pieces, turnColor: cg.Color, movableColor: cg.Color): HeadlessState => {
  const state = defaults();
  state.pieces = pieces;
  state.turnColor = turnColor;
  state.movable.color = movableColor;
  state.premovable.multiple = true;
  return state;
};

test('applyMoveToPieces models castling rook relocation', () => {
  const pieces: cg.Pieces = new Map([
    ['e1', { role: 'king', color: 'white' }],
    ['h1', { role: 'rook', color: 'white' }],
    ['e8', { role: 'king', color: 'black' }],
  ]);
  const result = applyMoveToPieces(pieces, 'e1', 'g1');
  expect(result.get('e1')).toBeUndefined();
  expect(result.get('h1')).toBeUndefined();
  expect(result.get('g1')).toEqual({ role: 'king', color: 'white' });
  expect(result.get('f1')).toEqual({ role: 'rook', color: 'white' });
});

test('applyMoveToPieces models pawn promotion (defaults to queen)', () => {
  const pieces: cg.Pieces = new Map([
    ['a7', { role: 'pawn', color: 'white' }],
    ['h8', { role: 'rook', color: 'black' }],
  ]);
  const result = applyMoveToPieces(pieces, 'a7', 'a8');
  expect(result.get('a8')).toEqual({ role: 'queen', color: 'white', promoted: true });
});

test('applyMoveToPieces honors explicit promotion role', () => {
  const pieces: cg.Pieces = new Map([
    ['a7', { role: 'pawn', color: 'white' }],
    ['h8', { role: 'rook', color: 'black' }],
  ]);
  const result = applyMoveToPieces(pieces, 'a7', 'a8', { promotion: 'knight' });
  expect(result.get('a8')).toEqual({ role: 'knight', color: 'white', promoted: true });
});

test('applyMoveToPieces models en-passant capture', () => {
  // White pawn on e5, black pawn on d5, white plays exd6 en passant.
  const pieces: cg.Pieces = new Map([
    ['e5', { role: 'pawn', color: 'white' }],
    ['d5', { role: 'pawn', color: 'black' }],
    ['e8', { role: 'king', color: 'black' }],
  ]);
  const result = applyMoveToPieces(pieces, 'e5', 'd6');
  expect(result.get('e5')).toBeUndefined();
  expect(result.get('d5')).toBeUndefined();
  expect(result.get('d6')).toEqual({ role: 'pawn', color: 'white' });
});

test('a queued item with no matching origin in the hypothetical board is a no-op', () => {
  // First move relocates the b8 knight, so a follow-up "from b8" item has no
  // origin in the resulting hypothetical board and must be silently skipped.
  const pieces: cg.Pieces = new Map([
    ['b8', { role: 'knight', color: 'black' }],
    ['e8', { role: 'king', color: 'black' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'white', 'black');
  state.premovable.queue = [
    { orig: 'b8', dest: 'c6' },
    { orig: 'b8', dest: 'a6' }, // invalid follow-up: b8 is empty after stage 0
  ];
  const v = fullPremovePieces(state);
  expect(v.get('c6')).toEqual({ role: 'knight', color: 'black' });
  expect(v.has('a6')).toBe(false);
});

test('queue immutability: queueSet receives a copy, not the internal array', async () => {
  const pieces: cg.Pieces = new Map([
    ['e2', { role: 'pawn', color: 'white' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'black', 'white');
  const seen: cg.Premove[][] = [];
  state.premovable.events.queueSet = q => seen.push(q);
  board.userMove(state, 'e2', 'e4');
  // queueSet is invoked via setTimeout — flush microtasks/macrotasks.
  await new Promise(r => setTimeout(r, 5));
  expect(seen.length).toBe(1);
  // Mutating the snapshot must not affect the internal queue.
  seen[0].length = 0;
  expect(state.premovable.queue).toEqual([{ orig: 'e2', dest: 'e4' }]);
});

test('maxQueueLength normalizes non-positive values to 1', () => {
  const ground = makeBoard({
    fen: BOARD_FEN,
    turnColor: 'black',
    movable: { color: 'white', dests: new Map() },
    premovable: { enabled: true, multiple: true, maxQueueLength: 0 },
    trustAllEvents: true,
  });
  expect(ground.state.premovable.maxQueueLength).toBe(1);
});

test('lowering maxQueueLength truncates the queue', () => {
  const pieces: cg.Pieces = new Map([
    ['e2', { role: 'pawn', color: 'white' }],
    ['g1', { role: 'knight', color: 'white' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'black', 'white');
  state.movable.free = false;
  state.premovable.queue = [
    { orig: 'e2', dest: 'e4' },
    { orig: 'g1', dest: 'f3' },
  ];
  state.movable.dests = new Map();
  // Reconfigure with a smaller cap.
  state.movable.dests = undefined;
  configure(state, { premovable: { maxQueueLength: 1 } });
  expect(state.premovable.queue.length).toBe(1);
  expect(state.premovable.queue[0]).toEqual({ orig: 'e2', dest: 'e4' });
});

test('switching from single to multiple (or vice versa) clears the queue', () => {
  const pieces: cg.Pieces = new Map([
    ['e2', { role: 'pawn', color: 'white' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'black', 'white');
  state.premovable.multiple = false;
  board.userMove(state, 'e2', 'e4');
  expect(state.premovable.current).toEqual(['e2', 'e4']);
  configure(state, { premovable: { multiple: true } });
  expect(state.premovable.current).toBeUndefined();
  expect(state.premovable.queue).toEqual([]);
});

test('Api.playPremove returns false when the queue is empty even if current is set', () => {
  const pieces: cg.Pieces = new Map([
    ['e2', { role: 'pawn', color: 'white' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const ground = makeBoard({
    fen: '8/8/8/8/8/8/4P3/4K3 b - - 0 1',
    turnColor: 'black',
    movable: { color: 'white', dests: new Map() },
    premovable: { enabled: true, multiple: true, showDests: true },
    trustAllEvents: true,
  });
  // Stale `current` set manually but queue is empty.
  ground.state.premovable.queue = [];
  ground.state.premovable.current = ['e2', 'e4'];
  expect(ground.playPremove()).toBe(false);
});

test('virtual layer renders the moved piece at the destination and hides the source', () => {
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
  ground.state.dom.redrawNow();
  const layer = ground.state.dom.elements.premovePieces!;
  const virtual = Array.from(layer.querySelectorAll('piece')) as cg.PieceNode[];
  expect(virtual.length).toBe(2);
  const keys = virtual.map(n => n.cgKey).sort();
  expect(keys).toEqual(['e4', 'f3']);
  // The authoritative source nodes (e2, g1) should be visually hidden.
  const boardEl = ground.state.dom.elements.board;
  const hidden = Array.from(boardEl.querySelectorAll('piece.premove-source')) as cg.PieceNode[];
  const hiddenKeys = hidden.map(n => n.cgKey).sort();
  expect(hiddenKeys).toEqual(['e2', 'g1']);
});

test('drag from a virtual destination retargets the owning queue stage, preserving its origin', async () => {
  const ground = makeBoard({
    fen: BOARD_FEN,
    turnColor: 'black',
    movable: { color: 'white', dests: new Map() },
    premovable: { enabled: true, multiple: true, showDests: true },
    trustAllEvents: true,
  });
  // Queue two premoves via click-click.
  click('e2');
  click('e4');
  click('g1');
  click('f3');
  ground.state.dom.redrawNow();
  // Drag the virtual knight on f3 onto g5. The knight's true origin is g1, so
  // the stage that used to read g1→f3 is retargeted to g1→g5.
  const [x0, y0] = centerOf('f3');
  const [x1, y1] = centerOf('g5');
  const b = document.querySelector('cg-board')!;
  b.dispatchEvent(mdoc('mousedown', x0, y0));
  document.dispatchEvent(mdoc('mousemove', x1, y1));
  // Wait for the next animation frame used by processDrag.
  await new Promise(r => requestAnimationFrame(() => r(null)));
  document.dispatchEvent(mdoc('mouseup', x1, y1));
  ground.state.dom.redrawNow();
  // Stage 0 is preserved; stage 1 is retargeted to g1→g5.
  expect(ground.state.premovable.queue).toEqual([
    { orig: 'e2', dest: 'e4' },
    { orig: 'g1', dest: 'g5' },
  ]);
  const layer = ground.state.dom.elements.premovePieces!;
  const virtual = Array.from(layer.querySelectorAll('piece')) as cg.PieceNode[];
  expect(virtual.map(n => n.cgKey).sort()).toEqual(['e4', 'g5']);
  const boardEl = ground.state.dom.elements.board;
  const hidden = Array.from(boardEl.querySelectorAll('piece.premove-source')) as cg.PieceNode[];
  expect(hidden.map(n => n.cgKey).sort()).toEqual(['e2', 'g1']);
  // Authoritative state.pieces and FEN remain untouched.
  expect(ground.state.pieces.get('e4')).toBeUndefined();
  expect(ground.state.pieces.get('g5')).toBeUndefined();
  expect(ground.getFen()).toBe(BOARD_FEN.split(' ')[0]);
});

test('state.pieces and getFen() remain unchanged while premoves are queued', () => {
  const ground = makeBoard({
    fen: BOARD_FEN,
    turnColor: 'black',
    movable: { color: 'white', dests: new Map() },
    premovable: { enabled: true, multiple: true, showDests: true },
    trustAllEvents: true,
  });
  const fenBefore = ground.getFen();
  click('e2');
  click('e4');
  click('g1');
  click('f3');
  expect(ground.state.pieces.get('e2')).toBeDefined();
  expect(ground.state.pieces.get('e4')).toBeUndefined();
  expect(ground.getFen()).toBe(fenBefore);
});

test('stageAt locates the queue index that owns a virtual destination', () => {
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
  expect(stageAt(ground.state, 'e4')).toBe(0);
  expect(stageAt(ground.state, 'f3')).toBe(1);
  expect(stageAt(ground.state, 'e2')).toBeUndefined();
});

test('orientation flip moves virtual pieces correctly without mutating state', () => {
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
  ground.state.dom.redrawNow();
  ground.toggleOrientation();
  // Queue must survive the flip.
  expect(ground.state.premovable.queue.length).toBe(2);
  const layer = ground.state.dom.elements.premovePieces!;
  const virtual = Array.from(layer.querySelectorAll('piece')) as cg.PieceNode[];
  expect(virtual.map(n => n.cgKey).sort()).toEqual(['e4', 'f3']);
});

test('cancelPremoveQueue removes the virtual pieces and unhides sources', () => {
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
  ground.state.dom.redrawNow();
  ground.cancelPremoveQueue();
  ground.state.dom.redrawNow();
  expect(ground.state.premovable.queue).toEqual([]);
  const layer = ground.state.dom.elements.premovePieces!;
  expect(layer.querySelectorAll('piece').length).toBe(0);
  const hidden = Array.from(ground.state.dom.elements.board.querySelectorAll('piece.premove-source'));
  expect(hidden.length).toBe(0);
});

test('setting a new FEN keeps the pending queue for validation at play time', () => {
  const ground = makeBoard({
    fen: BOARD_FEN,
    turnColor: 'black',
    movable: { color: 'white', dests: new Map() },
    premovable: { enabled: true, multiple: true, showDests: true },
    trustAllEvents: true,
  });
  click('e2');
  click('e4');
  expect(ground.state.premovable.queue.length).toBe(1);
  // The opponent's move arrives as a new FEN; the chain survives so the host
  // can playPremove() (validation against movable.dests clears it if broken).
  ground.set({ fen: BOARD_FEN });
  expect(ground.state.premovable.queue).toEqual([{ orig: 'e2', dest: 'e4' }]);
  expect(ground.state.premovable.current).toEqual(['e2', 'e4']);
});

test('fullPremovePieces on a broken chain returns the board at the break point', () => {
  // A chain that depends on a captured origin should not silently apply later
  // moves to the wrong board.
  const pieces: cg.Pieces = new Map([
    ['b8', { role: 'knight', color: 'black' }],
    ['e8', { role: 'king', color: 'black' }],
    ['e1', { role: 'king', color: 'white' }],
  ]);
  const state = makeState(pieces, 'white', 'black');
  state.premovable.queue = [
    { orig: 'b8', dest: 'c6' },
    { orig: 'b8', dest: 'a6' }, // b8 is empty after the first hop
  ];
  const v = fullPremovePieces(state);
  expect(v.get('c6')).toEqual({ role: 'knight', color: 'black' });
  expect(v.has('a6')).toBe(false);
  expect(v.has('b8')).toBe(false);
});
