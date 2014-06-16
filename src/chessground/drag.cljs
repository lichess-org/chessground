(ns chessground.drag
  "Make pieces draggable, and squares droppable"
  (:require [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp push!]]
            [chessground.chess :as chess]))

(def dragging-class "dragging")
(def drag-over-class "drag-over")

(defn on-start [event chans]
  (-> event .-target .-classList (.add dragging-class))
  (push! (:move-start chans) (-> event .-target .-parentNode (.getAttribute "data-key"))))

(defn on-move [event]
  (let [target (.-target event)
        x (+ (or (.-x target) 0) (.-dx event))
        y (+ (or (.-y target) 0) (.-dy event))
        transform (str "translate(" x "px, " y "px)")]
    (set! (.-x target) x)
    (set! (.-y target) y)
    ; (set! (.-transform (.-style target)) transform)
    (aset (.-style target) common/transform-prop transform)))

(defn piece-on [el chans]
  (jq/data ($ el) :interact (-> (js/interact el)
                                (.draggable true)
                                (.on "dragstart" #(on-start % chans))
                                (.on "dragmove" on-move))))

(defn piece-off [el]
  (let [$el ($ el)]
    (.unset (jq/data $el :interact))
    (jq/remove-attr $el :data-interact)))

(defn square [el chans]
  (-> (js/interact el)
      (.dropzone true)
      (.on "dragenter" #(-> % .-target .-classList (.add drag-over-class)))
      (.on "dragleave" #(-> % .-target .-classList (.remove drag-over-class)))
      (.on "drop" (fn[event]
                    (let [piece (.-relatedTarget event)
                          orig (.-parentNode piece)
                          dest (.-target event)]
                      (push! (:move-piece chans) (map common/square-key [orig dest]))
                      (.remove (.-classList piece) dragging-class)
                      (.remove (.-classList dest) drag-over-class))))))

(defn unfuck [piece-el]
  (set! (.-x piece-el) 0)
  (set! (.-y piece-el) 0)
  ; (set! (.-transform (.-style piece-el)) "")
  (aset (.-style piece-el) common/transform-prop ""))
