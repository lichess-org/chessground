import { Chessground } from '../src/chessground';

// jsdom doesn't ship ResizeObserver, so chessground's `'ResizeObserver' in window`
// guard normally short-circuits. Polyfill a spy implementation so we can observe
// whether the chessground actually disconnects its observer on destroy.

interface SpyRO {
  cb: ResizeObserverCallback;
  observed: Element[];
  connected: boolean;
  observe(el: Element): void;
  unobserve(el: Element): void;
  disconnect(): void;
}

const spies: SpyRO[] = [];

class SpyResizeObserver implements SpyRO {
  cb: ResizeObserverCallback;
  observed: Element[] = [];
  connected = true;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
    spies.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve(el: Element) {
    this.observed = this.observed.filter(x => x !== el);
  }
  disconnect() {
    this.connected = false;
    this.observed = [];
  }
}

beforeAll(() => {
  (globalThis as any).ResizeObserver = SpyResizeObserver;
});

beforeEach(() => {
  spies.length = 0;
});

function makeBoard(): HTMLElement {
  const el = document.createElement('div');
  el.style.width = '200px';
  el.style.height = '200px';
  document.body.appendChild(el);
  return el;
}

test('destroy disconnects the bindBoard ResizeObserver', () => {
  const el = makeBoard();
  const cg = Chessground(el, { viewOnly: true });

  // bindBoard should have created exactly one observer.
  expect(spies.length).toBe(1);
  expect(spies[0].connected).toBe(true);
  expect(spies[0].observed.length).toBe(1);

  cg.destroy();

  // After destroy, no live observers should remain.
  expect(spies[0].connected).toBe(false);
  el.remove();
});

test('non-viewOnly board also disconnects on destroy', () => {
  // viewOnly: false takes the path that also adds touchstart/mousedown
  // listeners. The unbinder must still disconnect the RO.
  const el = makeBoard();
  const cg = Chessground(el, { viewOnly: false });
  expect(spies.length).toBe(1);
  expect(spies[0].connected).toBe(true);

  cg.destroy();

  expect(spies[0].connected).toBe(false);
  el.remove();
});

test('redrawAll does not leak previous-redraw ResizeObservers', () => {
  const el = makeBoard();
  const cg = Chessground(el, { viewOnly: true });
  expect(spies.length).toBe(1);

  // redrawAll() runs again whenever something forces a full DOM rebuild.
  // chessground.set with a config that triggers a full redraw is the
  // public path; the simplest poke is calling redrawAll directly via
  // the api's internal redraw, but the public way is set() with config.
  // For this test, we trigger via set() — the api preserves dom.unbind
  // (document level) but bindBoard re-runs.
  cg.set({ orientation: 'black' });
  cg.set({ orientation: 'white' });

  // After multiple redraws, only the most recent observer should be live.
  // Previous observers must have been disconnected.
  const liveCount = spies.filter(s => s.connected).length;
  expect(liveCount).toBeLessThanOrEqual(1);

  cg.destroy();
  expect(spies.every(s => !s.connected)).toBe(true);
  el.remove();
});
