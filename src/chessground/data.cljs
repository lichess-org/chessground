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
   :movable {:enabled :both ; :white | :black | :both | nil
             }
   :validate-moves true ; only accepts legal moves
   :selected nil ; last clicked square. :a2 | nil
   })

(defn make [config]
  (let [merged (merge defaults config)
        with-chess (assoc merged :chess (chess/create (:fen config)))
        without-fen (dissoc with-chess :fen)]
    without-fen))

(defn user-move [state from to]
  "Attempts to play a move. Returns the new chess, or nil"
  (chess/move-piece (:chess state) from to (:validate-moves state)))

(defn select-square [state key]
  (assoc (or (when-let [selected-key (:selected state)]
               (when-let [new-chess (user-move state selected-key key)]
                 (assoc state :chess new-chess)))
             state)
         :selected key))

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
