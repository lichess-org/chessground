(ns chessground
  (:require [cljs.core.async :as a]
            [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.api :as api]
            [chessground.show :as show]
            [chessground.ctrl :as ctrl]
            [chessground.schemas :refer [AnyMap]]
            [schema.core :as s]
            [cljs.core.async.impl.channels :refer [ManyToManyChannel]])
  (:require-macros [cljs.core.async.macros :as am]
                   [schema.macros :as sm :refer [defschema]]))

(extend-type js/NodeList ISeqable (-seq [array] (array-seq array 0)))

(defschema AppMap
  {:element   js/HTMLDivElement
   :state     Atom
   :channels  {s/Keyword ManyToManyChannel}
   :consumers {s/Keyword js/Function}})

(sm/defn load-app :- AppMap
  "Return a map containing the initial application"
  [element :- js/HTMLDivElement
   config :- js/Object]
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
              :show-moved (a/chan)}
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
               :show-moved ctrl/show-moved}}) 

(sm/defn init-updates
  "For every entry in a map of channel identifiers to consumers,
   initiate a channel listener which will update the application state
   using the appropriate function whenever a value is received"
  [app :- AppMap]
  (doseq [[ch update-fn] (:consumers app)]
    (am/go (while true
             (let [val (a/<! (get (:channels app) ch))
                   _ (pp (str "on channel [" ch "], received value [" val "]"))
                   [new-state mutate-dom] (update-fn @(:state app) val)]
               (reset! (:state app) new-state)
               (mutate-dom (:element app) (:channels app)))))))

(sm/defn ^:export main :- js/Object
  "Application entry point; returns the public JavaScript API"
  [element :- js/HTMLDivElement
   config :- AnyMap]
  (let [app (load-app element (js->clj (or config {})))]
    (show/app (:element app) @(:state app) (:channels app))
    (init-updates app)
    (api/build (:channels app) (:state app) (:element app))))
