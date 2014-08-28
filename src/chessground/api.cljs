(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]))

(defn build
  "Creates JavaScript functions that push to the channel"
  [chan]
  (letfn [(push [function data] (common/push! chan [function data]))]
    (clj->js
      {:toggleOrientation #(push :toggle-orientation nil)
       :setOrientation    #(push :set-orientation %)
       :setFen            #(push :set-fen %)
       :setStartPos       #(push :set-fen "start")
       :clear             #(push :clear nil)
       :move              #(push :api-move [%1 %2])
       :setLastMove       #(push :set-last-move [%1 %2])
       :setCheck          #(push :set-check %)
       :setPieces         (fn [pieces]
                            (push :set-pieces (common/map-values
                                                common/keywordize-keys
                                                (js->clj pieces {:keywordize-keys true}))))
       :setDests          #(push :set-dests (js->clj %))})))
; "setFen"            (fn [fen] (push-in :set-fen fen))
; "startPos"          (fn [] (push-in :set-fen "start"))
; "setDests"          (fn [dests] (push-in :set-dests (js->clj dests)))
; "setColor"          (fn [color] (push-in :set-color color))
; "setPieces"         (fn [pieces]
;                       (push-in :set-pieces
;                         (into {} (for [[k v] (js->clj pieces)]
;                                    [k (common/keywordize-keys v)]))))
; "move"              (fn [orig dest] (push-in :api-move [orig dest]))
; "showLastMove"      (fn [orig dest] (push-in :show-last-move [orig dest]))
; "showCheck"         (fn [cell] (push-in :show-check [cell]))
; "clear"             (fn [] (push-in :clear true))
; "getOrientation"    (fn [] (:orientation @state-atom))
; "getColor"          (fn [] (:color (:movable @state-atom)))
; "getPosition"       (fn [] (clj->js (chess/get-pieces (:chess @state-atom))))})))

