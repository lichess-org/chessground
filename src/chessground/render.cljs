(ns chessground.render
  "React components declarations, i.e. HTML templating + behavior"
  (:require [chessground.common :as common :refer [pp push! push-args!]]
            [chessground.chess :as chess]
            [chessground.drag :as drag]
            [cljs.core.async :as a]
            [quiescent :as q :include-macros true]
            [quiescent.dom :as d]))

(defn- class-name
  "Convenience function for creating class names from sets. Nils will not be included."
  [classes] (apply str (interpose " " (map identity classes))))

(q/defcomponent Piece
  "A piece in a square"
  [[{color :color role :role} targets] channels]
  (let [piece (d/div {:className (class-name #{"piece" (name color) (name role)})})]
    (if targets (drag/make channels piece targets) piece)))

(q/defcomponent Square
  "One of the 64 board squares"
  [state key channels]
  (let [attributes {:className (class-name #{"square"
                                             (when (= (:selected state) key) "selected")})
                    :key (name key) ; react.js key just in case it helps performance
                    :data-key (name key)}
        targets (if (-> state :movable :free) :all (-> state :movable :valid key))
        behaviors (when targets {:onClick #(push! (:select-square channels) key)
                                 :onTouchStart (fn [event]
                                                 (.preventDefault event)
                                                 (push! (:select-square channels) key))})]
    (d/div (merge attributes behaviors)
           (when-let [piece (chess/get-piece (:chess state) key)]
             (Piece [piece targets] channels)))))

(q/defcomponent Board
  "The whole board"
  [state channels]
  (let [white (= (:orientation state) :white)
        squares (for [rank (if white (range 8 0 -1) (range 1 9))
                      file (seq (if white "abcdefgh" "hgfedcba"))]
                  (Square state (keyword (str file rank)) channels))]
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
    (.requestAnimationFrame
      js/window
      #(q/render (App @(:state app) (:channels app)) (:dom-element app))
      (reset! (:render-pending? app) false))))
