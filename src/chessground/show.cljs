(ns chessground.show
  "Mutates the DOM to show state changes"
  (:require [chessground.render :as render]
            [chessground.dom-data :as dom-data]
            [chessground.drag :as drag]
            [chessground.select :as select]
            [chessground.common :as common :refer [pp]]))

(defn- square-of [root key]
  (common/$ (str ".square[data-key=" key "]") root))

(defn selected [root selected]
  (doseq [anySelected (common/$$ ".square.selected" root)]
    (-> anySelected .-classList (.remove "selected")))
  (when selected (-> (square-of root selected) .-classList (.add "selected"))))

(defn moved [root orig dest]
  (doseq [any-moved (common/$$ ".square.moved" root)]
    (-> any-moved .-classList (.remove "moved")))
  (doseq [key [orig dest]]
    (-> (square-of root key) .-classList (.add "moved"))))

(defn dests [root dests]
  ; this is probably not the best approach, performance-wise.
  (doseq [sq (common/$$ ".square" root)]
    (if (common/set-contains? dests (.getAttribute sq "data-key"))
      (-> sq .-classList (.add "dest"))
      (-> sq .-classList (.remove "dest")))))

(defn move [root orig dest]
  (let [orig-square (square-of root orig)
        dest-square (square-of root dest)
        piece (common/$ ".piece" orig-square)]
    (drag/unfuck piece)
    (when-let [dest-piece (common/$ ".piece" dest-square)] (dom-data/remove-el dest-piece))
    (.appendChild dest-square piece)))

(defn un-move [root orig]
  (let [orig-square (square-of root orig)
        piece (common/$ ".piece" orig-square)]
    (when piece (drag/unfuck piece))))

(defn square-interactions [root state chans]
  (doseq [sq (common/$$ ".square" root)]
    (drag/square sq chans)
    (select/square sq chans)))

(defn piece-interactions [root state chans]
  (let [movable-color (-> state :movable :color)]
    (doseq [p (common/$$ ".piece" root)
            :let [instance (dom-data/fetch p :interact)
                  owner (if (common/has-class p "white") "white" "black")
                  draggable (or (= movable-color "both") (= movable-color owner))]]
      (if instance
        (if draggable
          (drag/piece-on p state)
          (drag/piece-off p state))
        (when draggable (drag/make-draggable p chans state))))))

(defn board [root state chans]
  (set! (.-innerHTML (common/$ ".board" root)) (render/board state))
  (square-interactions root state chans)
  (piece-interactions root state chans))

(defn app [root state chans]
  (set! (.-innerHTML root) (render/app state))
  (square-interactions root state chans)
  (piece-interactions root state chans))
