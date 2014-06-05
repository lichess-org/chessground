(ns chessground.drag
  "Contains functions for drag and drop of pieces"
  (:require [quiescent :as q :include-macros true]
            [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp square-key push!]]))

(def over-class "drag-over")

(defn- get-target [pointer]
  (if common/is-touch-device
    (.elementFromPoint js/document (.-pageX pointer) (.-pageY pointer))
    (.-target pointer)))

(defn- highlight-square [$el]
  "Add the over-class to the $el square, and remove it on others"
  (when (not (jq/has-class $el over-class))
    (jq/remove-class (jq/siblings $el) over-class)
    (jq/add-class $el over-class)))

(defn- center-piece [pointer]
  "Shift piece right under the cursor"
  (when (not common/is-touch-device)
    (let [$el ($ (get-target pointer))
          pos (.offset $el)
          center-x (+ (.-left pos) (/ (.width $el) 2))
          center-y (+ (.-top pos) (/ (.height $el) 2))
          decay-x (- (.-pageX pointer) center-x)
          decay-y (- (.-pageY pointer) center-y)]
      (jq/css $el {:left (str decay-x "px") :top (str decay-y "px")})
      )))

(defn- on-move [_ _ pointer]
  "Highlight the square under the dragged piece"
  (let [$el ($ (common/square-element (get-target pointer)))]
    (highlight-square $el)))

(defn- undo-damages [draggie _ _]
  "Revert DOM and style modifications done by the drag"
  (let [$draggie ($ (.-element draggie))]
    (jq/css $draggie {:top 0 :left 0})
    (jq/remove-class (jq/siblings (jq/parent $draggie)) over-class)))

(defn- orig-dest [[draggie _ pointer]]
  "Return the origin and destination of the drag"
  (when-let [orig (square-key (.-element draggie))]
    (when-let [dest-element (common/square-element (get-target pointer))]
      (when-let [dest (square-key dest-element)]
        [orig dest]))))

(defn make [channels key piece]
  "Make a react piece draggable. 'targets' is a list of keys OR the keyword :all"
  (q/wrapper
    piece
    :onMount (fn [node]
               (-> (new js/Draggabilly node)
                   (.on "dragStart" (fn [_ _ pointer] (center-piece pointer)))
                   (.on "dragStart" #(push! (:move-start channels) key))
                   (.on "dragStart" (highlight-square (jq/parent ($ (get-target pointer)))))
                   (.on "dragMove" on-move)
                   (.on "dragEnd" undo-damages)
                   (.on "dragEnd" (fn [& args] 
                                    (let [traj (orig-dest args)]
                                      (when (not= (first traj) (second traj))
                                        (push! (:move-piece channels) (orig-dest args))))))))))
