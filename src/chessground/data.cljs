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
             :dests nil ; valid moves. {:a2 #{:a3 :a4} :b1 #{:a3 c3}} | nil
             }
   :selected nil ; square key of the currently moving piece. :a2 | nil
   })

(defn with-fen [state fen] (assoc state :chess (chess/make fen)))

(defn- fix-dests [dests]
  "Converts the dests config format to a map of sets"
  (into {} (map #(vector (first %) (set (map keyword (second %)))) dests)))

(defn make [config] (-> (merge defaults config)
                        (with-fen (:fen config))
                        (dissoc :fen)
                        (assoc-in [:movable :dests] (fix-dests (-> config :movable :dests)))))

(defn can-move [state orig dest]
  (let [movable (:movable state)]
    (or (:free movable) (contains? (-> movable :dests orig) dest))))
