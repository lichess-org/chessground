(ns chessground.show
  "Mutates the DOM to show state changes"
  (:require [jayq.core :as jq :refer [$]]
            [chessground.render :as render]
            [chessground.drag :as drag]
            [chessground.select :as select]
            [chessground.common :as common :refer [pp]]))

(defn- $square [$app key]
  ($ (str ".square[data-key=" key "]") $app))

(defn selected [$app selected]
  (jq/remove-class ($ :.square.selected $app) :selected)
  (when selected (jq/add-class ($square $app selected) :selected)))

(defn dests [$app dests]
  ; this is probably not the best approach, performance-wise.
  (doseq [square ($ :.square $app)]
    (if (common/set-contains? dests (.getAttribute square "data-key"))
      (-> square .-classList (.add "dest"))
      (-> square .-classList (.remove "dest")))))

(defn move [$app orig dest]
  (let [$orig ($square $app orig)
        $dest ($square $app dest)
        $piece ($ :.piece $orig)]
    (drag/unfuck (first $piece))
    (.remove ($ :.piece $dest))
    (.appendTo $piece $dest)))

(defn un-move [$app orig]
  (let [$orig ($square $app orig)
        piece (first ($ :.piece $orig))]
    (when piece (drag/unfuck piece))))

(defn square-interactions [$app state chans]
  (doseq [sq ($ :.square $app)]
    (drag/square sq chans)
    (select/square sq chans)))

(defn piece-interactions [$app state chans]
  (let [movable-color (-> state :movable :color)]
    (doseq [p ($ :.piece $app)
            :let [$p ($ p)
                  instance (jq/data $p :interact)
                  owner (if (jq/has-class $p :white) "white" "black")
                  draggable (or (= movable-color "both") (= movable-color owner))]]
      (if instance
        (when (not draggable) (drag/piece-off p))
        (when draggable (drag/piece-on p chans))))))

(defn board [$app state chans]
  (jq/replace-with ($ :.board $app) (render/board state))
  (square-interactions $app state chans)
  (piece-interactions $app state chans))

(defn app [$app state chans]
  (jq/html $app (render/app state))
  (square-interactions $app state chans)
  (piece-interactions $app state chans))
