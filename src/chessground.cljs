(ns chessground
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom :include-macros true]
            [cljs.core.async :as a]
            [chessground.api :as api]
            [chessground.ui :as ui]
            [chessground.data :as data]
            [chessground.common :refer [pp]]))

(extend-type js/NodeList ISeqable (-seq [array] (array-seq array 0)))

(defn ^:export main
  "Application entry point; returns the public JavaScript API"
  [element config]
  (let [api-chan (a/chan)]
    (om/root
      ui/board-view
      (atom (data/make (or (js->clj config {:keywordize-keys true}) {})))
      {:target element
       :shared {:api-chan api-chan
                :ctrl-chan (a/chan)}})
    (api/build api-chan)))
