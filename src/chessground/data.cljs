(ns chessground.data
  "Contains functions for manipulating and persisting the application data"
  (:refer-clojure :exclude [filter])
  (:require [cljs.core.async :as a]
            [chessground.drag :as drag]
            [chessground.common :as common :refer [pp square-key]]
            [chessground.chess :as chess]))

(def defaults
  "Default state, overridable by user configuration"
  {:fen nil ; replaced by :chess by data/make
   :orientation :white
   :movable {:free true ; all moves are valid - board editor
             :valid nil ; valid moves. {:a2 [:a3 :a4] :b1 [:a3 c3]} | nil
             }
   :selected nil ; last clicked square. :a2 | nil
   })

(defn set-fen [state fen] (assoc state :chess (chess/make fen)))

(defn clear [state] (set-fen state nil))

(defn make [config] (-> (merge defaults config)
                        (set-fen (:fen config))
                        (dissoc :fen)))

(defn move-piece [state [orig dest]]
  (or (when-let [new-chess (chess/move-piece (:chess state) orig dest)]
        (assoc state :chess new-chess))
      state))

(defn unselect-square [state _] (dissoc state :selected))

(defn select-square [state key]
  (or (when-let [from (:selected state)]
        (dissoc (move-piece state [from key]) :selected))
      (if (chess/get-piece (:chess state) key)
        (assoc state :selected key)
        state)))

(defn set-orientation [state orientation-str]
  (let [orientation (keyword orientation-str)]
    (if (common/set-contains? chess/colors orientation)
      (assoc state :orientation orientation)
      state)))

(defn toggle-orientation [state]
  (set-orientation state (if (= (:orientation state) :white) :black :white)))
