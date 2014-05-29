(ns chessground
  (:require [cljs.core.async :as a]
            [chessground.common :refer [pp]]
            [chessground.api :as api]
            [chessground.render :as render]
            [chessground.data :as data])
  (:require-macros [cljs.core.async.macros :as am]))

(defn load-app
  "Return a map containing the initial application"
  [dom-element config]
  {:dom-element dom-element
   :state (atom (data/fresh config))
   :render-pending? (atom false)
   :channels {:toggle-orientation (a/chan)
              :set-orientation (a/chan)
              }
   :consumers {
               :toggle-orientation data/toggle-orientation
               :set-orientation data/set-orientation}
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
                   _ (.log js/console (str "on channel [" ch "], received value [" val "]"))
                   new-state (swap! (:state app) update-fn val)]
               (render/request-render app))))))

(defn ^:export main
  "Application entry point; returns the public JavaScript API"
  [dom-element config]
  (let [app (load-app dom-element (or config {}))]
    (init-updates app)
    (render/request-render app)
    (api/build (:channels app))))
