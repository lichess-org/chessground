(ns chessground.ctrl
  "Contains functions for manipulating and persisting the application data"
  (:refer-clojure :exclude [filter])
  (:require [cljs.core.async :as a]
            [chessground.data :as data]
            [chessground.drag :as drag]
            [chessground.common :as common :refer [pp square-key]]
            [chessground.chess :as chess]))

(def set-fen data/with-fen)

(defn clear [state] (set-fen state nil))

(defn move-start [state key]
  "A move has been started, either by clicking on a piece, or dragging it"
  (assoc state :selected key))

(defn move-piece [state [orig dest]]
  (dissoc
    (or (when-let [new-chess (chess/move-piece (:chess state) orig dest)]
          (assoc state :chess new-chess))
        state)
    :selected))

(defn move-end [state key]
  "A move has been completed or canceled"
  (dissoc state :selected))

(defn select-square [state key]
  (if-let [from (:selected state)]
    (move-piece state [from key])
    (if (chess/get-piece (:chess state) key)
      (assoc state :selected key)
      state)))

(defn set-orientation [state orientation-str]
  (let [orientation (keyword orientation-str)]
    (if (common/set-contains? chess/colors orientation)
      (assoc state :orientation orientation)
      state)))

(defn toggle-orientation [state]
  (set-orientation state (if (= (:orientation state) :white) :black :white)))
