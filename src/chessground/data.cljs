(ns chessground.data
  "Representation and manipulation of the application data"
  (:refer-clojure :exclude [filter])
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]))

(def defaults
  "Default state, overridable by user configuration"
  {:fen nil ; replaced by :chess by data/make
   :orientation "white"
   :movable {:free true ; all moves are valid - board editor
             :color "both" ; color that can move. white or black or both
             :dests nil ; valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]} | nil
             :drop-off "revert" ; when a piece is dropped outside the board. "revert" | "trash"
             :events {:after (fn [orig dest chess] nil) ; called after the moves has been played
                      }
             }
   :selected nil ; square key of the currently moving piece. "a2" | nil
   :spare-pieces false ; provide extra pieces to put on the board
   })

(defn with-fen [state fen] (assoc state :chess (chess/make fen)))

(defn make [js-config]
  (let [config (-> js-config
                   common/keywordize-keys
                   (common/keywordize-keys-in [:movable])
                   (common/keywordize-keys-in [:movable :events]))]
    (-> (merge defaults config)
        (with-fen (:fen config))
        (dissoc :fen))))

(defn clear [state]
  (-> state
      (assoc :chess chess/clear)
      (assoc-in [:movable :dests] nil)))

(defn is-movable? [state key]
  "Piece on this square may be moved somewhere, if the validation allows it"
  (let [owner (chess/owner-color (:chess state) key)
        movable (:movable state)
        color (:color movable)]
    (and owner (or (= color "both") (= color owner)))))

(defn can-move? [state orig dest]
  "The piece on orig can definitely be moved to dest"
  (and (is-movable? state orig)
       (or (-> state :movable :free)
           (common/set-contains? (get-in state [:movable :dests orig]) dest))))

(defn dests-of [state orig]
  "List of destinations square keys for this origin"
  (when (is-movable? state orig)
    (if (-> state :movable :free)
      (for [rank (range 1 9)
            file (vec "abcdefgh")
            :let [key (str file rank)]
            :when (not= orig key)]
        key)
      (get-in state [:movable :dests orig]))))
