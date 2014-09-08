(ns chessground.data
  "Representation and manipulation of the application data"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]
            [chessground.premove :as premove]))

(def defaults
  "Default state, overridable by user configuration"
  {:fen nil ; replaced by :chess by data/make
   :chess {} ; representation of a chess game
   :orientation "white"
   :turn-color "white" ; turn to play. white | black
   :check nil; square currently in check "a2" | nil
   :last-move nil ; squares part of the last move ["c3" "c4"] | nil
   :selected nil ; square selected by the user "a1" | nil
   :movable {:free? true ; all moves are valid - board editor
             :color "both" ; color that can move. white | black | both | nil
             :dests nil ; valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]} | nil
             :drop-off "revert" ; when a piece is dropped outside the board. "revert" | "trash"
             ; :drag-center? true ; whether to center the piece under the cursor on drag start
             :events {:after (fn [orig dest chess] nil) ; called after the moves has been played
                      }}
   :premovable {:enabled? true ; allow premoves for color that can not move
                :dests nil ; current valid premove dests ["e3" "e4" "e5" "e6"]
                :current nil ; keys of the current saved premove ["e2" "e4"] | nil
                }})

(defn- callback [function & args]
  "Call a user supplied callback function, if any"
  (when function
    (js/setTimeout #(apply function (map clj->js args)) 50)))

(defn with-fen [state fen]
  (assoc state :chess (chess/make (or fen "start"))))

(defn make [config]
  (-> (common/deep-merge defaults config)
      (with-fen (:fen config))
      (dissoc :fen)
      (update-in [:movable :dests] common/stringify-keys)))

(defn movable? [state orig]
  (when-let [piece (chess/get-piece (:chess state) orig)]
    (or (= (-> state :movable :color) "both")
        (= (-> state :movable :color)
           (:turn-color state)
           (:color piece)))))

(defn premovable? [state orig]
  (when-let [piece (chess/get-piece (:chess state) orig)]
    (and (-> state :premovable :enabled?)
         (= (-> state :movable :color)
            (-> state :turn-color common/opposite-color)
            (:color piece)))))

(defn can-move? [state orig dest]
  "The piece on orig can definitely be moved to dest"
  (and (movable? state orig)
       (or (-> state :movable :free?)
           (common/seq-contains? (get-in state [:movable :dests orig]) dest))))

(defn can-premove? [state orig dest]
  "The piece on orig can definitely be premoved to dest"
  (and (premovable? state orig)
       (let [ch (:chess state)
             piece (chess/get-piece ch orig)]
         (common/seq-contains? (premove/possible ch orig piece) dest))))

(defn set-dests [state dests]
  (-> state
      (assoc-in [:movable :dests] dests)
      (assoc-in [:movable :free?] false)))

(defn set-turn-color [state color]
  (if (common/seq-contains? chess/colors color)
    (assoc state :turn-color color)
    state))

(defn set-movable-color [state color]
  (if (common/seq-contains? (conj chess/colors "both") color)
    (assoc-in state [:movable :color] color)
    state))

(defn set-premovable [state enabled]
  (assoc-in state [:premovable :enabled?] (boolean enabled)))

(defn set-current-premove [state keys]
  (assoc-in state [:premovable :current] keys))

(defn set-orientation [state color]
  (if (common/seq-contains? chess/colors color)
    (assoc state :orientation color)
    state))

(defn toggle-orientation [state]
  (set-orientation state (if (= (:orientation state) "white") "black" "white")))

(defn set-selected [state key] (assoc state :selected key))

(defn set-check [state key] (assoc state :check key))

(defn set-last-move [state last-move] (assoc state :last-move last-move))

(defn move-piece [state orig dest]
  (if-let [next-chess (chess/move-piece (:chess state) [orig dest])]
    (let [next-state (-> state
                         (assoc :chess next-chess)
                         (assoc-in [:movable :dests] nil)
                         (set-selected nil)
                         (set-check nil)
                         (set-last-move [orig dest]))]
      (callback (-> next-state :movable :events :after) orig dest next-chess)
      next-state)
    state))

(defn play-premove [state]
  (or (when-let [[orig dest] (-> state :premovable :current)]
        (when (can-move? state orig dest)
          (move-piece state orig dest)))
      state))
