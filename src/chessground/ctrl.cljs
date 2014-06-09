(ns chessground.ctrl
  "Contains functions for manipulating and persisting the application data"
  (:refer-clojure :exclude [filter])
  (:require [cljs.core.async :as a]
            [chessground.data :as data]
            [chessground.drag :as drag]
            [chessground.common :as common :refer [pp square-key]]
            [chessground.chess :as chess]))

(defn- callback [function & args]
  "Call a user supplied callback function, if any"
  (when function (apply function (map clj->js args))))

(def set-fen data/with-fen)

(defn set-dests [state dests]
  (-> state
      (data/with-dests dests)
      (assoc-in [:movable :free] false)))

(defn set-color [state color] (assoc-in state [:movable :color] (keyword color)))

(defn clear [state] (set-fen state nil))

(defn move-start [state key]
  "A move has been started, either by clicking on a piece, or dragging it"
  (assoc state :selected key))

(defn move-piece [state [orig dest]]
  (or (when (data/can-move? state orig dest)
        (when-let [new-chess (chess/move-piece (:chess state) orig dest)]
          (let [new-state (-> state
                              (assoc :chess new-chess)
                              (dissoc :selected)
                              (assoc-in [:movable :dests] nil))]
            (callback (-> state :movable :events :after) orig dest new-chess)
            new-state)))
      (assoc state :selected dest)))

(defn move-end [state key]
  "A move has been completed or canceled"
  (dissoc state :selected))

(defn select-square [state key]
  (if-let [orig (:selected state)]
    (move-piece state [orig key])
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
