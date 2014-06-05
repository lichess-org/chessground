(ns chessground.render
  "React components declarations, i.e. HTML templating + behavior"
  (:require [chessground.common :as common :refer [pp push!]]
            [chessground.chess :as chess]
            [chessground.data :as data]
            [chessground.drag :as drag]
            [cljs.core.async :as a]
            [quiescent :as q :include-macros true]
            [quiescent.dom :as d]))

(defn- class-name
  "Convenience function for creating class names from sets. Nils will not be included."
  [classes] (apply str (interpose " " (map identity classes))))

(q/defcomponent Piece
  "A piece in a square"
  [[{color :color role :role} key is-movable] channels]
  (let [piece (d/div {:className (class-name #{"piece" (name color) (name role)})})]
    (if is-movable (drag/make channels key piece) piece)))

(q/defcomponent Square
  "One of the 64 board squares"
  [{is-selected :is-selected is-movable :is-movable is-dest :is-dest piece :piece} key channels]
  (let [classes #{"square"
                  (when is-selected "selected")
                  (when is-dest "dest")}
        attributes {:className (class-name classes)
                    :key (name key) ; react.js key just in case it helps performance
                    :data-key (name key)}
        behaviors {:onMouseDown #(push! (:select-square channels) key)
                   :onTouchStart (fn [event]
                                   (.preventDefault event)
                                   (push! (:select-square channels) key))}]
    (d/div (merge attributes behaviors)
           (when piece (Piece [piece key is-movable] channels)))))

(q/defcomponent Board
  "The whole board"
  [state channels]
  (let [white (= (:orientation state) :white)
        movable (:movable state)
        c (:chess state)
        selected (:selected state)
        dests (-> state :movable :dests)
        squares (for [rank (if white (range 8 0 -1) (range 1 9))
                      file (seq (if white "abcdefgh" "hgfedcba"))
                      :let [key (keyword (str file rank))]]
                  (Square {:is-selected (= selected key)
                           :piece (chess/get-piece c key)
                           :is-movable (data/is-movable? state key)
                           :is-dest (when selected
                                      (or (:free movable)
                                          (contains? (-> movable :dests selected) key)))}
                          key channels))]
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
