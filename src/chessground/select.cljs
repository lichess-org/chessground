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
              (let [el (.-target e)
                    key (or (.getAttribute el "data-key")
                            (.getAttribute (.-parentNode el) "data-key"))]
                (a/put! chan [:select-square key]))))))
