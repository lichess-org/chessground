(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(defn build
  "Creates JavaScript functions that push to the channel"
  [tell]
  (letfn [(ask [question callback]
            (let [response-chan (a/chan)]
              (am/go
                (tell question response-chan)
                (callback (clj->js (a/<! response-chan)))
                (a/close! response-chan))
              nil))]
    (clj->js
      {:set               #(tell :set (js->clj % :keywordize-keys true))
       :getOrientation    #(ask :get-orientation %)
       :getPosition       #(ask :get-position %)
       :getFen            #(ask :get-fen %)
       :getState          #(ask :get-state %)
       :getCurrentPremove #(ask :get-current-premove %)
       :toggleOrientation #(tell :toggle-orientation nil)
       :move              #(tell :api-move [%1 %2])
       :setPieces         (fn [pieces]
                            (tell :set-pieces (common/map-values common/keywordize-keys (js->clj pieces))))
       :playPremove       #(tell :play-premove nil)})))
