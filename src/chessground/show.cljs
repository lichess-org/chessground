(ns chessground.show
  "Mutates the DOM to show state changes"
  (:require [chessground.render :as render]
            [chessground.drag :as drag]
            [chessground.select :as select]
            [chessground.common :as common :refer [pp]]))

(defn- square [rootEl key]
  (common/$ (str ".square[data-key=" key "]") rootEl))

(defn selected [rootEl selected]
  (doseq [anySelected (common/$$ ".square.selected" rootEl)]
    (-> anySelected .-classList (.remove "selected")))
  (when selected (-> (square rootEl selected) .-classList (.add "selected"))))

(defn dests [rootEl dests]
  ; this is probably not the best approach, performance-wise.
  (doseq [square (common/$$ ".square" rootEl)]
    (if (common/set-contains? dests (.getAttribute square "data-key"))
      (-> square .-classList (.add "dest"))
      (-> square .-classList (.remove "dest")))))

(defn move [rootEl orig dest]
  (let [origSquare (square rootEl orig)
        destSquare (square rootEl dest)
        piece (common/$ ".piece" origSquare)]
    (drag/unfuck piece)
    (when-let [destPiece (common/$ ".piece" rootEl)] (.remove-child destSquare destPiece))
    (.append-child destSquare piece)))

(defn un-move [rootEl orig]
  (let [origSquare (square rootEl orig)
        piece (common/$ ".piece" origSquare)]
    (when piece (drag/unfuck piece))))

(defn square-interactions [rootEl state chans]
  (doseq [sq (common/$$ ".square" rootEl)]
    (drag/square sq chans)
    (select/square sq chans)))

(defn piece-interactions [rootEl state chans]
  (let [movable-color (-> state :movable :color)]
    (doseq [p (common/$$ ".piece" rootEl)
            :let [instance (common/get-dom-data p :interact)
                  owner (if (common/has-class p :white) "white" "black")
                  draggable (or (= movable-color "both") (= movable-color owner))]]
      (if instance
        (if draggable
          (drag/piece-on p state)
          (drag/piece-off p state))
        (when draggable (drag/make-draggable p chans state))))))

(defn board [rootEl state chans]
  (set! (.-innerHTML (common/$ ".board" rootEl)) (render/board state))
  (square-interactions rootEl state chans)
  (piece-interactions rootEl state chans))

(defn app [rootEl state chans]
  (set! (.-innerHTML rootEl) (render/app state))
  (square-interactions rootEl state chans)
  (piece-interactions rootEl state chans))
