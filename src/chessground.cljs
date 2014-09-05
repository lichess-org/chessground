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
        ui-chan (a/chan)
        app-atom (atom (merge (data/make (or (js->clj config {:keywordize-keys true}) {}))
                              {:chan ui-chan}))
        render (fn [props]
                 (js/window.requestAnimationFrame
                   #(.renderComponent js/React (ui/board-component (clj->js props)) element)))]
    (render @app-atom)
    (ctrl/handler ui-chan app-atom render)
    (am/go-loop []
                (a/<! (a/timeout 1))
                (a/>! ui-chan [:select-square (str (get "abcdefgh" (rand-int 8)) 2)])
                (recur))
    (api/build api-chan)))
