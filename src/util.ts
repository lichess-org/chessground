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
  return files[8 - fileNumbers[key[0]]] + (9 - parseInt(key[1])) as Key;
}

export const allPos: Pos[] = [];
export const allKeys: Key[] = [];
export const invKeys: Key[] = [];
let pos: Pos, key: Key, x: number, y: number;
for (y = 8; y > 0; --y) {
  for (x = 1; x < 9; ++x) {
    pos = [x, y];
    key = pos2key(pos);
    allPos.push(pos);
    allKeys.push(key);
    invKeys.unshift(key);
  }
}

export function opposite(color: Color): Color {
  return color === 'white' ? 'black' : 'white';
}

export function containsX<X>(xs: X[], x: X): boolean {
  return xs && xs.indexOf(x) !== -1;
}

export function distance(pos1: Pos, pos2: Pos): number {
  return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
}

export function computeTransformProp() {
  const s = document.body.style;
  return 'transform' in s ?
  'transform' : 'webkitTransform' in s ?
  'webkitTransform' : 'mozTransform' in s ?
  'mozTransform' : 'oTransform' in s ?
  'oTransform' : 'msTransform';
}

export function computeIsTrident(): boolean {
  return window.navigator.userAgent.indexOf('Trident/') > -1;
}

export function posToTranslate(pos: Pos, asWhite: boolean, bounds: ClientRect): NumberPair {
  return [
    (asWhite ? pos[0] - 1 : 8 - pos[0]) * bounds.width / 8,
    (asWhite ? 8 - pos[1] : pos[1] - 1) * bounds.height / 8
  ];
}

export function translate(pos: Pos): string {
  return 'translate(' + pos[0] + 'px,' + pos[1] + 'px)';
}

export const translateAway: string = translate([-99999, -99999]);

export function eventPosition(e: any): NumberPair {
  if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY];
  if (e.touches && e.targetTouches[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
  throw 'Cannot find position of event ' + e;
}

export function isLeftButton(e: MouseEvent): boolean {
  return e.buttons === 1 || e.button === 1;
}

export function isRightButton(e: MouseEvent): boolean {
  return e.buttons === 2 || e.button === 2;
}

export const raf = (window.requestAnimationFrame || window.setTimeout).bind(window);
