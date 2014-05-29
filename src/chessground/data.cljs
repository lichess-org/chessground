(ns chessground.data
  "Contains functions for manipulating and persisting the application data"
  (:refer-clojure :exclude [filter])
  (:require [cljs.core.async :as a]
            [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess])
  (:require-macros [cljs.core.async.macros :as am]))

(def defaults
  "Default state, overridable by user configuration"
  {:fen nil
   :orientation :white
   :movable
   {:enabled :both ; :white | :black | :both | nil
    }
   :clicked nil ; last clicked square. :a2 | nil
   })

(defn fresh
  "Returns a new, empty application state."
  [config]
  (let [merged (merge defaults config)
        with-chess (assoc merged :chess (chess/create (:fen config)))
        without-fen (dissoc with-chess :fen)]
    without-fen))

(defn set-fen [state fen]
  (assoc state :chess (chess/create fen)))

(defn clear [state] (set-fen state nil))

(defn set-orientation [state orientation-str]
  (let [orientation (keyword orientation-str)]
    (if (common/set-contains? chess/colors orientation)
      (assoc state :orientation orientation)
      state)))

(defn toggle-orientation [state]
  (set-orientation state (if (= (:orientation state) :white) :black :white)))
