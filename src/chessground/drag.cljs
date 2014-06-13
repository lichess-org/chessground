(ns chessground.drag
  "Make pieces draggable, and squares droppable"
  (:require [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp]]
            [chessground.ctrl :as ctrl]
            [chessground.chess :as chess]))

(defn on-move [event]
  (let [target (.-target event)
        x (+ (or (.-x target) 0) (.-dx event))
        y (+ (or (.-y target) 0) (.-dy event))
        transform (str "translate(" x "px, " y "px)")]
    (.add (.-classList target) "dragging")
    (set! (.-x target) x)
    (set! (.-y target) y)
    (set! (.-transform (.-style target)) transform)
    (aset (.-style target) common/transform-prop transform)))

(defn piece [el]
  (let [obj (js/interact el)]
    (jq/data ($ el) :interact obj)
    (.draggable obj (clj->js {:onmove on-move}))))

(defn square [el]
  (let [obj (js/interact el)]
    (jq/data ($ el) :interact obj)
    (.dropzone obj true)
    (.on obj "dragenter"
         (clj->js (fn[event] (.add (.-classList (.-target event)) "drag-over"))))
    (.on obj "dragleave"
         (clj->js (fn[event]
                    (doseq [klass ["selected" "drag-over"]]
                      (.remove (.-classList (.-target event)) klass)))))
    (.on obj "drop"
         (clj->js (fn[event]
                    (let [piece (.-relatedTarget event)
                          orig (.-parentNode piece)
                          dest (.-target event)]
                      (.remove (.-classList piece) "dragging")
                      (.remove (.-classList dest) "drag-over")
                      (aset (.-style piece) common/transform-prop "")
                      (set! (.-x piece) 0)
                      (set! (.-y piece) 0)
                      (set! (.-transform (.-style piece)) "")
                      (ctrl/move-piece orig dest)))))))
