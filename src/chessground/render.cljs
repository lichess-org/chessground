(ns chessground.render
  "React components declarations, i.e. HTML templating + behavior"
  (:require [chessground.common :refer [pp push! push-args!]]
            [chessground.chess :as chess]
            [cljs.core.async :as a]
            [quiescent :as q :include-macros true]
            [quiescent.dom :as d]))

(defn- class-name
  "Convenience function for creating class names from sets. Nils will not be included."
  [classes] (apply str (interpose " " (map identity classes))))

(defn- draggable [channels component]
  (q/wrapper component
             :onMount (fn [node]
                        (let [draggie (new js/Draggabilly node)]
                          (.on draggie "dragStart" (push-args! (:drag-start channels)))
                          ; (.on draggie "dragMove" (push-args! (:drag-move channels)))
                          (.on draggie "dragEnd" (push-args! (:drag-end channels)))))))

(q/defcomponent Piece
  "A piece in a square"
  [{color :color role :role} channels]
  (draggable channels
             (d/div {:className (class-name #{"piece" (name color) (name role)})})))

(q/defcomponent Square
  "One of the 64 board squares"
  [state key channels]
  (d/div {:className (class-name #{"square"
                                   (when (= (:selected state) key) "selected")
                                   (when (= (:drag-over state) key) "drag-over")})
          :key (name key) ; react.js key just in case it helps performance
          :data-key (name key)
          :onClick #(push! (:select-square channels) key)}
         (when-let [piece (chess/get-piece (:chess state) key)]
           (Piece piece channels))))

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
