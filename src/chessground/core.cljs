(ns chessground.core
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom :include-macros true]
            [chessground.ui :as ui]
            [chessground.data :as data]
            [chessground.common :refer [pp]]))

(defn ^:export main
  "Application entry point; returns the public JavaScript API"
  [element config]
  (om/root
    ui/board-view
    (atom (pp (data/make {})))
    {:target element}))
