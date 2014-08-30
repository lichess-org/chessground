(ns chessground.select
  "Make squares selectable"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]
            [cljs.core.async :as a]))

(defn handler [el chan]
  (doseq [ev ["touchstart" "mousedown"]]
    (.addEventListener
      el ev (fn [e]
              (.preventDefault e)
              (a/put! chan [:select-square (common/square-key (.-target e))])))))
