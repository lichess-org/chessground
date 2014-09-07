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
        (-> app
            (data/set-current-premove [orig dest])
            (data/set-selected nil)))
      (if (= orig dest)
        app
        (data/set-selected app (when (or (data/movable? app dest)
                                         (data/premovable? app dest))
                                 dest)))))

(defn select-square [app key]
  (if-let [orig (:selected app)]
    (if (= orig key)
      app
      (move-piece app [orig key]))
    (let [app2 (data/set-current-premove app nil)]
      (if (or (data/movable? app2 key) (data/premovable? app2 key))
        (data/set-selected app2 key)
        app2))))

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
