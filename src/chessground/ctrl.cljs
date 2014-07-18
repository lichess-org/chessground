(ns chessground.ctrl
  "Changes to state. Each function returns a new state and a function
  taking a root element and channels, and mutating the dom."
  (:require [chessground.common :as common :refer [pp]]
            [chessground.show :as show]
            [chessground.data :as data]
            [chessground.chess :as chess]))

(defn- callback [function & args]
  "Call a user supplied callback function, if any"
  (when function (apply function (map clj->js args))))

(defn- noop [] nil)

(defn move-start [state orig]
  "A move has been started, by clicking on a piece"
  (let [dests (data/dests-of state orig)
        new-state (assoc state :selected orig :showed-dests dests)]
    [new-state
     (fn [root chans]
       (show/selected root orig (:selected state))
       (show/dests root state dests))]))

(defn drag-start [state orig]
  "A move has been started, by dragging a piece"
  (let [dests (data/dests-of state orig)
        new-state (assoc state :selected orig :dragging true :showed-dests dests)]
    [new-state
     (fn [root chans]
       (show/selected root orig (:selected state))
       (show/dests root state dests))]))

(defn api-move [state [orig dest]]
  "A move initiated via API: we just update chess and show the move"
  (if-let [new-chess (chess/move-piece (:chess state) orig dest)]
    (let [new-state (-> state (assoc :chess new-chess :moved [orig dest]))]
      [new-state
       (fn [root chans]
         (show/move root orig dest)
         (show/moved root orig dest (:moved state)))])
    [state noop]))

(defn move-piece [state [orig dest]]
  "A move initiated through the UI"
  (or
    ; destination is available: return new state, move the piece
    (when (data/can-move? state orig dest)
      (when-let [new-chess (chess/move-piece (:chess state) orig dest)]
        (let [new-state (-> state
                            (assoc :chess new-chess :dragging false :moved [orig dest])
                            (dissoc :selected)
                            (assoc-in [:movable :dests] nil))]
          [new-state
           (fn [root chans]
             (show/move root orig dest)
             (show/selected root nil (:selected state))
             (show/dests root state nil)
             (show/moved root orig dest (:moved state))
             (callback (-> new-state :movable :events :after) orig dest new-chess))])))
    ; destination is not available, move is canceled but there are different cases:
    (if (= orig dest)
      ; dragging to same square: replace piece to origin
      (let [new-state (-> state (assoc :dragging false))]
        [new-state (fn [root chans] (show/un-move root orig))])
      ; moving to a non allowed square:
      (if (and (not (:dragging state)) (data/is-movable? state dest))
        ; when not dragging, allow to reselect movable pieces with a single click/touch
        (move-start state dest)
        ; otherwise cancel move
        (let [new-state (-> state (dissoc :selected) (assoc :dragging false))]
          [new-state
           (fn [root chans]
             (show/un-move root orig)
             (show/selected root nil (:selected state))
             (show/dests root state nil))])))))

(defn select-square [state key]
  (if-let [orig (:selected state)]
    (if (not (= orig key))
      (move-piece state [orig key])
      [state noop])
    (if (data/is-movable? state key)
      (move-start state key)
      [state
       (fn [root chans]
         (show/selected root nil (:selected state))
         (show/dests root state nil))])))

(defn show-moved [state [orig dest]]
  [state
   (fn [root chans]
     (show/moved root orig dest (:moved state)))])

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
         (show/selected root nil (:selected state))
         (show/dests root state nil)
         (show/un-move root key))])))

(defn clear [state]
  (let [new-state (data/clear state)]
    [new-state
     (fn [root chans] (show/app root new-state chans))]))
