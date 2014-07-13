(ns chessground.drag
  "Make pieces draggable, and squares droppable"
  (:require [chessground.common :as common :refer [pp push!]]
            [chessground.dom-data :as dom-data]
            [chessground.chess :as chess]))

(def dragging-class "dragging")
(def drag-over-class "drag-over")

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
        dest (.-dropzone event)]
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

(defn square [el chans]
  (-> (js/interact el)
      (.dropzone true)
      (.on "dragenter" #(-> % .-target .-classList (.add drag-over-class)))
      (.on "dragleave" #(-> % .-target .-classList (.remove drag-over-class)))))

(defn unfuck [piece-el]
  (set! (.-x piece-el) 0)
  (set! (.-y piece-el) 0)
  (aset (.-style piece-el) common/transform-prop ""))
