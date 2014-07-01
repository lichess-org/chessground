(ns chessground
  (:require [cljs.core.async :as a]
            [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.api :as api]
            [chessground.show :as show]
            [chessground.ctrl :as ctrl])
  (:require-macros [cljs.core.async.macros :as am]))

(extend-type js/NodeList ISeqable (-seq [array] (array-seq array 0)))

(defn load-app
  "Return a map containing the initial application"
  [element config]
  {:element element
   :state (atom (data/make config))
   :channels {:toggle-orientation (a/chan)
              :set-orientation (a/chan)
              :set-fen (a/chan)
              :set-dests (a/chan)
              :set-color (a/chan)
              :clear (a/chan)
              :select-square (a/chan)
              :move-start (a/chan)
              :drag-start (a/chan)
              :move-piece (a/chan)
              :set-pieces (a/chan)
              :drop-off (a/chan)
              :api-move (a/chan)
              }
   :consumers {:toggle-orientation ctrl/toggle-orientation
               :set-orientation ctrl/set-orientation
               :set-fen ctrl/set-fen
               :set-dests ctrl/set-dests
               :set-color ctrl/set-color
               :clear ctrl/clear
               :select-square ctrl/select-square
               :move-start ctrl/move-start
               :drag-start ctrl/drag-start
               :move-piece ctrl/move-piece
               :set-pieces ctrl/set-pieces
               :drop-off ctrl/drop-off
               :api-move ctrl/api-move
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
                   _ (common/pp (str "on channel [" ch "], received value [" val "]"))
                   [new-state mutate-dom] (update-fn @(:state app) val)]
               (reset! (:state app) new-state)
               (mutate-dom (:element app) (:channels app)))))))

(defn ^:export main
  "Application entry point; returns the public JavaScript API"
  [element config]
  (let [app (load-app element (or (js->clj config) {}))]
    (show/app (:element app) @(:state app) (:channels app))
    (init-updates app)
    (api/build (:channels app) (:state app) (:element app))))
