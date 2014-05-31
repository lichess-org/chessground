(ns chessground.data
  "Contains functions for manipulating and persisting the application data"
  (:refer-clojure :exclude [filter])
  (:require [cljs.core.async :as a]
            [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]))

(def defaults
  "Default state, overridable by user configuration"
  {:fen nil
   :orientation :white
   :movable {:enabled :both ; :white | :black | :both | nil
             }
   :selected nil ; last clicked square. :a2 | nil
   :drag-from nil ; square we drag the piece from :a2 | nil
   :drag-over nil ; square being hovered during a drag. :a2 | nil
   })

(defn set-fen [state fen] (assoc state :chess (chess/make fen)))

(defn make [config] (-> (merge defaults config)
                        (set-fen (:fen config))
                        (dissoc :fen)))

(defn square-key [dom-element]
  (keyword (or
             (.getAttribute dom-element "data-key")
             (.getAttribute (.-parentNode dom-element) "data-key"))))

(defn element-from-point [pointer]
  (.elementFromPoint js/document (.-pageX pointer) (.-pageY pointer)))

(defn drag-start [state [draggie event pointer]]
  (assoc state :drag-from (square-key (.-target event))))

(defn drag-move [state [draggie event pointer]]
  (assoc state :drag-over (square-key (element-from-point pointer))))

(defn drag-end [state [draggie event pointer]]
  (jq/css ($ (.-element draggie)) {:top 0 :left 0})
  (-> (or (when-let [to (square-key (.-target event))]
            (when-let [from (:drag-from state)]
              (when-let [new-chess (chess/move-piece (:chess state) from to)]
                (assoc state :chess new-chess))))
          state)
      (dissoc :drag-from)
      (dissoc :drag-over)))

(defn select-square [state key]
  (or (when-let [from (:selected state)]
        (when-let [new-chess (chess/move-piece (:chess state) from key)]
          (-> state
              (assoc :chess new-chess)
              (assoc :selected nil))))
      (assoc state :selected key)))

(defn clear [state] (set-fen state nil))

(defn set-orientation [state orientation-str]
  (let [orientation (keyword orientation-str)]
    (if (common/set-contains? chess/colors orientation)
      (assoc state :orientation orientation)
      state)))

(defn toggle-orientation [state]
  (set-orientation state (if (= (:orientation state) :white) :black :white)))
