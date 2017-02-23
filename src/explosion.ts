export default function(data: Data, keys: Key[]): void {
  data.exploding = {
    stage: 1,
    keys: keys
  };
  data.dom.redraw();
  setTimeout(() => {
    setStage(data, 2);
    setTimeout(() => setStage(data, undefined), 120);
  }, 120);
}

function setStage(data: Data, stage: number | undefined): void {
  if (data.exploding) {
    if (stage) data.exploding.stage = stage;
    else data.exploding = undefined;
    data.dom.redraw();
  }
}
