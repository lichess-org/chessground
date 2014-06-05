(ns chessground.data
  "Representation and manipulation of the application data"
  (:refer-clojure :exclude [filter])
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]))

(def defaults
  "Default state, overridable by user configuration"
  {:fen nil ; replaced by :chess by data/make
   :orientation :white
   :movable {:free true ; all moves are valid - board editor
             :color :all ; color that can move, or :all
             :dests nil ; valid moves. {:a2 #{:a3 :a4} :b1 #{:a3 c3}} | nil
             :events {:after (fn [orig to] nil) ; called after the moves has been played
                      }
             }
   :selected nil ; square key of the currently moving piece. :a2 | nil
   })

(defn with-fen [state fen] (assoc state :chess (chess/make fen)))

(defn- fix-dests [dests]
  "Converts the dests config format to a map of sets"
  (into {} (map #(vector (first %) (set (map keyword (second %)))) dests)))

(defn with-dests [state dests]
  (assoc-in state [:movable :dests] (fix-dests dests)))

(defn make [config] (-> (merge defaults config)
                        (with-fen (:fen config))
                        (dissoc :fen)
                        (update-in [:movable :color] keyword)
                        (with-dests (-> config :movable :dests))))

(defn is-movable? [state key]
  "Piece on this square may be moved somewhere, if the validation allows it"
  (let [owner (chess/owner-color (:chess state) key)
        movable (:movable state)
        color (:color movable)]
    (and owner
         (or (= color :all) (= color owner)))))

(defn can-move? [state orig dest]
  "The piece on orig can definitely be moved to dest"
  (and (is-movable? state orig)
       (let [movable (:movable state)]
         (or (:free movable) (contains? (-> movable :dests orig) dest)))))
