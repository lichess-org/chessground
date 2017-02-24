import { h } from 'snabbdom'
import { VNode } from 'snabbdom/vnode'
import * as util from './util'
import svg from './svg'

interface Ctx {
  readonly asWhite: boolean;
  readonly bounds: ClientRect;
  readonly transformProp: string;
}

type Classes = Record<string, boolean>;

const cgBoardClasses = {'cg-board': true};

export default function(d: State): VNode {
  return h('div', {
    class: {
      'cg-board-wrap': true,
      ['orientation-' + d.orientation]: true,
      'view-only': d.viewOnly,
      'manipulable': !d.viewOnly
    }
  }, [
    h('div', { class: cgBoardClasses }, renderContent(d))
  ]);
};

function renderPiece(d: State, key: Key, ctx: Ctx): VNode {

  const classes = pieceClasses(d.pieces[key]),
  translate = posToTranslate(util.key2pos(key), ctx),
  draggable = d.draggable.current,
  anim = d.animation.current;
  if (draggable && draggable.orig === key && draggable.started) {
    translate[0] += draggable.pos[0] + draggable.dec[0];
    translate[1] += draggable.pos[1] + draggable.dec[1];
    classes['dragging'] = true;
  } else if (anim) {
    const myAnim = anim.plan.anims[key];
    if (myAnim) {
      translate[0] += myAnim[1][0];
      translate[1] += myAnim[1][1];
    }
  }

  return h(pieceTag, {
    key: 'p' + key,
    class: classes,
    style: { [ctx.transformProp]: util.translate(translate) },
    // attrs: d.pieceKey ? {'data-key': key } : undefined
    });
}

function renderSquare(key: Key, classes: Classes, ctx: Ctx): VNode {
  return h(squareTag, {
    key: 's' + key,
    class: classes,
    style: { [ctx.transformProp]: util.translate(posToTranslate(util.key2pos(key), ctx)) }
  });
}

function posToTranslate(pos: Pos, ctx: Ctx): NumberPair {
  return [
    (ctx.asWhite ? pos[0] - 1 : 8 - pos[0]) * ctx.bounds.width / 8,
    (ctx.asWhite ? 8 - pos[1] : pos[1] - 1) * ctx.bounds.height / 8
  ];
}

function renderGhost(key: Key, piece: Piece, ctx: Ctx): VNode {
  const classes = pieceClasses(piece);
  classes['ghost'] = true;
  return h(pieceTag, {
    key: 'g' + key,
    class: classes,
    style: { [ctx.transformProp]: util.translate(posToTranslate(util.key2pos(key), ctx)) }
  });
}

function renderFading(fading: AnimFading, ctx: Ctx): VNode {
  const classes = pieceClasses(fading.piece);
  classes['fading'] = true;
  return h(pieceTag, {
    key: 'f' + util.pos2key(fading.pos),
    class: classes,
    style: {
      [ctx.transformProp]: util.translate(posToTranslate(fading.pos, ctx)),
      opacity: fading.opacity
    }
  });
}

interface SquareClasses {
  [key: string]: Classes
}

function addSquare(squares: SquareClasses, key: Key, klass: string): void {
  if (squares[key]) squares[key][klass] = true;
  else squares[key] = { [klass]: true };
}

function renderSquares(d: State, ctx: Ctx): VNode[] {
  const squares: SquareClasses = {};
  let i: any, k: Key;
  if (d.lastMove && d.highlight.lastMove) for (i in d.lastMove) {
    addSquare(squares, d.lastMove[i], 'last-move');
  }
  if (d.check && d.highlight.check) addSquare(squares, d.check, 'check');
  if (d.selected) {
    addSquare(squares, d.selected, 'selected');
    const over = d.draggable.current && d.draggable.current.over,
    dests = d.movable.dests && d.movable.dests[d.selected];
    if (dests) for (i in dests) {
      k = dests[i];
      if (d.movable.showDests) addSquare(squares, k, 'move-dest');
      if (k === over) addSquare(squares, k, 'drag-over');
      else if (d.movable.showDests && d.pieces[k]) addSquare(squares, k, 'oc');
    }
    const pDests = d.premovable.dests;
    if (pDests) for (i in pDests) {
      k = pDests[i];
      if (d.movable.showDests) addSquare(squares, k, 'premove-dest');
      if (k === over) addSquare(squares, k, 'drag-over');
      else if (d.movable.showDests && d.pieces[k]) addSquare(squares, k, 'oc');
    }
  }
  const premove = d.premovable.current;
  if (premove) for (i in premove) addSquare(squares, premove[i], 'current-premove');
  else if (d.predroppable.current) addSquare(squares, d.predroppable.current.key, 'current-premove');

  let o = d.exploding;
  if (o) for (i in o.keys) addSquare(squares, o.keys[i], 'exploding' + o.stage);

  const nodes: VNode[] = [];

  // if (d.items) {
  //   let key: Key, square: SquareClasses | undefined, item: Item;
  //   for (i = 0; i < 64; i++) {
  //     key = util.allKeys[i];
  //     square = squares[key];
  //     item = d.items(util.key2pos(key), key);
  //     if (square || item) {
  //       var sq = renderSquare(key, square ? square.join(' ') + (item ? ' has-item' : '') : 'has-item', ctx);
  //       if (item) sq.children = [item];
  //       dom.push(sq);
  //     }
  //   }
  // }

  for (i in squares) nodes.push(renderSquare(i, squares[i], ctx));
  return nodes;
}

function renderContent(d: State): VNode[] {
  const ctx: Ctx = {
    asWhite: d.orientation === 'white',
    bounds: d.dom.bounds,
    transformProp: util.transformProp()
  },
  animation = d.animation.current,
  nodes: VNode[] = renderSquares(d, ctx),
  fadings = animation && animation.plan.fadings,
  draggable = d.draggable.current;
  let i: any;

  if (fadings) for (i in fadings) nodes.push(renderFading(fadings[i], ctx));

  // must insert pieces in the right order
  // for 3D to display correctly
  const keys = ctx.asWhite ? util.allKeys : util.invKeys;
  if (d.items) {
    // for (i = 0; i < 64; i++) {
    //   if (d.pieces[keys[i]] && !d.items(util.key2pos(keys[i]), keys[i]))
    //   children.push(renderPiece(d, keys[i], ctx));
    // }
    }
  else {
    for (i = 0; i < 64; ++i) {
      if (d.pieces[keys[i]]) nodes.push(renderPiece(d, keys[i], ctx));
    }
    // the hack to drag new pieces on the board (editor and crazyhouse)
    // is to put it on a0 then set it as being dragged
    if (draggable && draggable.newPiece) nodes.push(renderPiece(d, 'a0', ctx));
  }

  if (draggable && d.draggable.showGhost && !draggable.newPiece) {
    nodes.push(renderGhost(draggable.orig, d.pieces[draggable.orig], ctx));
  }

  if (d.drawable.enabled) {
    let node = svg(d);
    if (node) nodes.push(node);
  }
  return nodes;
}

const pieceTag = 'piece';
const squareTag = 'square';

function pieceClasses(p: Piece): Classes {
  return {
    [p.role]: true,
    [p.color]: true
  };
}
