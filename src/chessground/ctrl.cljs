(ns chessground.ctrl
  "User actions"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [om.core :as om]
            [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(defn- callback [function & args]
  "Call a user supplied callback function, if any"
  (when function (apply function (map clj->js args))))

(defn- move-start [app orig]
  "A move has been started by clicking on a piece"
  (update-in app [:chess] chess/set-selected orig (-> app :movable :dests)))

(defn- move-cancel [app]
  (-> app
      (update-in [:chess] chess/set-unselected)
      (assoc :dragging false)))

(defn- move-piece [app [orig dest]]
  "A move initiated through the UI"
  (or
    ; destination is available: return new app
    (when (data/can-move? app orig dest)
      (when-let [new-chess (chess/move-piece (:chess app) [orig dest])]
        (let [new-app (-> app
                          (assoc :chess new-chess)
                          (assoc-in [:movable :dests] nil))]
          (callback (-> new-app :movable :events :after) orig dest new-chess)
          new-app)))
    ; destination is not available, move is canceled but there are different cases:
    (if (= orig dest)
      ; dragging to same square: replace piece to origin
      (-> app (assoc :dragging false))
      ; moving to a non allowed square:
      (if (and (not (:dragging app)) (data/is-movable? app dest))
        ; when not dragging, allow to reselect movable pieces with a single click/touch
        (move-start app dest)
        ; otherwise cancel move
        (move-cancel app)))))

(defn- select-square [app key]
  (or
    (if-let [orig (chess/get-selected (:chess app))]
      (when (not (= orig key))
        (move-piece app [orig key]))
      (when (data/is-movable? app key)
        (move-start app key)))
    app))

(defn- drag-start [app orig]
  "A move has been started, by dragging a piece"
  (-> app
      (assoc :dragging true)
      (update-in [:chess] chess/set-selected orig (-> app :movable :dests))))

(defn- drop-off [app]
  (update-in
    (or (when (= "trash" (-> app :movable :drop-off))
          (when-let [key (chess/get-selected (:chess app))]
            (update-in app [:chess] chess/set-pieces {key nil})))
        app)
    [:chess] chess/set-unselected))

(defn- drop-on [app dest]
  (if-let [orig (chess/get-selected (:chess app))]
    (move-piece app [orig dest])
    (drop-off app)))

(defn handler [cursor chan]
  (am/go-loop
    []
    (let [[function data] (a/<! chan)]
      (case function
        :select-square (om/transact! cursor #(select-square % data))
        :drag-start (om/transact! cursor #(drag-start % data))
        :drop-off (om/transact! cursor drop-off)
        :drop-on (om/transact! cursor #(drop-on % data))))
    (recur)))
