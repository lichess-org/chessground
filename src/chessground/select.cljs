(ns chessground.select
  "Make squares selectable"
  (:require [chessground.common :as common :refer [pp push!]]
            [chessground.chess :as chess]))

(defn handler [event chans]
  (.preventDefault event)
  (push! (:select-square chans) (common/square-key (.-target event))))

(defn square [el chans]
  (doseq [event-name ["touchstart" "mousedown"]]
    (.addEventListener el event-name #(handler % chans))))
