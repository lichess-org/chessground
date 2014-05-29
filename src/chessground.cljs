(ns chessground
  (:require [cljs.core.async :as a]
            [chessground.render :as render]
            [chessground.data :as data])
  (:require-macros [cljs.core.async.macros :as am]))

(defn load-app
  "Return a map containing the initial application"
  []
  {:state (atom (data/fresh))
   :channels {}
   :consumers {}})

(defn init-updates
  "For every entry in a map of channel identifiers to consumers,
  initiate a channel listener which will update the application state
  using the appropriate function whenever a value is recieved, as
  well as triggering a render."
  [app]
  (doseq [[ch update-fn] (:consumers app)]
    (am/go (while true
             (let [val (a/<! (get (:channels app) ch))
                   _ (.log js/console (str "on channel [" ch "], recieved value [" val "]"))
                   new-state (swap! (:state app) update-fn val)]
               (render/request-render app))))))

(defn ^:export main
  "Application entry point"
  []
  (let [app (load-app)]
    (init-updates app)
    (render/request-render app)))
