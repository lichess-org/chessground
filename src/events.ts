

// function startDragOrDraw(d: Data) {
//   return function(e) {
//     if (util.isRightButton(e) && d.draggable.current.orig) {
//       if (d.draggable.current.newPiece) delete d.pieces[d.draggable.current.orig];
//       d.draggable.current = {}
//         d.selected = null;
//     } else if ((e.shiftKey || util.isRightButton(e)) && d.drawable.enabled) draw.start(d, e);
//     else drag.start(d, e);
//   };
// }

// function dragOrDraw(d, withDrag, withDraw, ctrl) {
//   return function(e) {
//     if ((e.shiftKey || util.isRightButton(e)) && d.drawable.enabled) withDraw(d, e);
//     else if (!d.viewOnly) withDrag(d, e, ctrl);
//   };
// }

// function bindEvents(ctrl, el, context) {
//   var d = ctrl.data;
//   var start = startDragOrDraw(d);
//   var move = dragOrDraw(d, drag.move, draw.move, ctrl);
//   var end = dragOrDraw(d, drag.end, draw.end, ctrl);
//   var onstart;
//   var onmove;
//   var onend;
//   var startEvents = ['touchstart', 'mousedown'];
//   var moveEvents = ['touchmove', 'mousemove'];
//   var endEvents = ['touchend', 'mouseup'];

//   if (ctrl.sparePieceSelected) {
//     onstart = function(e) {
//       if (pointerSelected(ctrl)) {
//         if (e.type !== 'mousemove') {
//           start(e);
//         }
//       } else if (e.type !== 'mousemove' || util.isLeftButton(e)) {
//         end(e);
//       }
//     };

//     onmove = function(e) {
//       if (pointerSelected(ctrl)) {
//         move(e);
//       }
//     };

//     onend = function(e) {
//       if (pointerSelected(ctrl)) {
//         end(e);
//       }
//     };

//     startEvents.push('mousemove');
//   } else {
//     onstart = start;
//     onmove = move;
//     onend = end;
//   }

//   startEvents.forEach(function(ev) {
//     el.addEventListener(ev, onstart);
//   });
//   moveEvents.forEach(function(ev) {
//     document.addEventListener(ev, onmove);
//   });
//   endEvents.forEach(function(ev) {
//     document.addEventListener(ev, onend);
//   });
//   context.onunload = function() {
//     startEvents.forEach(function(ev) {
//       el.removeEventListener(ev, onstart);
//     });
//     moveEvents.forEach(function(ev) {
//       document.removeEventListener(ev, onmove);
//     });
//     endEvents.forEach(function(ev) {
//       document.removeEventListener(ev, onend);
//     });
//   };
// }
