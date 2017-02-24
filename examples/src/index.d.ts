/// <reference path="../../src/dts/index.d.ts" />

interface Example {
  name: string;
  run: (el: HTMLElement) => Api
}
interface Window {
  Chessground: Constructor
}
