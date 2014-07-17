(ns chessground.drag
  "Make pieces draggable, and squares droppable"
  (:require [chessground.common :as common :refer [pp push!]]
            [chessground.dom-data :as dom-data]
            [chessground.chess :as chess]))

(def dragging-class "dragging")
(def drag-over-class "drag-over")

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

(defn on-start [event chans center-piece]
  "Shift piece right under the cursor"
  (let [piece (.-target event)]
    (when-let [key (common/square-key piece)]
      (-> piece .-classList (.add dragging-class))
      (when center-piece
        (let [pos (common/offset piece)
              center-x (+ (:left pos) (/ (.-offsetWidth piece) 2))
              center-y (+ (:top pos) (/ (.-offsetHeight piece) 2))
              decay-x (- (.-pageX event) center-x)
              decay-y (- (.-pageY event) center-y)]
          (set! (.-x piece) decay-x)
          (set! (.-y piece) decay-y)))
      (push! (:drag-start chans) key))))

(defn on-move [event]
  (let [piece (.-target event)
        x (+ (or (.-x piece) 0) (.-dx event))
        y (+ (or (.-y piece) 0) (.-dy event))
        transform (str "translate3d(" x "px, " y "px, 0)")]
    (set! (.-x piece) x)
    (set! (.-y piece) y)
    (aset (.-style piece) common/transform-prop transform)))

(defn on-end [event chans]
  (let [piece (.-target event)
        orig (.-parentNode piece)
        dest (.-dropzone event)
        dragging-div (.getElementById js/document "chessground-moving-square")]
    (set! (-> dragging-div .-style .-display) "none")
    (when dest (-> dest .-classList (.remove drag-over-class)))
    (-> piece .-classList (.remove dragging-class))
    (when-let [orig-key (common/square-key orig)]
      (if (and dest (= (.-parentNode orig) (.-parentNode dest)))
        (push! (:move-piece chans) (map common/square-key [orig dest]))
        (push! (:drop-off chans) orig-key)))))

(defn make-draggable [el chans state]
  (dom-data/store el :interact (-> (js/interact el)
                                   (.draggable true)
                                   (.on "dragstart" #(on-start % chans (-> state :movable :drag-center)))
                                   (.on "dragmove" on-move)
                                   (.on "dragend" #(on-end % chans)))))

(defn piece-on [el state]
  (.set (dom-data/fetch el :interact) (js-obj "draggable" true)))

(defn piece-off [el state]
  (.set (dom-data/fetch el :interact) (js-obj "draggable" false)))

(defn on-click-dragenter [event]
  (-> event .-target .-classList (.add drag-over-class)))

(defn on-click-dragleave [event]
  (-> event .-target .-classList (.remove drag-over-class)))

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

(defn square [el chans]
  (-> (js/interact el)
      (.dropzone true)
      (.on "dragenter" (if common/touch-device? on-touch-dragenter on-click-dragenter))
      (.on "dragleave" (if common/touch-device? on-touch-dragleave on-click-dragleave))))

(defn unfuck [piece-el]
  (set! (.-x piece-el) 0)
  (set! (.-y piece-el) 0)
  (aset (.-style piece-el) common/transform-prop ""))
