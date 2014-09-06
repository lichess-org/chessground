(ns chessground
  (:require [cljs.core.async :as a]
            [chessground.api :as api]
            [chessground.ctrl :as ctrl]
            [chessground.ui :as ui]
            [chessground.data :as data]
            [chessground.common :refer [pp]])
  (:require-macros [cljs.core.async.macros :as am]))

(extend-type js/NodeList ISeqable (-seq [array] (array-seq array 0)))

(defn ^:export main
  "Application entry point; returns the public JavaScript API"
  [element config]
  (let [api-chan (a/chan)
        app-data (data/make (or (js->clj config {:keywordize-keys true}) {}))
        app-atom (atom app-data)
        handler (ctrl/handler app-atom)
        props (merge @app-atom {:ctrl handler})]
    (.renderComponent js/React (ui/board-component (clj->js props)) element)
    (api/build api-chan)))
