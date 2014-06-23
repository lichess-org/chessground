(ns chessground.drag
  "Make pieces draggable, and squares droppable"
  (:require [chessground.common :as common :refer [pp push!]]
            [chessground.dom-data :as dom-data]
            [chessground.chess :as chess]))

(def dragging-class "dragging")
(def drag-over-class "drag-over")

(defn on-start [event chans]
  (-> event .-target .-classList (.add dragging-class))
  (push! (:drag-start chans) (-> event .-target .-parentNode (.getAttribute "data-key"))))

(defn on-move [event]
  (let [target (.-target event)
        x (+ (or (.-x target) 0) (.-dx event))
        y (+ (or (.-y target) 0) (.-dy event))
        transform (str "translate(" x "px, " y "px)")]
    (set! (.-x target) x)
    (set! (.-y target) y)
    (aset (.-style target) common/transform-prop transform)))

(defn on-end [event chans]
  (-> event .-target .-classList (.remove dragging-class))
  (when (not (.-dropzone event))
    (push! (:drop-off chans) (-> event .-target .-parentNode (.getAttribute "data-key")))))

(defn make-draggable [el chans state]
  (dom-data/store el :interact (-> (js/interact el)
                                (.draggable true)
                                (.on "dragstart" #(on-start % chans))
                                (.on "dragmove" on-move)
                                (.on "dragend" #(on-end % chans)))))

(defn piece-on [el state]
  (.set (dom-data/fetch el :interact) (js-obj "draggable" true)))

(defn piece-off [el state]
  (.set (dom-data/fetch el :interact) (js-obj "draggable" false)))

(defn on-drop [event chans]
  (let [orig (-> event .-relatedTarget .-parentNode)
        dest (.-target event)]
    (push! (:move-piece chans) (map common/square-key [orig dest]))
    (.remove (.-classList dest) drag-over-class)))

(defn square [el chans]
  (-> (js/interact el)
      (.dropzone true)
      (.on "dragenter" #(-> % .-target .-classList (.add drag-over-class)))
      (.on "dragleave" #(-> % .-target .-classList (.remove drag-over-class)))
      (.on "drop" #(on-drop % chans))))

(defn unfuck [piece-el]
  (set! (.-x piece-el) 0)
  (set! (.-y piece-el) 0)
  (aset (.-style piece-el) common/transform-prop ""))
