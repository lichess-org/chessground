(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(defn build
  "Creates JavaScript functions that push to the channel"
  [chan]
  (letfn [(tell [function msg] (a/put! chan [function msg]))
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
       :getState          #(ask :get-state %)
       :getCurrentPremove #(ask :get-current-premove %)
       :setFen            #(tell :set-fen %)
       :setStartPos       #(tell :set-fen "start")
       :clear             #(tell :clear nil)
       :move              #(tell :api-move [%1 %2])
       :setLastMove       #(tell :set-last-move [%1 %2])
       :setCheck          #(tell :set-check %)
       :setPieces         (fn [pieces]
                            (tell :set-pieces (common/map-values common/keywordize-keys (js->clj pieces))))
       :setDests          #(tell :set-dests (js->clj %))
       :setTurnColor      #(tell :set-turn-color %)
       :setMovableColor   #(tell :set-movable-color %)
       :setPremovable     #(tell :set-premovable %)
       :playPremove       #(tell :play-premove nil)})))
