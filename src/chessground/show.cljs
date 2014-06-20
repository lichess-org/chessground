(ns chessground.show
  "Mutates the DOM to show state changes"
  (:require [chessground.render :as render]
            [chessground.drag :as drag]
            [chessground.select :as select]
            [chessground.common :as common :refer [pp]]))

(defn- square [root key]
  (common/$ (str ".square[data-key=" key "]") root))

(defn selected [root selected]
  (doseq [anySelected (common/$$ ".square.selected" root)]
    (-> anySelected .-classList (.remove "selected")))
  (when selected (-> (square root selected) .-classList (.add "selected"))))

(defn dests [root dests]
  ; this is probably not the best approach, performance-wise.
  (doseq [square (common/$$ ".square" root)]
    (if (common/set-contains? dests (.getAttribute square "data-key"))
      (-> square .-classList (.add "dest"))
      (-> square .-classList (.remove "dest")))))

(defn move [root orig dest]
  (let [orig-square (square root orig)
        dest-square (square root dest)
        piece (common/$ ".piece" orig-square)]
    (drag/unfuck piece)
    (when-let [dest-piece (common/$ ".piece" dest-square)] (common/remove-el dest-piece))
    (.appendChild dest-square piece)))

(defn un-move [root orig]
  (let [orig-square (square root orig)
        piece (common/$ ".piece" orig-square)]
    (when piece (drag/unfuck piece))))

(defn square-interactions [root state chans]
  (doseq [sq (common/$$ ".square" root)]
    (drag/square sq chans)
    (select/square sq chans)))

(defn piece-interactions [root state chans]
  (let [movable-color (-> state :movable :color)]
    (doseq [p (common/$$ ".piece" root)
            :let [instance (common/get-dom-data p :interact)
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
