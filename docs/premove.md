# Premoves

Chessground lets a player queue a move **before their turn** ("premove"), so that
when it becomes their turn the stored move is played automatically. This document
covers both the classic single-premove behavior and the chess.com-style
multi-premove queue.

> What "today" is: Chessground has no chess rules of its own. It only knows which
> squares are selectable and which destination squares to highlight. **Legality is
> always decided by your game's rules engine**, which you feed in through
> `movable.dests` (and `movable.color`) and which you honour when you call
> `playPremove()`.

---

## TL;DR

```ts
import { Chessground } from '@lichess-org/chessground';

const ground = Chessground(document.body, {
  fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
  turnColor: 'black',
  movable: {
    color: 'white', // the color the user is allowed to premove with
    // your rules engine's legal moves for the side to move (filled in by you):
    dests: new Map(),
  },
  premovable: {
    enabled: true, // allow premoves while it is black's turn
    multiple: true, // chess.com-style queue (default is false)
    maxQueueLength: 5,
    showDests: true,
    events: {
      set: (orig, dest) => console.log('queued', orig, dest),
      unset: () => console.log('premove cleared'),
      queueSet: queue => console.log('queue now', queue),
      queueUnset: () => console.log('queue emptied'),
    },
  },
});

// When your rules engine reports that the opponent moved and it is now white's
// turn, attempt to play the queued premove:
const played = ground.playPremove();
```

---

## How premoves work

A premove is only possible when **the piece's color is not the side to move**.

| Internal flag        | Meaning                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| `movable.color`      | which color the user may move / premove (`'white'`, `'black'`, or `'both'`) |
| `turnColor`          | the side actually to move (set by the host app)                             |
| `premovable.enabled` | master switch for premoves                                                  |

So with `turnColor: 'black'` and `movable.color: 'white'`, the user (white) can
select a white piece and place it on a destination. Chessground stores that as a
premove and shows it (as the `current-premove` highlight, or the multi-square
queue highlight). When the host later sets `turnColor` to white and calls
`playPremove()`, the move is validated against `movable.dests` and, if legal,
played for real.

Chessground decides **which destination squares to offer** for a premove by
calling `premove()` in `src/premove.ts`. That function implements standard piece
mobility **ignoring check, pins, and occupancy** (it does not even know the real
rules). It is only a hint for highlighting; the source of truth for "can this
premove actually happen" is your rules engine.

---

## Configuration (`premovable`)

| Option                          | Type                              | Default     | Description                                                                        |
| ------------------------------- | --------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `enabled`                       | `boolean`                         | `true`      | Master switch. If `false`, no premoves can be made.                                |
| `showDests`                     | `boolean`                         | `true`      | Add the `premove-dest` class to highlighted destination squares.                   |
| `castle`                        | `boolean`                         | `true`      | Allow king-castle premoves (treated as an ordinary king move with the rook).       |
| `dests`                         | `cg.Key[]`                        | —           | Premove destinations for the currently selected square. Normally computed for you. |
| `customDests`                   | `cg.Dests`                        | —           | Supply your own premove destinations per origin, overriding the built-in mobility. |
| `multiple`                      | `boolean`                         | `false`     | Enable the chess.com-style multi-premove queue.                                    |
| `maxQueueLength`                | `number`                          | `5`         | Maximum number of queued premoves (only when `multiple` is `true`).                |
| `additionalPremoveRequirements` | `cg.Mobility`                     | `_ => true` | Extra predicate that can veto a destination (`false` excludes it).                 |
| `events.set`                    | `(orig, dest, metadata?) => void` | —           | Called after a premove is set / queued.                                            |
| `events.unset`                  | `() => void`                      | —           | Called after the current premove is cleared, or the queue empties.                 |
| `events.queueSet`               | `(queue) => void`                 | —           | Called whenever the queue content changes (only `multiple`).                       |
| `events.queueUnset`             | `() => void`                      | —           | Called when the queue becomes empty (only `multiple`).                             |

Both `movable.color` and `movable.dests` are set on the `movable` option, not on
`premovable`. `premovable` only configures the premove behavior itself.

---

## The premove API

You get these methods back from `Chessground()`:

| Method                 | Behavior (single mode)                                                         | Behavior (`multiple` mode)                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `playPremove()`        | Plays the stored `current` premove; returns `true` if it was legal and played. | Plays the **front** of the queue and pops it. Returns `true` if legal. If the front is **illegal**, clears the **entire** queue and returns `false`. |
| `cancelPremove()`      | Clears the current premove.                                                    | Pops the **front** queued item (operates on the front).                                                                                              |
| `cancelPremoveQueue()` | Same as `cancelPremove()`.                                                     | Clears the **entire** queue.                                                                                                                         |
| `popLastPremove()`     | Same as `cancelPremove()`.                                                     | Removes the **last** queued item (e.g. for a "right-click / Escape removes last" UX).                                                                |

### `playPremove()` details

- Only **one** real move happens per turn — the queue never "cascades" several
  moves at once.
- If the front item is legal, it is played via the same code path as a normal
  move and its `movable.events.after` fires with `{ premove: true }`.
- If the front item is illegal (the opponent's actual move invalidated it), the
  whole remaining queue is cleared — a broken chain does **not** skip ahead.

```ts
// the loop a typical lichess-like host uses:
// after the server sends the new position and it is the user's turn:
ground.set({ turnColor: 'white', movable: { color: 'white', dests: legalMoves } });
if (!ground.playPremove()) {
  // the queued move was illegal; the queue has been cleared for you.
}
```

---

## Single-premove mode (default, `multiple: false`)

This is the original chessground behavior and is **unchanged**.

- Only one premove can be queued at a time.
- Setting a new premove **replaces** the old one.
- When it becomes your turn, `playPremove()` plays that single move.
- `current` (a `[orig, dest]` pair) reflects the stored premove.

```ts
const ground = Chessground(el, {
  turnColor: 'black',
  movable: { color: 'white', dests: new Map() },
  premovable: {
    enabled: true,
    events: {
      set: (orig, dest) => console.log('premove set:', orig, dest),
      unset: () => console.log('premove cleared'),
    },
  },
});
```

While it is black's turn, white's user selects a white piece and a destination;
chessground stores `current = ['e2', 'e4']` and highlights both squares with the
`current-premove` class.

---

## Multi-premove queue mode (`multiple: true`)

This lets the user queue a **chain** of premoves, chess.com-style.

### How the queue is built

1. While it is not the user's turn, they drag / click a piece to a square. That
   becomes queue item #1.
2. Still before the opponent has moved, they can queue another piece (or even the
   same piece, by selecting the square it will be on after item #1). That becomes
   item #2, and so on, up to `maxQueueLength`.
3. Each subsequent item is computed against a **hypothetical board** — the real
   board with items `1..N-1` already applied (captures remove pieces, the moved
   piece is relocated). This is handled by `premovePieces()` / `applyMoveToPieces()`
   in `src/premove.ts`.

```ts
const ground = Chessground(el, {
  turnColor: 'black',
  movable: { color: 'white', dests: new Map() },
  premovable: {
    multiple: true,
    maxQueueLength: 5,
  },
});
```

If the user queues `e2→e4` then `g1→f3`, the board shows both moves highlighted
simultaneously with an **ordinal color ramp** (`premove-queue-1`, `premove-queue-2`,
…). The most recently queued move uses the brightest (yellow-green) tone and the
earliest uses a muted red/orange. You can restyle these via the CSS variables
`--premove-queue-color-1` … `--premove-queue-color-8` without touching JS.

### Queue rules and edge cases

| Behavior                      | Rule                                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Hypothetical board**        | Item _N_ is legal-checked against the board after items `1..N-1` are applied.                                                                                                                    |
| **Same piece in a chain**     | You can continue moving a piece that was itself the destination of an earlier queued move (select its hypothetical square, then the next square).                                                |
| **Re-queueing an origin**     | Queueing a move whose origin already appears as an origin of an earlier item **replaces** that item and everything queued after it (later items were computed assuming the piece was elsewhere). |
| **Empty hypothetical origin** | You cannot start a drag/selection from a square that has no piece on the hypothetical board.                                                                                                     |
| **Max length**                | The queue is capped at `maxQueueLength`; queueing beyond it is ignored.                                                                                                                          |
| **Illegal front**             | If `playPremove()`'s front move is illegal after the opponent moves, the **whole queue** is cleared.                                                                                             |

### Execution flow

1. The opponent moves and it becomes the user's real turn (host updates
   `turnColor`/`movable.dests`).
2. Host calls `ground.playPremove()`.
3. The **front** item is validated by your rules engine (`canMove` → `movable.dests`).
4. If legal → it is played, removed from the front, and the rest of the queue stays
   for the next cycle. Only that one move happens.
5. If illegal → the entire queue is cleared.

```ts
ground.playPremove();
// After the opponent moves again, ground.playPremove() will attempt the next queued item.
```

---

## Reading premove state

The `state.premovable` object (exposed as `ground.state.premovable`) is the live
state:

```ts
interface PremovableState {
  enabled: boolean;
  showDests: boolean;
  castle: boolean;
  dests?: cg.Key[]; // destinations for the currently selected square
  customDests?: cg.Dests;
  current?: cg.KeyPair; // single-premove: ["e2","e4"]; in multiple mode = front of queue
  multiple: boolean;
  maxQueueLength: number;
  queue: cg.Premove[]; // [{ orig: 'e2', dest: 'e4' }, ...] (multiple mode)
  additionalPremoveRequirements: cg.Mobility;
  events: {
    set?: (orig, dest, meta?) => void;
    unset?: () => void;
    queueSet?: (queue) => void;
    queueUnset?: () => void;
  };
}
```

- In single mode, use `state.premovable.current`.
- In multiple mode, prefer `state.premovable.queue`; `current` mirrors the front
  item for backwards compatibility of existing consumers.

> Writing to `queue` directly is possible but bypasses the event/truncation
> logic; prefer the `ground.*` API methods.

---

## Example: a full premove "opponent moved" handler

```ts
import { Chessground } from '@lichess-org/chessground';

const ground = Chessground(document.querySelector('#board')!, {
  turnColor: 'black',
  coordinates: true,
  movable: {
    color: 'white',
    dests: new Map(), // filled in by host on every turn change
  },
  premovable: {
    enabled: true,
    multiple: true,
    maxQueueLength: 3,
    showDests: true,
    events: {
      set: (orig, dest) => {
        // highlight/queue-feedback lives in the board itself; use this for app state
        console.log('queued', orig, dest);
      },
      queueSet: queue => console.log('queue', queue),
      unset: () => console.log('premove cleared'),
      queueUnset: () => console.log('queue emptied'),
    },
  },
});

function onOpponentMove(newFen: string, legalMoves: Map<string, string[]>) {
  ground.set({
    fen: newFen,
    turnColor: 'white',
    movable: { color: 'white', dests: toCgDests(legalMoves) },
  });

  // Try to fire the queued premove. Returns false and clears the queue if illegal.
  const played = ground.playPremove();
  if (played) console.log('premove played!');
}
```

---

## Custom premove destinations

If chessground's built-in mobility is not what you want (you prefer to compute
destinations yourself), set `premovable.customDests` and/or
`premovable.additionalPremoveRequirements`:

```ts
premovable: {
  enabled: true,
  customDests: new Map([['e2', ['e4', 'e3']]]),   // exact destinations for a square
  additionalPremoveRequirements: ctx => ctx.dest.pos[0] > 2, // extra veto
}
```

---

## Note: premoves and the real rules engine

Chessground never decides whether a premove is legal in the rules sense — that is
the host's job via `movable.dests`. The pieces on the real board are **never moved**
while premoves are only queued; only square highlights change. The actual piece
rendering reflects the true board until a queued move is played for real with
`playPremove()`.
