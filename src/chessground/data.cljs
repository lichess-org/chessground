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
   :movable {:free? true ; all moves are valid - board editor
             :color "both" ; color that can move. white | black | both | nil
             :dests nil ; valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]} | nil
             :drop-off "revert" ; when a piece is dropped outside the board. "revert" | "trash"
             ; :drag-center? true ; whether to center the piece under the cursor on drag start
             :events {:after (fn [orig dest chess] nil) ; called after the moves has been played
                      }}
   :premovable {:enabled? true ; allow premoves for color that can not move
                :current nil ; keys of the current saved premove ["e2" "e4"] | nil.
                }})

(defn- update-chess-movables [state]
  (update-in state [:chess] chess/update-movables
             (:turn-color state)
             (-> state :movable :color)
             (-> state :premovable :enabled?)))

(defn with-fen [state fen]
  (assoc state :chess (chess/make (or fen "start"))))

(defn make [js-config]
  (let [config (-> js-config
                   common/keywordize-keys
                   (common/keywordize-keys-in [:movable])
                   (common/keywordize-keys-in [:movable :events]))]
    (-> (common/deep-merge defaults config)
        (with-fen (:fen config))
        (dissoc :fen)
        update-chess-movables)))

(defn clear [state]
  (-> state
      (assoc :chess chess/clear)
      (assoc-in [:movable :dests] nil)))

(defn movable? [state orig] (chess/movable? (:chess state) orig))

(defn premovable? [state orig] (chess/premovable? (:chess state) orig))

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

(defn- update-chess-dests [state]
  (update-in state [:chess] chess/update-dests (-> state :movable :dests)))

(defn set-dests [state dests]
  (-> state
      (assoc-in [:movable :dests] dests)
      (assoc-in [:movable :free?] false)
      update-chess-dests))

(defn set-turn-color [state color]
  (if (common/seq-contains? chess/colors color)
    (-> state
        (assoc :turn-color color)
        update-chess-movables
        update-chess-dests)
    state))

(defn set-movable-color [state color]
  (if (common/seq-contains? (conj chess/colors "both") color)
    (-> state
        (assoc-in [:movable :color] color)
        update-chess-movables)
    state))

(defn set-premovable [state enabled]
  (assoc-in state [:premovable :enabled?] (boolean enabled)))

(defn set-premove-current [state keys]
  (-> state
      (assoc-in [:premovable :current] keys)
      (update-in [:chess] chess/set-unselected)
      (update-in [:chess] chess/set-current-premove keys)))

(defn set-orientation [prev next]
  (if (common/seq-contains? chess/colors next) next prev))

(defn toggle-orientation [prev]
  (set-orientation prev (if (= prev "white") "black" "white")))
