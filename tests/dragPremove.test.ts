import { Chessground } from '../src/chessground';
import type * as cg from '../src/types';

type RfCb = FrameRequestCallback;

const rect = { top: 0, left: 0, width: 400, height: 400, right: 400, bottom: 400 };
const queue: RfCb[] = [];

beforeAll(() => {
  HTMLElement.prototype.getBoundingClientRect = () => rect as DOMRect;
  (window as any).requestAnimationFrame = (cb: RfCb) => (queue.push(cb), queue.length);
});

function flushFrames(max = 50) {
  let n = 0;
  while (queue.length && n++ < max) {
    const cb = queue.shift()!;
    cb(0);
  }
}

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

const drag = (orig: cg.Key, dest: cg.Key) => {
  const [x0, y0] = centerOf(orig);
  const [x1, y1] = centerOf(dest);
  const b = document.querySelector('cg-board')!;
  b.dispatchEvent(mdoc('mousedown', x0, y0));
  document.dispatchEvent(mdoc('mousemove', x1, y1));
  flushFrames();
  document.dispatchEvent(mdoc('mouseup', x1, y1));
  flushFrames();
};

const BOARD_FEN = '8/8/8/4k3/8/8/4P3/4K1N1 w - - 0 1';

test('multi-premove via drag queues both moves', () => {
  const ground = makeBoard({
    fen: BOARD_FEN,
    turnColor: 'black',
    movable: { color: 'white', dests: new Map() },
    premovable: { enabled: true, multiple: true, showDests: true },
    trustAllEvents: true,
  });
  drag('e2', 'e4');
  drag('g1', 'f3');
  expect(ground.state.premovable.queue).toEqual([
    { orig: 'e2', dest: 'e4' },
    { orig: 'g1', dest: 'f3' },
  ]);
});
