(ns chessground.ctrl
  "Changes to state from UI"
  (:require [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]))

(defn move-piece [orig-el dest-el]
  (let [orig (.getAttribute orig-el "data-key")
        dest (.getAttribute dest-el "data-key")
        piece-el (.-firstChild orig-el)]
    (when (not= orig dest)
      (.appendChild dest-el piece-el))))
