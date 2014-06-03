(ns chessground.drag
  "Contains functions for drag and drop of pieces"
  (:require [quiescent :as q :include-macros true]
            [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp square-key push!]]))

(def over-class "drag-over")

(defn get-target [pointer]
  (if common/is-touch-device
    (.elementFromPoint js/document (.-pageX pointer) (.-pageY pointer))
    (.-target pointer)))

(defn- highlight-square [$el]
  (when (not (jq/has-class $el over-class))
    (jq/remove-class (jq/siblings $el) over-class)
    (jq/add-class $el over-class)))

(defn- on-start [_ _ pointer]
  "Shift piece right under the cursor"
  (when (not common/is-touch-device)
    (let [$el ($ (get-target pointer))
          pos (.offset $el)
          center-x (+ (.-left pos) (/ (.width $el) 2))
          center-y (+ (.-top pos) (/ (.height $el) 2))
          decay-x (- (.-pageX pointer) center-x)
          decay-y (- (.-pageY pointer) center-y)]
      (jq/css $el {:left (str decay-x "px") :top (str decay-y "px")})
      (highlight-square (jq/parent $el)))))

(defn- on-move [targets [_ _ pointer]]
  "Highlight the square under the dragged piece"
  (let [$el ($ (common/square-element (get-target pointer)))]
    (highlight-square $el)))

(defn- on-end [draggie _ _]
  (jq/remove-class (jq/siblings (jq/parent ($ (.-element draggie)))) over-class))

(defn make [channels piece targets]
  "Make a react piece draggable
   targets is a list of keys OR the keyword :all"
  (q/wrapper piece
             :onMount (fn [node]
                        (-> (new js/Draggabilly node)
                            (.on "dragStart" on-start)
                            (.on "dragStart" (fn [& args] (push! (:drag-start channels) args)))
                            (.on "dragMove" (fn [& args] (on-move targets args)))
                            (.on "dragEnd" on-end)
                            (.on "dragEnd" (fn [& args] (push! (:drag-end channels) args)))))))

(defn end [[draggie _ pointer]]
  "Undo damages done by dragging and return origin and destination square keys"
  (jq/css ($ (.-element draggie)) {:top 0 :left 0})
  (when-let [orig (square-key (.-element draggie))]
    (when-let [dest-element (common/square-element (get-target pointer))]
      (when-let [dest (square-key dest-element)]
        [orig dest]))))
