(ns chessground.show
  "Mutates the DOM to show state changes"
  (:require [chessground.render :as render]
            [chessground.dom-data :as dom-data]
            [chessground.drag :as drag]
            [chessground.select :as select]
            [chessground.common :as common :refer [pp]]))

(def selected-class "selected")

(defn- square-of [root key]
  (.getElementById js/document (str (.-id root) key)))

(defn selected [root selected previous]
  (when previous (-> (square-of root previous) .-classList (.remove selected-class)))
  (when selected (-> (square-of root selected) .-classList (.add selected-class))))

(defn moved [root orig dest previous]
  (doseq [key previous]
    (-> (square-of root key) .-classList (.remove "moved")))
  (doseq [key [orig dest]]
    (-> (square-of root key) .-classList (.add "moved"))))

(defn dests [root dests previous]
  (doseq [key previous]
    (if-let [sq (square-of root key)]
      (-> sq .-classList (.remove "dest"))))
  (doseq [key dests]
    (if-let [sq (square-of root key)]
      (-> sq .-classList (.add "dest")))))

(defn move [root orig dest]
  (let [orig-square (square-of root orig)
        dest-square (square-of root dest)
        piece (common/$ ".chessground-piece" orig-square)]
    (drag/unfuck piece)
    (when-let [dest-piece (common/$ ".chessground-piece" dest-square)] (dom-data/remove-el dest-piece))
    (.appendChild dest-square piece)))

(defn un-move [root orig]
  (let [orig-square (square-of root orig)
        piece (common/$ ".chessground-piece" orig-square)]
    (when piece (drag/unfuck piece))))

(defn square-interactions [root state chans]
  (doseq [sq (common/$$ ".chessground-square" root)]
    (drag/square sq chans)
    (select/square sq chans)))

(defn piece-interactions [root state chans]
  (let [movable-color (-> state :movable :color)]
    (doseq [p (common/$$ ".chessground-piece" root)
            :let [instance (dom-data/fetch p :interact)
                  owner (if (common/has-class p "white") "white" "black")
                  draggable (or (= movable-color "both") (= movable-color owner))]]
      (if instance
        ((if draggable drag/piece-on drag/piece-off) p state)
        (when draggable (drag/make-draggable p chans state))))))

(defn board [root state chans]
  (set! (.-outerHTML (common/$ ".board" root)) (render/board state root))
  (square-interactions root state chans)
  (piece-interactions root state chans))

(defn app [root state chans]
  (set! (.-innerHTML root) (render/app state root))
  (square-interactions root state chans)
  (piece-interactions root state chans))
