(ns chessground.drag
  "Make pieces draggable, and squares droppable"
  (:require [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]))

(def transform-prop "webkitTransform")

(defn on-move [event]
  (let [target (.-target event)
        x (+ (or (.-x target) 0) (.-dx event))
        y (+ (or (.-y target) 0) (.-dy event))
        transform (str "translate(" x "px, " y "px)")]
    (.add (.-classList target) "dragging")
    (set! (.-x target) x)
    (set! (.-y target) y)
    (set! (.-transform (.-style target)) transform)
    (aset (.-style target) transform-prop transform)))

(defn piece [el]
  (let [obj (js/interact el)
        $el ($ el)]
    (jq/data $el :interact obj)
    (.draggable obj (clj->js {:onmove on-move}))))
