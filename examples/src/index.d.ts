/// <reference path="../../src/dts/index.d.ts" />

interface Example {
  name: string;
  run: (el: HTMLElement) => void
}
interface Window {
  Chessground: Constructor
}
