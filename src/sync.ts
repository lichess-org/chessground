import { DrawShape } from './draw';

export interface SyncableShape {
  shape: DrawShape;
  current: boolean;
  hash: Hash;
}

export type Hash = string;

// append and remove only. No updates.
export function syncShapes(
  shapes: SyncableShape[],
  root: HTMLElement | SVGElement,
  renderShape: (shape: SyncableShape) => HTMLElement | SVGElement
): void {
  const hashesInDom = new Map(), // by hash
    toRemove: SVGElement[] = [];
  for (const sc of shapes) hashesInDom.set(sc.hash, false);
  let el: SVGElement | undefined = root.firstChild as SVGElement,
    elHash: Hash | null;
  while (el) {
    elHash = el.getAttribute('cgHash') as Hash;
    // found a shape element that's here to stay
    if (hashesInDom.has(elHash)) hashesInDom.set(elHash, true);
    // or remove it
    else toRemove.push(el);
    el = el.nextSibling as SVGElement | undefined;
  }
  // remove old shapes
  for (const el of toRemove) root.removeChild(el);
  // insert shapes that are not yet in dom
  for (const sc of shapes) {
    if (!hashesInDom.get(sc.hash)) root.appendChild(renderShape(sc));
  }
}
