(ns chessground.render
  (:require [chessground.common :refer [pp]]
            [cljs.core.async :as a]
            [quiescent :as q :include-macros true]
            [quiescent.dom :as d])
  (:require-macros [cljs.core.async.macros :as am]))

(q/defcomponent Square
  "One of the 64 board squares"
  [app file rank]
  (d/div {:className "square" :data-key (str file rank)}))

(q/defcomponent Board
  "The whole board"
  [app]
  (let [white (= (:orientation app) :white)
        squares (for [rank (if white (range 8 0 -1) (range 1 9))
                      file (seq (if white "abcdefgh" "hgfedcba"))]
                  (Square app file rank))]
    (apply d/div {:className "board"} squares)))

(q/defcomponent App
  "The root of the application"
  [app channels]
  (Board app))

;; Here we use an atom to tell us if we already have a render queued
;; up; if so, requesting another render is a no-op
(defn request-render
  "Render the given application state tree."
  [app]
  (when (compare-and-set! (:render-pending? app) false true)
    (.requestAnimationFrame js/window
                            (fn []
                              (q/render (App @(:state app) (:channels app))
                                        (:dom-element app))
                              (reset! (:render-pending? app) false)))))
