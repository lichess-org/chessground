(ns chessground
  (:require [cljs.core.async :as a]
            [clojure.walk :refer [keywordize-keys]]
            [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.render :refer [render-app]]
            [chessground.ctrl :as ctrl]
            [chessground.drag :as drag]
            [chessground.select :as select])
  (:require-macros [cljs.core.async.macros :as am]))

(defn load-app
  "Return a map containing the initial application"
  [element config]
  {:element element
   :$element ($ element)
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
   :consumers {:toggle-orientation ctrl/toggle-orientation
               :set-orientation ctrl/set-orientation
               :set-fen ctrl/set-fen
               :set-dests ctrl/set-dests
               :set-color ctrl/set-color
               :clear ctrl/clear
               :select-square ctrl/select-square
               :move-start ctrl/move-start
               :move-piece ctrl/move-piece
               }
   })

(defn init-updates
  "For every entry in a map of channel identifiers to consumers,
   initiate a channel listener which will update the application state
   using the appropriate function whenever a value is received"
  [app]
  (doseq [[ch update-fn] (:consumers app)]
    (am/go (while true
             (let [val (a/<! (get (:channels app) ch))
               _ (pp (str "on channel [" ch "], received value [" val "]"))
               [new-state mutate-dom] (update-fn @(:state app) val)]
               (reset! (:state app) new-state)
               (mutate-dom (:$element app) (:channels app)))))))

(defn ^:export main
  "Application entry point; returns the public JavaScript API"
  [element config]
  (let [app (load-app element (or (keywordize-keys (js->clj config)) {}))
        $app ($ element)]
    (jq/html $app (render-app @(:state app)))
    (doseq [$piece ($ :.piece $app)] (drag/piece $piece (:channels app)))
    (doseq [$square ($ :.square $app)]
      (drag/square $square (:channels app))
      (select/square $square (:channels app)))
    (init-updates app)))
