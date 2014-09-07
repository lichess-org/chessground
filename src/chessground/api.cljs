(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(defn build
  "Creates JavaScript functions that push to the channel"
  [ctrl]
  (letfn [(ask [question callback]
            (let [response-chan (a/chan)]
              (am/go
                (ctrl question response-chan)
                (callback (clj->js (a/<! response-chan)))
                (a/close! response-chan))
              nil))]
    (clj->js
      {:toggleOrientation #(ctrl :toggle-orientation nil)
       :setOrientation    #(ctrl :set-orientation %)
       :getOrientation    #(ask :get-orientation %)
       :getPosition       #(ask :get-position %)
       :getState          #(ask :get-state %)
       :getCurrentPremove #(ask :get-current-premove %)
       :setFen            #(ctrl :set-fen %)
       :setStartPos       #(ctrl :set-fen "start")
       :move              #(ctrl :api-move [%1 %2])
       :setLastMove       #(ctrl :set-last-move [%1 %2])
       :setCheck          #(ctrl :set-check %)
       :setPieces         (fn [pieces]
                            (ctrl :set-pieces (common/map-values common/keywordize-keys (js->clj pieces))))
       :setDests          #(ctrl :set-dests (js->clj %))
       :setTurnColor      #(ctrl :set-turn-color %)
       :setMovableColor   #(ctrl :set-movable-color %)
       :setPremovable     #(ctrl :set-premovable %)
       :playPremove       #(ctrl :play-premove nil)})))
