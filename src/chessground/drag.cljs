(ns chessground.drag
  "Contains functions for drag and drop of pieces"
  (:require [quiescent :as q :include-macros true]
            [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp square-key push-args!]]))

(defn make [component on-end]
  "Make a react component draggable"
  (q/wrapper component :onMount (fn [node] (-> (new js/Draggabilly node)
                                               (.on "dragEnd" on-end)))))

(defn end [[draggie event pointer]]
  "Restore element position and return origin and destination square keys"
  (jq/css ($ (.-element draggie)) {:top 0 :left 0})
  (when-let [orig (square-key (.-element draggie))]
    (when-let [dest (square-key (.-target event))]
      [orig dest])))
