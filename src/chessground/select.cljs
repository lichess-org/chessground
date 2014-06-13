(ns chessground.select
  "Make squares selectable"
  (:require [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp]]
            [chessground.ctrl :as ctrl]
            [chessground.chess :as chess]))

(defn square [el]
  (letfn [(handler [event]
            (.preventDefault event)
            (pp (if (.contains (.-classList (.-target event)) "square")
                  (.-target event)
                  (.-parentNode (.-target event)))))]
    (doseq [event-name ["touchstart" "mousedown"]]
      (.addEventListener el event-name handler))))
