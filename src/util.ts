import * as cg from './types';

export const invRanks: cg.Rank[] = [8, 7, 6, 5, 4, 3, 2, 1];
export const fileNumbers: { [file: string]: number } = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8
};

export const pos2key = (pos: cg.Pos) => cg.files[pos[0] - 1] + pos[1] as cg.Key;

export const key2pos = (k: cg.Key) => [fileNumbers[k[0]] as number, parseInt(k[1]) as number] as cg.Pos;

export const invertKey = (k: cg.Key) => cg.files[8 - fileNumbers[k[0]]] + (9 - parseInt(k[1])) as cg.Key;

export const allPos: cg.Pos[] = [];
export const allKeys: cg.Key[] = [];
let pos: cg.Pos, key: cg.Key, x: number, y: number;
for (y = 8; y > 0; --y) {
  for (x = 1; x < 9; ++x) {
    pos = [x, y];
    key = pos2key(pos);
    allPos.push(pos);
    allKeys.push(key);
  }
}

export function memo<A>(f: () => A): cg.Memo<A> {
  let v: A | undefined;
  const ret: any = () => {
    if (v === undefined) v = f();
    return v;
  };
  ret.clear = () => { v = undefined; }
    return ret;
}

export const opposite = (c: cg.Color) => c === 'white' ? 'black' : 'white';

export function containsX<X>(xs: X[] | undefined, x: X): boolean {
  return xs ? xs.indexOf(x) !== -1 : false;
}

export const distance: (pos1: cg.Pos, pos2: cg.Pos) => number = (pos1, pos2) => {
  return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
}

export const transformFunction: () => cg.Transform = () => {
  const s = document.body.style;
  const prop = 'transform' in s ?
    'transform' : 'webkitTransform' in s ?
    'webkitTransform' : 'mozTransform' in s ?
    'mozTransform' : 'oTransform' in s ?
    'oTransform' : 'msTransform';
  return (el, value) => el.style.setProperty(prop, value);
}

export const computeIsTrident = () => window.navigator.userAgent.indexOf('Trident/') > -1;

export const posToTranslate: (pos: cg.Pos, asWhite: boolean, bounds: ClientRect) => cg.NumberPair =
(pos, asWhite, bounds) => {
  return [
    (asWhite ? pos[0] - 1 : 8 - pos[0]) * bounds.width / 8,
    (asWhite ? 8 - pos[1] : pos[1] - 1) * bounds.height / 8
  ];
}

export const translate = (pos: cg.Pos) => 'translate(' + pos[0] + 'px,' + pos[1] + 'px)';

export const translateAway: string = translate([-99999, -99999]);

export const eventPosition: (e: cg.MouchEvent) => cg.NumberPair = e => {
  if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY];
  if (e.touches && e.targetTouches[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
  throw 'Cannot find position of event ' + e;
}

export const isLeftButton = (e: MouseEvent) => e.buttons === 1 || e.button === 1;

export const isRightButton = (e: MouseEvent) => e.buttons === 2 || e.button === 2;

export const createEl = (tagName: string, className?: string) => {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  return el;
}

export const raf = (window.requestAnimationFrame || window.setTimeout).bind(window);
