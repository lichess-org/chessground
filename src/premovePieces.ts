import { whitePov } from './board.js';
import { applyMoveToPieces } from './premove.js';
import { type State } from './state.js';
import type * as cg from './types.js';
import { createEl, key2pos, posToTranslate as posToTranslateFromBounds, translate } from './util.js';

type VirtualStage = {
  stage: number;
  orig: cg.Key;
  dest: cg.Key;
  piece: cg.Piece;
  capturedAtDest: cg.Piece | undefined;
  // True when a *later, successfully-computed* stage continues the move from
  // this stage's `dest` — i.e. the same piece keeps advancing further down
  // the chain. Such a stage is a transient waypoint on the hypothetical
  // board, not a resting square, and must never get its own piece node: only
  // the final square of a same-piece chain should ever show a piece. Without
  // this, a piece re-premoved two or three times in a row (e.g. a bishop
  // queued d2-c3, then c3-b4) renders once per hop instead of once at its
  // actual final square.
  superseded: boolean;
};

// Diff between authoritative `state.pieces` and the virtual map. The virtual
// layer draws the moved piece at its destination, hides the source piece, and
// shows the captured piece (if any) fading on the destination — same visual
// contract as a real move. We compute one stage per queued item so the renderer
// can tag each with a stage class (for stage-aware re-queueing on drag).
function computeStages(state: State): VirtualStage[] {
  if (!state.premovable.multiple || !state.premovable.queue.length) return [];
  const queue = state.premovable.queue;
  const raw: Omit<VirtualStage, 'superseded'>[] = [];
  let live: cg.Pieces = state.pieces;
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const piece = live.get(item.orig);
    if (!piece) break;
    const destPiece = live.get(item.dest);
    const captured = destPiece && destPiece.color !== piece.color ? destPiece : undefined;
    raw.push({ stage: i, orig: item.orig, dest: item.dest, piece, capturedAtDest: captured });
    live = applyMoveToPieces(live, item.orig, item.dest, { promotion: item.promotion });
  }
  // Superseded-ness is resolved against `raw` (the stages we actually
  // validated above), never against the untouched tail of `queue`: an item
  // sitting after a broken link in the chain was never reached by the loop
  // above, so it must not be allowed to suppress an earlier, real resting
  // square just because its `orig` happens to match that square's `dest`.
  return raw.map((stage, i) => ({
    ...stage,
    superseded: raw.slice(i + 1).some(later => later.orig === stage.dest),
  }));
}

/**
 * Render the virtual premove pieces layer. Walks the queue stage-by-stage and
 * adds piece nodes for the moved piece at its current destination. Sets a
 * `.premove-piece` class plus a stage-ordinal class for each node. The CSS
 * hides the corresponding authoritative source node visually.
 *
 * Two things this reconciles carefully, rather than doing a naive "wipe and
 * rebuild" every call:
 *
 *  - A chain that re-premoves the *same* piece several times (e.g. a bishop
 *    queued d2-c3, then c3-b4) produces one stage per hop, but only the last
 *    hop is a real resting square — see `superseded` above. Waypoint stages
 *    are skipped entirely so the piece is drawn exactly once, at its actual
 *    final square.
 *  - If the piece currently being dragged *is* one of these virtual nodes
 *    (the user grabbed the piece from its premove destination to re-target
 *    or extend the chain), that DOM node must not be destroyed and recreated
 *    here. processDrag() (in drag.ts) holds a direct reference to it and
 *    keeps translating it every animation frame; replacing it with a fresh
 *    element would silently detach the one actually being dragged, so the
 *    piece would stop following the cursor even though the drag is still
 *    "live" underneath — which is why, before this fix, drag only ever
 *    visibly worked for the very first premove.
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

  // Index existing virtual nodes by the stage they represent, so unaffected
  // ones — in particular the one currently being dragged — can be left
  // alone instead of being wiped and recreated.
  const existingByStage = new Map<number, cg.PieceNode>();
  let child = el.firstChild as cg.PieceNode | null;
  while (child) {
    const next = child.nextSibling as cg.PieceNode | null;
    const idx = child.dataset['premoveStage'];
    if (idx !== undefined) existingByStage.set(Number(idx), child);
    child = next;
  }

  // Always clear the source-hide class from authoritative piece nodes, then
  // re-apply for any source that the virtual map has relocated. This is
  // important: rerouting a stage must restore the prior source visibility.
  clearSourceHides(state.dom.elements.board);

  const renderedStages = new Set<number>();

  for (const stage of stages) {
    // Hide the authoritative source square: the piece is virtually gone from
    // there regardless of whether this particular stage is a resting place.
    hideSource(state.dom.elements.board, stage.orig);

    // A waypoint stage that a later item continues from is never drawn: the
    // chain's final stage draws the piece for all of them.
    if (stage.superseded) continue;

    renderedStages.add(stage.stage);
    const isBeingDragged = dragStage === stage.stage;
    const existing = existingByStage.get(stage.stage);

    if (existing && isBeingDragged) {
      // Owned by an in-progress drag; processDrag() is translating it every
      // frame, so leave its position, key and classes exactly as they are.
      continue;
    }

    const node =
      existing ??
      (() => {
        const created = createEl('piece') as cg.PieceNode;
        created.dataset['premoveStage'] = String(stage.stage);
        el.appendChild(created);
        return created;
      })();

    node.cgPiece = `${stage.piece.color} ${stage.piece.role}`;
    node.cgKey = stage.dest;
    node.dataset['premoveOrig'] = stage.orig;
    node.dataset['premoveDest'] = stage.dest;
    node.className = `piece ${stage.piece.color} ${stage.piece.role} premove-piece premove-stage-${Math.min(
      stage.stage + 1,
      8,
    )}`;
    translate(node, posToTranslate(key2pos(stage.dest), asWhite));
  }

  // Remove nodes for stages that no longer exist, were rerouted away, or
  // became waypoints superseded by a further hop.
  for (const [stageIdx, node] of existingByStage) {
    if (!renderedStages.has(stageIdx)) el.removeChild(node);
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
  // back to its resting square out from under the cursor.
  const dragStage = state.draggable.current?.premoveStage;
  let node = el.firstChild as cg.PieceNode | null;
  while (node) {
    const idx = node.dataset['premoveStage'];
    const isBeingDragged = idx !== undefined && Number(idx) === dragStage;
    if (!isBeingDragged) translate(node, posToTranslate(key2pos(node.cgKey), asWhite));
    node = node.nextSibling as cg.PieceNode | null;
  }
}

/**
 * Look up which queue stage (if any) currently places a virtual piece at `key`.
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