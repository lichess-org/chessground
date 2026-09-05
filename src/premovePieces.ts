import { whitePov } from './board.js';
import { applyMoveToPieces } from './premove.js';
import { type State } from './state.js';
import type * as cg from './types.js';
import { createEl, key2pos, posToTranslate as posToTranslateFromBounds, translate } from './util.js';

type Placement = { key: cg.Key; piece: cg.Piece };

type VirtualStage = {
  stage: number;
  orig: cg.Key;
  // The queue item's own destination — the "primary" square of this stage.
  // For a normal move this is the only placement; for castling it's the
  // king's landing square specifically (the rook's is a second, secondary
  // placement). This is also the square stageAt()/drag.ts look for when
  // deciding what a drag starting here should grab and reroute.
  dest: cg.Key;
  // Every square that gets a virtual piece drawn for this stage, already
  // filtered down to the ones still current (see below).
  placements: Placement[];
  // Every square whose authoritative (real) piece must stay hidden because
  // this stage's hypothetical board no longer has that piece there: the
  // mover's own origin, a captured piece sitting on the destination
  // (including one of the player's own pieces, in a "defend the square"
  // premove that expects the opponent to capture it first so this piece can
  // recapture), a castling rook's origin, or an en-passant-captured pawn.
  hidden: cg.Key[];
};

// Diffs the pieces map before/after one queued move is hypothetically
// applied. This is what lets a single queue item translate into more than
// one visual change: a castling move relocates the rook as well as the
// king, and a capture — including a capture of the player's own piece —
// must hide whatever was really sitting on the destination, not just draw
// the mover on top of it.
function diffPieces(before: cg.Pieces, after: cg.Pieces): { placements: Placement[]; hidden: cg.Key[] } {
  const placements: Placement[] = [];
  const hidden: cg.Key[] = [];
  const keys = new Set<cg.Key>([...before.keys(), ...after.keys()]);
  for (const key of keys) {
    const b = before.get(key);
    const a = after.get(key);
    const same = !!a && !!b && a.color === b.color && a.role === b.role && a.promoted === b.promoted;
    if (same) continue;
    if (b) hidden.push(key);
    if (a) placements.push({ key, piece: a });
  }
  return { placements, hidden };
}

// Diff between authoritative `state.pieces` and the virtual map, one stage
// per queued item. `applyMoveToPieces` already understands castling,
// en passant and promotion; diffPieces() turns whatever it changed into the
// squares a stage needs to draw or hide, so all three fall out for free
// instead of needing separate special-casing here.
function computeStages(state: State): VirtualStage[] {
  if (!state.premovable.multiple || !state.premovable.queue.length) return [];
  const queue = state.premovable.queue;
  const raw: VirtualStage[] = [];
  let live: cg.Pieces = state.pieces;
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    if (!live.has(item.orig)) break;
    const next = applyMoveToPieces(live, item.orig, item.dest, { promotion: item.promotion });
    const { placements, hidden } = diffPieces(live, next);
    raw.push({ stage: i, orig: item.orig, dest: item.dest, placements, hidden });
    live = next;
  }
  // A placement is superseded — and must not be drawn — when a later,
  // successfully-computed stage continues the move from that exact square
  // (the same piece keeps advancing further down the chain). This is
  // resolved per *placement*, not per stage, and only against `raw` (the
  // stages actually validated above, never the untouched tail of `queue`):
  // a castling move's rook placement and its king placement can have
  // different fates if only the king gets re-premoved further afterwards,
  // and an item sitting after a broken link in the chain was never reached
  // by the loop above, so it must not suppress a real resting square just
  // because its `orig` happens to match that square's key.
  return raw.map((stage, i) => ({
    ...stage,
    placements: stage.placements.filter(p => !raw.slice(i + 1).some(later => later.orig === p.key)),
  }));
}

/**
 * Render the virtual premove pieces layer. Walks the queue stage-by-stage and
 * adds piece nodes for every square each stage places a piece on — normally
 * just the mover's destination, but two for a castling move (king + rook).
 * Sets a `.premove-piece` class plus a stage-ordinal class for each node.
 * The CSS hides the corresponding authoritative source node visually.
 *
 * Three things this reconciles carefully, rather than doing a naive "wipe
 * and rebuild" every call:
 *
 *  - A chain that re-premoves the *same* piece several times (e.g. a bishop
 *    queued d2-c3, then c3-b4) produces one stage per hop, but only the
 *    last hop is a real resting square — see the `placements` filtering in
 *    computeStages(). Superseded placements are skipped entirely so a piece
 *    is drawn exactly once, at its actual current square.
 *  - A capture — including a "defensive" premove onto one of the player's
 *    own pieces — must hide whatever piece is really still sitting on the
 *    destination (the real capture hasn't happened yet), or the mover and
 *    the piece it's about to take appear stacked on the same square.
 *  - If the piece currently being dragged *is* one of these virtual nodes
 *    (the user grabbed the piece from its premove destination to re-target
 *    or extend the chain), that DOM node must not be destroyed and
 *    recreated here. processDrag() (in drag.ts) holds a direct reference to
 *    it and keeps translating it every animation frame; replacing it with a
 *    fresh element would silently detach the one actually being dragged, so
 *    the piece would stop following the cursor even though the drag is
 *    still "live" underneath.
 *
 * This renderer never mutates state.pieces. It also never reads back the FEN —
 * callers (e.g. drag handler) can keep using `state.pieces` / `getFen()` as the
 * authoritative source.
 */
export function render(state: State, el: HTMLElement): void {
  const asWhite = whitePov(state),
    posToTranslate = posToTranslateFromBounds(state.dom.bounds());
  const stages = computeStages(state);
  const dragStage = state.draggable.current?.premoveStage;

  // Index existing virtual nodes by a stable per-placement id (`stage:key`),
  // since a single stage can now place more than one piece (castling).
  const existingById = new Map<string, cg.PieceNode>();
  let child = el.firstChild as cg.PieceNode | null;
  while (child) {
    const next = child.nextSibling as cg.PieceNode | null;
    const id = child.dataset['premoveId'];
    if (id !== undefined) existingById.set(id, child);
    child = next;
  }

  // Always clear the source-hide class from authoritative piece nodes, then
  // re-apply for any source (or capture target) the virtual map affects.
  // This is important: rerouting a stage must restore the prior visibility.
  clearSourceHides(state.dom.elements.board);

  const renderedIds = new Set<string>();

  for (const stage of stages) {
    for (const key of stage.hidden) hideSource(state.dom.elements.board, key);

    for (const placement of stage.placements) {
      const id = `${stage.stage}:${placement.key}`;
      renderedIds.add(id);
      const existing = existingById.get(id);
      // The *primary* piece of a stage — the one at the queue item's own
      // `dest` — is what stageAt()/drag.ts grab a drag from. If it's the one
      // currently being dragged, processDrag() owns its position every
      // frame, so leave it untouched. A castling rook is never primary and
      // is always safe to reconcile normally.
      const isPrimary = placement.key === stage.dest;

      if (existing && isPrimary && dragStage === stage.stage) continue;

      const node =
        existing ??
        (() => {
          const created = createEl('piece') as cg.PieceNode;
          created.dataset['premoveStage'] = String(stage.stage);
          created.dataset['premoveId'] = id;
          el.appendChild(created);
          return created;
        })();

      node.cgPiece = `${placement.piece.color} ${placement.piece.role}`;
      node.cgKey = placement.key;
      node.dataset['premoveOrig'] = stage.orig;
      node.dataset['premoveDest'] = stage.dest;
      node.className = `piece ${placement.piece.color} ${placement.piece.role} premove-piece premove-stage-${Math.min(
        stage.stage + 1,
        8,
      )}`;
      translate(node, posToTranslate(key2pos(placement.key), asWhite));
    }
  }

  // Remove nodes for placements that no longer exist, were rerouted away, or
  // became superseded by a further hop.
  for (const [id, node] of existingById) {
    if (!renderedIds.has(id)) el.removeChild(node);
  }
}

function clearSourceHides(board: HTMLElement): void {
  let el = board.firstChild as cg.PieceNode | null;
  while (el) {
    if (el.classList.contains('premove-source')) el.classList.remove('premove-source');
    el = el.nextSibling as cg.PieceNode | null;
  }
}

function hideSource(board: HTMLElement, key: cg.Key): void {
  let el = board.firstChild as cg.PieceNode | null;
  while (el) {
    if (el.cgKey === key && el.tagName === 'PIECE') {
      el.classList.add('premove-source');
      return;
    }
    el = el.nextSibling as cg.PieceNode | null;
  }
}

export function renderResized(state: State): void {
  const el = state.dom.elements.premovePieces;
  if (!el) return;
  const asWhite = whitePov(state),
    posToTranslate = posToTranslateFromBounds(state.dom.bounds());
  // Skip the node owned by an in-progress drag here too, for the same reason
  // as in render(): a resize firing mid-drag must not snap the dragged piece
  // back to its resting square out from under the cursor. Only the primary
  // placement of a stage (key === its own recorded dest) is ever draggable.
  const dragStage = state.draggable.current?.premoveStage;
  let node = el.firstChild as cg.PieceNode | null;
  while (node) {
    const stageIdx = node.dataset['premoveStage'];
    const isPrimary = node.dataset['premoveDest'] === node.cgKey;
    const isBeingDragged = isPrimary && stageIdx !== undefined && Number(stageIdx) === dragStage;
    if (!isBeingDragged) translate(node, posToTranslate(key2pos(node.cgKey), asWhite));
    node = node.nextSibling as cg.PieceNode | null;
  }
}

/**
 * Look up which queue stage (if any) currently places its *primary* piece at
 * `key` (a castling rook's square never matches here — see VirtualStage.dest).
 * Used by the drag handler so drags can start from a virtual destination and
 * re-route the corresponding queue item.
 */
export function stageAt(state: State, key: cg.Key): number | undefined {
  if (!state.premovable.multiple) return undefined;
  const queue = state.premovable.queue;
  if (!queue.length) return undefined;
  // Find the stage whose `dest` is `key` and that stage is still valid (its
  // origin exists on the resulting board). The destination is the only square
  // a single premove can place a piece on, so this is unambiguous.
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].dest === key) {
      // Validate the stage: apply the queue up to and including it, ensure
      // the piece lands on `key`.
      let live: cg.Pieces = state.pieces;
      for (let j = 0; j <= i; j++) {
        const item = queue[j];
        if (!live.has(item.orig)) return undefined;
        live = applyMoveToPieces(live, item.orig, item.dest, { promotion: item.promotion });
      }
      if (live.get(key)) return i;
    }
  }
  return undefined;
}