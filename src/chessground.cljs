(ns chessground
  (:require [cljs.core.async :as a]
            [chessground.common :as common :refer [pp]]
            [chessground.api :as api]
            [chessground.render :as render]
            [chessground.data :as data]
            [chessground.ctrl :as ctrl]
            [clojure.walk :refer [keywordize-keys]])
  (:require-macros [cljs.core.async.macros :as am]))

(def state (atom nil))

(def consumers {:toggle-orientation ctrl/toggle-orientation
                :set-orientation ctrl/set-orientation
                :set-fen ctrl/set-fen
                :set-dests ctrl/set-dests
                :set-color ctrl/set-color
                :clear ctrl/clear
                :select-square ctrl/select-square
                :move-start ctrl/move-start
                :move-piece ctrl/move-piece})

(defn view-data [dom-element]
  {:dom-element dom-element
   :render-pending? (atom false)})


; (defn init-updates
;   "For every entry in a map of channel identifiers to consumers,
;    initiate a channel listener which will update the application state
;    using the appropriate function whenever a value is recieved, as
;    well as triggering a render."
;   [app]
;   (doseq [[ch update-fn] (:consumers app)]
;     (am/go (while true
;              (let [val (a/<! (get (:channels app) ch))
;                    _ (pp (str "on channel [" ch "], received value [" val "]"))
;                    new-state (swap! (:state app) update-fn val)]
;                (render/request-render app ))))))

(defn ^:export main
  "Application entry point; returns the public JavaScript API"
  [dom-element config]
  (let [view (view-data dom-element)
        action (fn [consumer-name arg]
                 (if-let [consumer (consumer-name consumers)]
                   (let [new-state (swap! state consumer arg)]
                     (render/request-render view new-state))))]
    (reset! state (data/make (or (keywordize-keys (js->clj config)) {})))
    (when common/is-touch-device (.initializeTouchEvents js/React true))
    ; (init-updates app)
    (render/request-render view state)
    (api/build consumers)))
