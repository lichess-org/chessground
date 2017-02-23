/// <reference path="../../src/dts/index.d.ts" />

interface Example {
  name: string;
  config: Config;
  run?: (cg: Api) => void
}
interface Window {
  Chessground: (e: HTMLElement, config: Config) => Api
}
