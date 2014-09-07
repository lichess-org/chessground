(ns chessground.ctrl
  "User actions"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]))

(defn- move-piece [app [orig dest]]
  "A move initiated through the UI"
  (or (when (data/can-move? app orig dest)
        (data/move-piece app orig dest))
      (when (data/can-premove? app orig dest)
        (data/set-current-premove app [orig dest]))
      (data/set-selected app (when (and (= orig dest)
                                        (or (data/movable? app dest)
                                            (data/premovable? app dest)))
                               orig))))

(defn select-square [app key]
  (or (if-let [orig (:selected app)]
        (when (not (= orig key))
          (move-piece app [orig key]))
        (when (or (data/movable? app key) (data/premovable? app key))
          (data/set-selected app key)))
      (data/set-current-premove app nil)))

(defn drop-off [app]
  (data/set-selected
    (or (when (= "trash" (-> app :movable :drop-off))
          (when-let [key (:selected app)]
            (update-in app [:chess] chess/set-pieces {key nil})))
        app)
    nil))

(defn drop-on [app dest]
  (if-let [orig (:selected app)]
    (move-piece app [orig dest])
    (drop-off app)))
