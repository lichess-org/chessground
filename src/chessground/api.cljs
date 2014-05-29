(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :refer [pp]]
            [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(defn build
  "Creates JavaScript functions that push to the channels"
  [channels]
  (clj->js
    (letfn [(push [ch val] (am/go (a/>! (get channels ch) val)))]
      {"toggleOrientation" (fn [] (push :toggle-orientation true))
       "setOrientation" (fn [o] (push :set-orientation o))})))
