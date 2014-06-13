(ns chessground
  (:require [cljs.core.async :as a]
            [chessground.common :as common :refer [pp]]
            [clojure.walk :refer [keywordize-keys]])
  (:require-macros [cljs.core.async.macros :as am]))

(defn load-app
  "Return a map containing the initial application"
  [dom-element config]
  {:dom-element dom-element
   :state (atom {})
   :render-pending? (atom false)
   :channels {:toggle-orientation (a/chan)
              :set-orientation (a/chan)
              :set-fen (a/chan)
              :set-dests (a/chan)
              :set-color (a/chan)
              :clear (a/chan)
              :select-square (a/chan)
              :move-start (a/chan)
              :move-piece (a/chan)
              }
   })

(defn ^:export main
  "Application entry point; returns the public JavaScript API"
  [dom-element config]
  (pp config))
