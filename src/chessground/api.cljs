(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :refer [pp push!]]))

(defn build
  "Creates JavaScript functions that push to the channels"
  [channels]
  (clj->js
    (letfn [(push-in [ch val] (push! (get channels ch) val))]
      {"toggleOrientation" (fn [] (push-in :toggle-orientation true))
       "setOrientation" (fn [orientation] (push-in :set-orientation orientation))
       "setFen" (fn [fen] (push-in :set-fen fen))
       "setDests" (fn [dests] (push-in :set-dests (js->clj dests)))
       "clear" (fn [] (push-in :clear true))})))
