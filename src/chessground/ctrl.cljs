(ns chessground.ctrl
  "Changes to state.
   Each function returns a new state
   and a function taking an $app and channels,
   and mutating the dom"
  (:require [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp]]
            [chessground.show :as show]
            [chessground.data :as data]
            [chessground.chess :as chess]))

(defn- callback [function & args]
  "Call a user supplied callback function, if any"
  (when function (apply function (map clj->js args))))

(defn- noop [] nil)

(defn move-start [state orig]
  "A move has been started, either by clicking on a piece, or dragging it"
  (let [new-state (assoc state :selected orig)]
    [new-state
     (fn [$app chans]
       (show/selected $app orig)
       (show/dests $app (data/dests-of state orig)))]))

(defn move-piece [state [orig dest]]
  (or (when (data/can-move? state orig dest)
        (when-let [new-chess (chess/move-piece (:chess state) orig dest)]
          (let [new-state (-> state
                              (assoc :chess new-chess)
                              (dissoc :selected)
                              (assoc-in [:movable :dests] nil))]
            [new-state
             (fn [$app chans]
               (show/move $app orig dest)
               (show/selected $app nil)
               (show/dests $app nil)
               (callback (-> new-state :movable :events :after) orig dest new-chess))])))
      (let [new-state (dissoc state :selected)]
        [new-state
         (fn [$app chans]
           (show/un-move $app orig)
           (show/selected $app nil)
           (show/dests $app nil))])))

(defn select-square [state key]
  (if-let [orig (:selected state)]
    (move-piece state [orig key])
    (if (chess/get-piece (:chess state) key)
      (move-start state key)
      [state noop])))

(defn set-orientation [state orientation]
  (if (common/set-contains? chess/colors orientation)
    (let [new-state (assoc state :orientation orientation)]
      [new-state
       (fn [$app chans] (show/board $app new-state chans))])
    [state noop]))

(defn toggle-orientation [state]
  (set-orientation state (if (= (:orientation state) "white") "black" "white")))

(defn set-dests [state dests]
  (let [new-state (-> state
                      (assoc-in [:movable :dests] dests)
                      (assoc-in [:movable :free] false))]
    [new-state
     (fn [$app chans]
       (show/piece-interactions $app new-state chans))]))

(defn set-color [state color]
  (if (common/set-contains? (conj chess/colors "both") color)
    (let [new-state (assoc-in state [:movable :color] color)]
      [new-state
       (fn [$app chans]
         (show/piece-interactions $app new-state chans))])
    [state noop]))

(defn set-fen [state fen]
  (let [new-state (data/with-fen state fen)]
    [new-state
     (fn [$app chans] (show/board $app new-state chans))]))
