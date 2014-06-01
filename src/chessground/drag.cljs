(ns chessground.drag
  "Contains functions for drag and drop of pieces"
  (:require [quiescent :as q :include-macros true]
            [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp square-key push-args!]]))

(def over-class "drag-over")

(defn- highlight-square [$el]
  (when (not (jq/has-class $el over-class))
    (jq/remove-class (jq/siblings $el) over-class)
    (jq/add-class $el over-class)))

(defn- on-start [_ event _]
  "Shift piece right under the cursor"
  (let [$el ($ (.-target event))
        pos (.offset $el)
        center-x (+ (.-left pos) (/ (.width $el) 2))
        center-y (+ (.-top pos) (/ (.height $el) 2))
        decay-x (- (.-pageX event) center-x)
        decay-y (- (.-pageY event) center-y)]
    (jq/css $el {:left (str decay-x "px") :top (str decay-y "px")})
    (highlight-square (jq/parent $el))))

(defn- on-move [_ event _]
  "Highlight the square under the dragged piece"
  (let [$el ($ (common/square-element (.-target event)))]
    (highlight-square $el)))

(defn make [channels component]
  "Make a react component draggable"
  (q/wrapper component
             :onMount (fn [node]
                        (-> (new js/Draggabilly node)
                            (.on "dragStart" on-start)
                            (.on "dragStart" (push-args! (:drag-start channels)))
                            (.on "dragMove" on-move)
                            (.on "dragEnd" (push-args! (:drag-end channels)))))))

(defn end [[draggie event _]]
  "Undo damages done by dragging and return origin and destination square keys"
  (jq/css ($ (.-element draggie)) {:top 0 :left 0})
  (when-let [orig (square-key (.-element draggie))]
    (when-let [dest-element (common/square-element (.-target event))]
      (jq/remove-class ($ dest-element) over-class)
      (when-let [dest (square-key dest-element)]
        [orig dest]))))
