(ns chessground.drag
  "Make pieces draggable, and squares droppable"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]
            [cljs.core.async :as a]))

(def ^private class-dragging "dragging")
(def ^private class-drag-over "drag-over")

(defn- event-stop [e] (.stopPropagation e) (.preventDefault e))

(defn- over-key [this e]
  (let [bounds (.. this -state -drag-bounds)
        board-x (aget bounds 0)
        board-y (aget bounds 1)
        board-size (aget bounds 2)
        file (js/Math.ceil (* 8 (/ (- (.-pageX e) board-x) board-size)))
        rank (js/Math.ceil (- 8 (* 8 (/ (- (.-pageY e) board-y) board-size))))]
    (when (and (> file 0) (< file 9) (> rank 0) (< rank 9)) (common/pos->key #js [file rank]))))

(defn mousedown [this]
  (fn [e]
    (event-stop e)
    (when (and (== (.-button e) 0) ; only left button
               (.. this -state -draggable))
      (let [board (.. this getDOMNode -parentNode -parentNode)
            x (.-offsetLeft board)
            y (.-offsetTop board)
            size (.-offsetWidth board)]
        (.setState this #js {:drag_bounds #js [x y size]
                             :drag_rel #js {:x (.-pageX e)
                                            :y (.-pageY e)}})))))

(defn mousemove [this e]
  ; (pp "onmove")
  (event-stop e)
  (when-let [rel (.. this -state -drag-rel)]
    (let [pos #js {:x (- (.-pageX e) (.-x rel))
                   :y (- (.-pageY e) (.-y rel))}]
      (.. this -props (set-hover (over-key this e)))
      (.setState this #js {:drag_pos pos}))))

(defn mouseup [this e]
  (event-stop e)
  (.. this -props (set-hover nil))
  (.setState this #js {:drag_rel nil
                       :drag_pos nil})
  (when-let [drop-key (over-key this e)]
    (.. this -props (ctrl :drop-on drop-key))))

(defn will-receive-props [this props]
  (when (and (.. this -state -drag-rel) (not (.-draggable props)))
    (.setState this #js {:drag_rel nil
                         :drag_pos nil})))

(defn did-update [this prev-state]
  (if (and (.. this -state -drag-rel) (not (.-drag-rel prev-state)))
    (do (.addEventListener js/document "mousemove" (.-onMouseMove this))
        (.addEventListener js/document "mouseup" (.-onMouseUp this)))
    (when (and (not (.. this -state -drag-rel)) (.-drag-rel prev-state))
      (.removeEventListener js/document "mousemove" (.-onMouseMove this))
      (.removeEventListener js/document "mouseup" (.-onMouseUp this)))))
