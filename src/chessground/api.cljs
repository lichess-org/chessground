(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [om.core :as om]
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
       :getColor          #(ask :get-color %)
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
       :setDests          #(tell :set-dests (js->clj %))
       :setColor          #(tell :set-color %)})))

(defn handler [cursor chan]
  (am/go-loop
    []
    (let [[function msg] (a/<! chan)]
      (case function
        :set-orientation (om/transact! cursor :orientation #(data/set-orientation % msg))
        :toggle-orientation (om/transact! cursor :orientation data/toggle-orientation)
        :get-orientation (a/>! msg (:orientation @cursor))
        :get-position (a/>! msg (chess/get-pieces (:chess @cursor)))
        :get-color (a/>! msg (-> @cursor :movable :color))
        :set-fen (om/update! cursor :chess (chess/make (or msg "start")))
        :clear (om/update! cursor :chess chess/clear)
        :api-move (om/transact! cursor :chess #(chess/move-piece % msg))
        :set-last-move (om/transact! cursor :chess #(chess/set-last-move % msg))
        :set-check (om/transact! cursor :chess #(chess/set-check % msg))
        :set-pieces (om/transact! cursor :chess #(chess/set-pieces % msg))
        :set-dests (om/transact! cursor #(data/set-dests % msg))
        :set-color (om/transact! cursor #(data/set-color % msg))))
    (recur)))
