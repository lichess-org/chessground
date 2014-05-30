(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :refer [pp push!]]))

(defn build
  "Creates JavaScript functions that push to the channels"
  [channels]
  (clj->js
    (letfn [(push-in [ch val] (push! (get channels ch) val))]
      {"toggleOrientation" (fn [] (push-in :toggle-orientation true))
       "setOrientation" (fn [o] (push-in :set-orientation o))
       "setFen" (fn [f] (push-in :set-fen f))
       "clear" (fn [] (push-in :clear true))})))
