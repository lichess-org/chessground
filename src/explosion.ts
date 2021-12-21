import { State } from './state.js';
import { Key } from './types.js';

export function explosion(state: State, keys: Key[]): void {
  state.exploding = { stage: 1, keys };
  state.dom.redraw();
  setTimeout(() => {
    setStage(state, 2);
    setTimeout(() => setStage(state, undefined), 120);
  }, 120);
}

function setStage(state: State, stage: number | undefined): void {
  if (state.exploding) {
    if (stage) state.exploding.stage = stage;
    else state.exploding = undefined;
    state.dom.redraw();
  }
}
