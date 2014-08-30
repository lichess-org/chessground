(ns chessground.drag
  "Make pieces draggable, and squares droppable"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.klass :as klass]
            [chessground.dom-data :as dom-data]
            [chessground.chess :as chess]
            [cljs.core.async :as a]))

(def dragging-div-pos
  (atom {}))

(.addEventListener js/document "DOMContentLoaded"
                   (fn []
                     (let [div (.createElement js/document "div")]
                       (set! (.-id div) "chessground-moving-square")
                       (.appendChild (.-body js/document) div))))

; from interact.js
(def get-scroll-xy
  {:x (or js/scrollX (-> js/document .-documentElement .-scrollLeft))
   :y (or js/scrollY (-> js/document .-documentElement .-scrollTop))})

(def iStuffRe (js/RegExp. (.-source "ipad|iphone|ipod") "i"))

(def scroll (if (.test iStuffRe (.-userAgent js/navigator))
              {:x 0 :y 0}
              get-scroll-xy))

; from interact.js with some differences
(defn get-element-rect [element]
  (let [rect (.getBoundingClientRect element)]
    {:left (+ (.-left rect) (:x scroll))
     :right (+ (.-right rect) (:x scroll))
     :top (+ (.-top rect) (:y scroll))
     :bottom (+ (.-bottom rect) (:y scroll))
     :width (or (.-width rect) (- (.-right rect) (.-left rect)))
     :height (or (.-height rect) (- (.-bottom rect) (.-top rect)))}))

(defn on-start [event chan center-piece]
  "Shift piece right under the cursor"
  (let [piece (.-target event)]
    (when-let [key (common/square-key piece)]
      (-> piece .-classList (.add klass/dragging))
      (when center-piece
        (let [pos (common/offset piece)
              center-x (+ (:left pos) (/ (.-offsetWidth piece) 2))
              center-y (+ (:top pos) (/ (.-offsetHeight piece) 2))
              decay-x (- (.-pageX event) center-x)
              decay-y (- (.-pageY event) center-y)]
          (set! (.-x piece) decay-x)
          (set! (.-y piece) decay-y)))
      (a/put! chan [:drag-start key]))))

(defn on-move [event]
  (let [piece (.-target event)
        x (+ (or (.-x piece) 0) (.-dx event))
        y (+ (or (.-y piece) 0) (.-dy event))
        transform (str "translate3d(" x "px, " y "px, 0)")]
    (set! (.-x piece) x)
    (set! (.-y piece) y)
    (aset (.-style piece) common/transform-prop transform)))

(defn unfuck [piece]
  (set! (.-x piece) 0)
  (set! (.-y piece) 0)
  (aset (.-style piece) common/transform-prop ""))

(defn on-end [event chan]
  (let [piece (.-target event)
        orig (.-parentNode piece)
        dest (.-dropzone event)
        dragging-div (.getElementById js/document "chessground-moving-square")]
    (.setTimeout js/window #(unfuck piece) 10)
    (set! (-> dragging-div .-style .-display) "none")
    (when dest (-> dest .-classList (.remove klass/drag-over)))
    (-> piece .-classList (.remove klass/dragging))
    (when-let [orig-key (common/square-key orig)]
      (if (and dest (= (common/square-board orig) (common/square-board dest)))
        (a/put! chan [:move-piece (map common/square-key [orig dest])])
        (a/put! chan [:drop-off orig-key])))))

(defn make-draggable [el chan center-piece]
  (dom-data/store el :interact (-> (js/interact el)
                                   (.draggable true)
                                   (.on "dragstart" #(on-start % chan center-piece))
                                   (.on "dragmove" on-move)
                                   (.on "dragend" #(on-end % chan)))))

(defn piece-on [el]
  (.set (dom-data/fetch el :interact) (js-obj "draggable" true)))

(defn piece-off [el]
  (.set (dom-data/fetch el :interact) (js-obj "draggable" false)))

(defn pieces [el chan app]
  (let [movable-color (-> app :movable :color)]
    (doseq [p (common/$$ (str "." klass/piece) el)
            :let [instance (dom-data/fetch p :interact)
                  owner (if (common/has-class p "white") "white" "black")
                  draggable (or (= movable-color "both") (= movable-color owner))]]
      (if instance
        ((if draggable piece-on piece-off) p app)
        (when draggable (make-draggable p chan (-> app :movable :drag-center)))))))

(defn on-click-dragenter [event]
  (-> event .-target .-classList (.add klass/drag-over)))

(defn on-click-dragleave [event]
  (-> event .-target .-classList (.remove klass/drag-over)))

(defn on-touch-dragenter [event]
  (let [rect (get-element-rect (.-target event))
        h (- (:height rect) 1)
        w (- (:width rect) 1)
        h2 (* h 2)
        w2 (* w 2)
        dragging-div (.getElementById js/document "chessground-moving-square")]
    (when (common/hidden? dragging-div)
      (set! (-> dragging-div .-style .-height) (str h2 "px"))
      (set! (-> dragging-div .-style .-width) (str w2 "px"))
      (set! (-> dragging-div .-style .-left) (str (- (:left rect) (/ w 2)) "px"))
      (set! (-> dragging-div .-style .-top) (str (- (:top rect) (/ h 2)) "px"))
      (set! (-> dragging-div .-style .-display) "block")
      (reset! dragging-div-pos rect))
    (let [pos @dragging-div-pos
          dx (- (:left rect) (:left pos))
          dy (- (:top rect) (:top pos))]
      (aset (.-style dragging-div)
            common/transform-prop (str "translate3d(" dx "px, " dy "px, 0)")))))

(defn on-touch-dragleave [] nil)

(defn square [el]
  (-> (js/interact el)
      (.dropzone true)
      (.on "dragenter" (if common/touch-device? on-touch-dragenter on-click-dragenter))
      (.on "dragleave" (if common/touch-device? on-touch-dragleave on-click-dragleave))))
