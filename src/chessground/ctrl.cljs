(ns chessground.ctrl
  "Changes to state.
   Each function returns a new state
   and a function taking a root element and channels,
   and mutating the dom"
  (:require [chessground.common :as common :refer [pp]]
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
     (fn [root chans]
       (show/selected root orig)
       (when (not (:free (:movable state)))
         (show/dests root (data/dests-of state orig))))]))

(defn move-piece [state [orig dest]]
  (or 
    ; destination is available: return new state, move the piece
    (when (data/can-move? state orig dest)
      (when-let [new-chess (chess/move-piece (:chess state) orig dest)]
        (let [new-state (-> state
                            (assoc :chess new-chess)
                            (dissoc :selected)
                            (assoc-in [:movable :dests] nil))]
          [new-state
           (fn [root chans]
             (show/move root orig dest)
             (show/selected root nil)
             (show/dests root nil)
             (callback (-> new-state :movable :events :after) orig dest new-chess))])))
    ; destination not available
    (if (= orig dest)
      ; dragging to same square: don't change state, replace piece to origin
      [state (fn [root chans] (show/move root orig dest))]
      ; moving to a non allowed square: cancel move means unselect orig square and replace
      ; piece to origin
      (let [new-state (dissoc state :selected)
            ; TODO: try to save dragging piece in state to avoid to check in DOM directly
            ; FIXME: dest square don't have class drag-over at the moment of the test (it should)
            ; instead dest square have class "selected" (it should not)
            dest-square (common/$ (str ".square[data-key=" dest "]") (:element state))]
        (if (and (not (common/has-class dest-square "drag-over")) (data/is-movable? new-state dest))
          ; when not dragging, allow to reselect movable pieces on single click/touch
          (move-start state dest)
          ; otherwise cancel move 
          [new-state
           (fn [root chans]
             (show/un-move root orig)
             (show/selected root nil)
             (show/dests root nil))])))))

(defn select-square [state key]
  (if-let [orig (:selected state)]
    (if (not (= orig key))
      (move-piece state [orig key])
      [state noop])
    (if (data/is-movable? state key)
      (move-start state key)
      [state 
       (fn [root chans]
         (show/selected root nil)
         (show/dests root nil))])))

(defn set-orientation [state orientation]
  (if (common/set-contains? chess/colors orientation)
    (let [new-state (assoc state :orientation orientation)]
      [new-state
       (fn [root chans] (show/board root new-state chans))])
    [state noop]))

(defn toggle-orientation [state]
  (set-orientation state (if (= (:orientation state) "white") "black" "white")))

(defn set-dests [state dests]
  (let [new-state (-> state
                      (assoc-in [:movable :dests] dests)
                      (assoc-in [:movable :free] false))]
    [new-state
     (fn [root chans]
       (show/piece-interactions root new-state chans))]))

(defn set-color [state color]
  (if (common/set-contains? (conj chess/colors "both") color)
    (let [new-state (assoc-in state [:movable :color] color)]
      [new-state
       (fn [root chans]
         (show/piece-interactions root new-state chans))])
    [state noop]))

(defn set-fen [state fen]
  (let [new-state (data/with-fen state fen)]
    [new-state
     (fn [root chans] (show/board root new-state chans))]))

(defn set-pieces [state pieces]
  (let [new-state (update-in state [:chess] #(chess/set-pieces % pieces))]
    [new-state
     (fn [root chans] (show/board root new-state chans))]))

(defn drop-off [state key]
  (if (= "trash" (-> state :movable :drop-off))
    (let [[new-state shower] (set-pieces state {key nil})]
      [(dissoc new-state :selected) shower])
    (let [new-state (dissoc state :selected)]
      [new-state
       (fn [root chans]
         (show/selected root nil)
         (show/un-move root key))])))

(defn clear [state]
  (let [new-state (data/clear state)]
    [new-state
     (fn [root chans] (show/app root new-state chans))]))
