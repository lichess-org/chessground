(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]
            [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(defn build
  "Creates JavaScript functions that push to the channel"
  [chan]
  (letfn [(tell [function data] (common/push! chan [function data]))
          (ask [question callback]
            (let [response-chan (a/chan)]
              (am/go (a/>! chan [question response-chan])
                     (callback (clj->js (a/<! response-chan)))
                     (a/close! response-chan))))]
    (clj->js
      {:toggleOrientation #(tell :toggle-orientation nil)
       :setOrientation    #(tell :set-orientation %)
       :getOrientation    #(ask :get-orientation %)
       :getPosition       #(ask :get-position %)
       :setFen            #(tell :set-fen %)
       :setStartPos       #(tell :set-fen "start")
       :clear             #(tell :clear nil)
       :move              #(tell :api-move [%1 %2])
       :setLastMove       #(tell :set-last-move [%1 %2])
       :setCheck          #(tell :set-check %)
       :setPieces         (fn [pieces]
                            (tell :set-pieces (common/map-values
                                                common/keywordize-keys
                                                (js->clj pieces {:keywordize-keys true}))))
       :setDests          #(tell :set-dests (js->clj %))})))
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

