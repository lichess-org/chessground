(ns chessground.handler
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [chessground.ctrl :as ctrl]
            [cljs.core.async :as a]))

(defn- do-process [k msg]
  (case k
    :select-square #(ctrl/select-square % msg)
    :drop-off ctrl/drop-off
    :drop-on #(ctrl/drop-on % msg)
    :set-orientation #(data/set-orientation % msg)
    :toggle-orientation data/toggle-orientation
    :get-orientation #(a/put! msg (:orientation %))
    :get-position #(a/put! msg (chess/get-pieces (:chess %)))
    :get-state #(a/put! msg %)
    :get-current-premove #(a/put! msg (-> % :premovable :current))
    :set-fen #(assoc % :chess (chess/make (or msg "start")))
    :clear #(assoc % :chess chess/clear)
    :api-move (fn [app] (update-in app [:chess] #(chess/move-piece % msg)))
    :set-last-move (fn [app] (update-in app :chess #(chess/set-last-move % msg)))
    :set-check (fn [app] (update-in app [:chess] #(chess/set-check % msg)))
    :set-pieces (fn [app] (update-in app [:chess] #(chess/set-pieces % msg)))
    :set-dests #(data/set-dests % msg)
    :set-turn-color #(data/set-turn-color % msg)
    :set-movable-color #(data/set-movable-color % msg)
    :set-premovable #(data/set-premovable % msg)
    :play-premove data/play-premove))

(defn process
  "Return a function that transforms an app data"
  [k msg]
  (fn [app]
    (let [new-app ((do-process k msg) app)]
      (if (contains? new-app :chess) new-app app))))
