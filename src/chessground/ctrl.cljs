(ns chessground.ctrl
  "User actions"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [om.core :as om]
            [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(defn move-start [app orig]
  "A move has been started by clicking on a piece"
  (update-in app [:chess] chess/set-selected orig (-> app :movable :dests)))

(defn- select-square [app key]
  (if-let [orig (chess/get-selected (:chess app))]
    (if (not (= orig key))
      ; (move-piece app [orig key])
      app)
    (if (data/is-movable? app key)
      (move-start app key))))

(defn handler [cursor chan]
  (am/go-loop
    []
    (let [[function data] (a/<! chan)]
      (case function
        :select-square (om/transact! cursor #(select-square % data))))))
