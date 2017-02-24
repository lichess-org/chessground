import * as fen from './fen'

// see dts/state.d.ts for documentation on the State type
export default function(): Partial<State> {
  return {
    pieces: fen.read(fen.initial),
    orientation: 'white',
    turnColor: 'white',
    coordinates: true,
    autoCastle: false,
    viewOnly: false,
    disableContextMenu: false,
    resizable: true,
    pieceKey: false,
    highlight: {
      lastMove: true,
      check: true,
      dragOver: true
    },
    animation: {
      enabled: true,
      duration: 200
    },
    movable: {
      free: true,
      color: 'both',
      dropOff: 'revert',
      showDests: true,
      events: {},
      rookCastle: true
    },
    premovable: {
      enabled: true,
      showDests: true,
      castle: true,
      events: {}
    },
    predroppable: {
      enabled: false,
      events: {}
    },
    draggable: {
      enabled: true,
      distance: 3,
      autoDistance: true,
      centerPiece: true,
      showGhost: true
    },
    selectable: {
      enabled: true
    },
    stats: {
      dragged: !('ontouchstart' in window)
    },
    events: {},
    drawable: {
      enabled: true,
      eraseOnClick: true,
      shapes: [],
      autoShapes: [],
      brushes: {
        green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
        red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
        blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
        yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
        paleBlue: { key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15 },
        paleGreen: { key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15 },
        paleRed: { key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15 },
        paleGrey: { key: 'pgr', color: '#4a4a4a', opacity: 0.35, lineWidth: 15 }
      },
      pieces: {
        baseUrl: 'https://lichess1.org/assets/piece/cburnett/'
      }
    },
    editable: {
      enabled: false,
      selected: 'pointer'
    }
  };
}
