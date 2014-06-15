(ns chessground.show
  "Mutates the DOM to show state changes"
  (:require [jayq.core :as jq :refer [$]]
            [chessground.render :as render]
            [chessground.drag :as drag]
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

(defn board [$app state]
  (jq/replace-with ($ :.board $app) (render/board state)))
