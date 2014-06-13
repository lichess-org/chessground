(ns chessground
  (:require [cljs.core.async :as a]
            [clojure.walk :refer [keywordize-keys]]
            [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.render :refer [render-app]]
            [chessground.drag :as drag])
  (:require-macros [cljs.core.async.macros :as am]))

(defn load-app
  "Return a map containing the initial application"
  [dom-element config]
  {:dom-element dom-element
   :state (atom (data/make config))
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
  (let [app (load-app dom-element (or (keywordize-keys (js->clj config)) {}))
        $app ($ dom-element)]
    (jq/html $app (render-app @(:state app)))
    (doseq [$piece ($ :.piece $app)] (drag/piece $piece))
    (doseq [$square ($ :.square $app)] (drag/square $square))))
