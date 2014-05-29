(ns chessground.render
  "React components declarations, i.e. HTML templating + behavior"
  (:require [chessground.common :refer [pp push!]]
            [chessground.chess :as chess]
            [cljs.core.async :as a]
            [quiescent :as q :include-macros true]
            [quiescent.dom :as d])
  (:require-macros [cljs.core.async.macros :as am]))

(defn class-name
  "Convenience function for creating class names from sets.
   Nils will not be included."
  [classes]
  (apply str (interpose " " (map identity classes))))

(q/defcomponent Piece
  "A piece in a square"
  [{color :color role :role}]
  (pp [color role])
  (d/div {:className (class-name #{"piece" (name color) (name role)})}))

(q/defcomponent Square
  "One of the 64 board squares"
  [state channels key]
  (d/div {:className (class-name #{"square"
                                    (when (= (:selected state) key) "selected")})
          :data-key key
          :onClick #(push! (:select-square channels) key)}
         (when-let [piece (chess/get-piece (:chess state) key)] (Piece piece))))

(q/defcomponent Board
  "The whole board"
  [state channels]
  (let [white (= (:orientation state) :white)
        squares (for [rank (if white (range 8 0 -1) (range 1 9))
                      file (seq (if white "abcdefgh" "hgfedcba"))]
                  (Square state channels (str file rank)))]
    (apply d/div {:className "board"} squares)))

(q/defcomponent App
  "The root of the application"
  [state channels]
  (Board state channels))

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
