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
             :color "all" ; color that can move. white or black or all
             :dests nil ; valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]} | nil
             :events {:after (fn [orig dest chess] nil) ; called after the moves has been played
                      }
             }
   :selected nil ; square key of the currently moving piece. "a2" | nil
   })

(defn with-fen [state fen] (assoc state :chess (chess/make fen)))

(defn with-dests [state dests]
  (assoc-in state [:movable :dests] dests))

(defn make [config] (-> (merge defaults config)
                        (with-fen (:fen config))
                        (dissoc :fen)))

(defn is-movable? [state key]
  "Piece on this square may be moved somewhere, if the validation allows it"
  (let [owner (chess/owner-color (:chess state) key)
        movable (:movable state)
        color (:color movable)]
    (and owner (or (= color :all) (= color owner)))))

(defn can-move? [state orig dest]
  "The piece on orig can definitely be moved to dest"
  (and (is-movable? state orig)
       (let [movable (:movable state)
             dests (:dests movable)]
         (or (:free movable) (common/set-contains? (get dests orig) dest)))))

(defn dests-of [state orig]
  "List of destinations square keys for this origin"
  (when (is-movable? state orig)
    (if (-> state :movable :free)
      (for [rank (range 1 9)
            file (vec "abcdefgh")
            :let [key (str file rank)]
            :when (not= orig key)] key)
      (pp (get-in state [:movable :dests]))
      (get-in state [:movable :dests orig]))))
