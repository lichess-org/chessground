import { ranks, files } from './util'

function renderCoords(elems: any[], klass: string): HTMLElement {
  const el = document.createElement('coords');
  el.className = klass;
  let f: HTMLElement;
  for (let i in elems) {
    f = document.createElement('coord');
    f.textContent = elems[i];
    el.appendChild(f);
  }
  return el;
}

export default function(state: State): () => void {

  if (!state.coordinates) return () => {};

  let orientation: Color = state.orientation;

  var coords = document.createDocumentFragment();
  var orientClass = orientation === 'black' ? ' black' : '';
  coords.appendChild(renderCoords(ranks, 'ranks' + orientClass));
  coords.appendChild(renderCoords(files, 'files' + orientClass));
  state.dom.element.appendChild(coords);

  return () => {
    if (state.orientation === orientation) return;
    orientation = state.orientation;
    const coords = state.dom.element.querySelectorAll('coords');
    for (let i = 0; i < coords.length; ++i)
      coords[i].classList.toggle('black', orientation === 'black');
  };
}
