(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [om.core :as om :include-macros true]
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

(defn handler [cursor chan]
  (am/go
    (while true
      (let [[function data] (a/<! chan)]
        (case function
          :set-orientation (om/transact! cursor :orientation #(data/set-orientation % data))
          :toggle-orientation (om/transact! cursor :orientation data/toggle-orientation)
          :get-orientation (a/>! data (:orientation @cursor))
          :get-position (a/>! data (chess/get-pieces (:chess @cursor)))
          :set-fen (om/update! cursor :chess (chess/make (or data "start")))
          :clear (om/update! cursor :chess chess/clear)
          :api-move (om/transact! cursor :chess #(chess/move-piece % data))
          :set-last-move (om/transact! cursor :chess #(chess/set-last-move % data))
          :set-check (om/transact! cursor :chess #(chess/set-check % data))
          :set-pieces (om/transact! cursor :chess #(chess/set-pieces % data))
          :set-dests (om/transact! cursor :chess #(chess/set-dests % data)))))))
