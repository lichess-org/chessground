(ns chessground.drag
  "Make pieces draggable, and squares droppable"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]
            [cljs.core.async :as a]))

(def ^private class-dragging "dragging")
(def ^private class-drag-over "drag-over")

(defn- event-stop [e] (.stopPropagation e) (.preventDefault e))

(defn- over-key [this e]
  (let [bounds (-> this .-state (aget "drag-bounds"))
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
               (-> this .-state (aget "draggable")))
      (let [board (.. this getDOMNode -parentNode -parentNode)
            x (.-offsetLeft board)
            y (.-offsetTop board)
            size (.-offsetWidth board)]
        (.setState this #js {:drag-bounds #js [x y size]
                             :drag-rel #js {:x (.-pageX e)
                                            :y (.-pageY e)}})))))

(defn mousemove [this e]
  ; (pp "onmove")
  (event-stop e)
  (when-let [rel (-> this .-state (aget "drag-rel"))]
    (let [pos #js {:x (- (.-pageX e) (aget rel "x"))
                   :y (- (.-pageY e) (aget rel "y"))}]
      ((-> this .-props (aget "set-hover")) (over-key this e))
      (.setState this #js {:drag-pos pos}))))

(defn mouseup [this e]
  (event-stop e)
  ((-> this .-props (aget "set-hover")) nil)
  (.setState this #js {:drag-rel nil
                       :drag-pos nil})
  (when-let [drop-key (over-key this e)]
    ((-> this .-props (aget "ctrl")) :drop-on drop-key)))

(defn will-receive-props [this props]
  (when (and (-> this .-state (aget "drag-rel")) (not (aget props "draggable")))
    (.setState this #js {:drag-rel nil
                         :drag-pos nil})))

(defn did-update [this prev-state]
  (if (and (-> this .-state (aget "drag-rel")) (not (aget prev-state "drag-rel")))
    (do (.addEventListener js/document "mousemove" (aget this "onMouseMove"))
        (.addEventListener js/document "mouseup" (aget this "onMouseUp")))
    (when (and (not (-> this .-state (aget "drag-rel"))) (aget prev-state "drag-rel"))
      (.removeEventListener js/document "mousemove" (aget this "onMouseMove"))
      (.removeEventListener js/document "mouseup" (aget this "onMouseUp")))))
