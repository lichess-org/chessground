(ns chessground
  (:require [cljs.core.async :as a]
            [chessground.common :as common :refer [pp]]
            [chessground.api :as api]
            [chessground.render :as render]
            [chessground.data :as data]
            [chessground.ctrl :as ctrl]
            [clojure.walk :refer [keywordize-keys]])
  (:require-macros [cljs.core.async.macros :as am]))

(defn load-app
  "Return a map containing the initial application"
  [dom-element config]
  {:dom-element dom-element
   :state (atom (data/make config))
   :render-pending? (atom false)
   :channels {:toggle-orientation (a/chan)
              :set-orientation (a/chan)
              :set-fen (a/chan)
              :clear (a/chan)
              :select-square (a/chan)
              :move-start (a/chan)
              :move-piece (a/chan)
              }
   :consumers {:toggle-orientation ctrl/toggle-orientation
               :set-orientation ctrl/set-orientation
               :set-fen ctrl/set-fen
               :clear ctrl/clear
               :select-square ctrl/select-square
               :move-start ctrl/move-start
               :move-piece ctrl/move-piece
               }
   })

(defn init-updates
  "For every entry in a map of channel identifiers to consumers,
   initiate a channel listener which will update the application state
   using the appropriate function whenever a value is recieved, as
   well as triggering a render."
  [app]
  (doseq [[ch update-fn] (:consumers app)]
    (am/go (while true
             (let [val (a/<! (get (:channels app) ch))
                   _ (pp (str "on channel [" ch "], received value [" val "]"))
                   new-state (swap! (:state app) update-fn val)
                   _ (pp new-state)]
               (render/request-render app))))))

(defn ^:export main
  "Application entry point; returns the public JavaScript API"
  [dom-element config]
  (let [app (load-app dom-element (or (keywordize-keys (js->clj config)) {}))]
    (when common/is-touch-device (.initializeTouchEvents js/React true))
    (init-updates app)
    (render/request-render app)
    (api/build (:channels app))))
