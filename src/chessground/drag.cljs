(ns chessground.drag
  "Contains functions for drag and drop of pieces"
  (:require [quiescent :as q :include-macros true]
            [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp square-key push-args!]]))

(def over-class "drag-over")

(defn- drag-move [draggie event pointer]
  (let [$el ($ (common/square-element (.-target event)))]
    (when (not (jq/has-class $el over-class))
      (jq/remove-class (jq/siblings $el) over-class)
      (jq/add-class $el over-class))))

(defn make [channels component]
  "Make a react component draggable"
  (q/wrapper component :onMount (fn [node] (-> (new js/Draggabilly node)
                                               (.on "dragStart" (push-args! (:drag-start channels)))
                                               (.on "dragMove" drag-move)
                                               (.on "dragEnd" (push-args! (:drag-end channels)))))))

(defn end [[draggie event pointer]]
  "Undo damages done by dragging and return origin and destination square keys"
  (jq/css ($ (.-element draggie)) {:top 0 :left 0})
  (when-let [orig (square-key (.-element draggie))]
    (when-let [dest-element (common/square-element (.-target event))]
      (jq/remove-class ($ dest-element) over-class)
      (when-let [dest (square-key dest-element)]
        [orig dest]))))
