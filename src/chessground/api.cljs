(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :as common :refer [pp push!]]
            [chessground.chess :as chess]))

(defn build
  "Creates JavaScript functions that push to the channels"
  [channels state-atom root]
  (clj->js
    (letfn [(push-in [ch val] (push! (get channels ch) val))]
      {"toggleOrientation" (fn [] (push-in :toggle-orientation true))
       "setOrientation"    (fn [orientation] (push-in :set-orientation orientation))
       "setFen"            (fn [fen] (push-in :set-fen fen))
       "startPos"          (fn [] (push-in :set-fen "start"))
       "setDests"          (fn [dests] (push-in :set-dests (js->clj dests)))
       "setColor"          (fn [color] (push-in :set-color color))
       "setPieces"         (fn [pieces]
                             (push-in :set-pieces
                               (into {} (for [[k v] (js->clj pieces)]
                                          [k (common/keywordize-keys v)]))))
       "move"              (fn [orig dest] (push-in :api-move [orig dest]))
       "showMoved"         (fn [orig dest] (push-in :show-moved [orig dest]))
       "clear"             (fn [] (push-in :clear true))
       "getOrientation"    (fn [] (:orientation @state-atom))
       "getColor"          (fn [] (:color (:movable @state-atom)))
       "getPosition"       (fn [] (clj->js (chess/get-pieces (:chess @state-atom))))})))
