export const files: Fil[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8];
export const invRanks: Rank[] = [8, 7, 6, 5, 4, 3, 2, 1];
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

export function pos2key(pos: Pos): Key {
  return files[pos[0] - 1] + pos[1] as Key;
}

export function key2pos(key: Key): Pos {
  return [fileNumbers[key[0]] as number, parseInt(key[1]) as number] as Pos;
}

export function invertKey(key: Key) {
  return files[8 - fileNumbers[key[0]]] + (9 - parseInt(key[1])) as Key
}

export const allPos: Pos[] = [];
export const allKeys: Key[] = [];
for (var y = 8; y > 0; --y) {
  for (var x = 1; x < 9; ++x) {
    var pos: Pos = [x, y];
    allPos.push(pos);
    allKeys.push(pos2key(pos));
  }
}
export const invKeys: Key[] = allKeys.slice(0).reverse();

export function opposite(color: Color): Color {
  return color === 'white' ? 'black' : 'white';
}

export function containsX<X>(xs: X[], x: X): boolean {
  return xs && xs.indexOf(x) !== -1;
}

export function distance(pos1: Pos, pos2: Pos): number {
  return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
}

// this must be cached because of the access to document.body.style
let cachedTransformProp: string;

function computeTransformProp() {
  return 'transform' in document.body.style ?
  'transform' : 'webkitTransform' in document.body.style ?
  'webkitTransform' : 'mozTransform' in document.body.style ?
  'mozTransform' : 'oTransform' in document.body.style ?
  'oTransform' : 'msTransform';
}

export function transformProp(): string {
  if (!cachedTransformProp) cachedTransformProp = computeTransformProp();
  return cachedTransformProp;
}

let cachedIsTrident: boolean;

export function isTrident(): boolean {
  if (cachedIsTrident === undefined)
    cachedIsTrident = window.navigator.userAgent.indexOf('Trident/') > -1;
  return cachedIsTrident;
}

export function translate(pos: Pos): string {
  return 'translate(' + pos[0] + 'px,' + pos[1] + 'px)';
}

export function eventPosition(e: any) {
  if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY];
  if (e.touches && e.targetTouches[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
  return undefined;
}

// function partialApply(fn, args) {
//   return fn.bind.apply(fn, [null].concat(args));
// }

// function partial() {
//   return partialApply(arguments[0], Array.prototype.slice.call(arguments, 1));
// }

export function isLeftButton(e: MouseEvent): boolean {
  return e.buttons === 1 || e.button === 1;
}

export function isRightButton(e: MouseEvent): boolean {
  return e.buttons === 2 || e.button === 2;
}

export const raf = (window.requestAnimationFrame || window.setTimeout).bind(window);
