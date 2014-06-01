(ns chessground.drag
  "Contains functions for drag and drop of pieces"
  (:require [quiescent :as q :include-macros true]
            [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp square-key push-args!]]))

(def over-class "drag-over")

(defn get-target [pointer]
  (if (common/is-touch-device)
    (.elementFromPoint js/document (.-pageX pointer) (.-pageY pointer))
    (.-target pointer)))

(defn- on-start [_ _ pointer]
  "Shift piece right under the cursor"
  (let [$el ($ (get-target pointer))
        pos (.offset $el)
        center-x (+ (.-left pos) (/ (.width $el) 2))
        center-y (+ (.-top pos) (/ (.height $el) 2))
        decay-x (- (.-pageX pointer) center-x)
        decay-y (- (.-pageY pointer) center-y)]
    (jq/css $el {:left (str decay-x "px") :top (str decay-y "px")})))

(defn- on-move [_ _ pointer]
  "Highlight the square under the dragged piece"
  (let [$el ($ (common/square-element (get-target pointer)))]
    (when (not (jq/has-class $el over-class))
      (jq/remove-class (jq/siblings $el) over-class)
      (jq/add-class $el over-class))))

(defn make [channels component]
  "Make a react component draggable"
  (q/wrapper component
             :onMount (fn [node]
                        (-> (new js/Draggabilly node)
                            ; (.on "dragStart" on-start)
                            (.on "dragStart" (push-args! (:drag-start channels)))
                            (.on "dragMove" on-move)
                            (.on "dragEnd" (push-args! (:drag-end channels)))))))

(defn end [[draggie _ pointer]]
  "Undo damages done by dragging and return origin and destination square keys"
  (jq/css ($ (.-element draggie)) {:top 0 :left 0})
  (when-let [orig (square-key (.-element draggie))]
    (when-let [dest-element (common/square-element (get-target pointer))]
      (jq/remove-class ($ dest-element) over-class)
      (when-let [dest (square-key dest-element)]
        [orig dest]))))
