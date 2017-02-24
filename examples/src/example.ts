import { Api } from 'chessground/api';

import * as basics from './basics'
import * as play from './play'
import * as perf from './perf'

export interface Example {
  name: string;
  run: (el: HTMLElement) => Api
}


export const examples: Example[] = [
  basics.defaults, basics.fromFen,
  play.initial,
  perf.move, perf.select
];
