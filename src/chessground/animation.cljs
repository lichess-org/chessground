(ns chessground.animation
  (:require [chessground.common :as common :refer [pp]]))

(defn- key->vector [key size]
  (let [[x y] (common/key->pos key)]
    [(* x size -1) (* y size)]))

(defn- square-vect [el orig dest]
  (let [size (.-clientWidth el)
        orig-vec (key->vector orig size)
        dest-vec (key->vector dest size)]
    #js {:x (- (first dest-vec) (first orig-vec))
         :y (- (second dest-vec) (second orig-vec))}))

(defn- animate [component start-at duration delta]
  (js/requestAnimationFrame
    (fn []
      (let [progress (/ (- (.getTime (js/Date.)) start-at) duration)]
        (if (>= progress 1)
          (.setState component #js {:anim false})
          (let [x (* (.-x delta) (- 1 progress))
                y (* (.-y delta) (- 1 progress))
                delta2 #js {:x x :y y}]
            (.setState component #js {:anim delta2}
                       #(animate component start-at duration delta))))))))

(defn piece [component]
  (when-let [anim (.. component -state -anim -scheduled)]
    (.setState component #js {:anim #js {:scheduled false}})
    (let [piece-el (.getDOMNode component)
          square-el (.-parentNode piece-el)
          vect (square-vect square-el (.-orig anim) (.-dest anim))]
      (animate component
               (.getTime (js/Date.))
               500;(.-duration anim)
               vect))))

(defn- make-piece [key piece] #js {:key key
                                   :pos (common/key->pos key)
                                   :role (.-role piece)
                                   :color (.-color piece)})
(defn- same-piece [p1 p2] (and (== (.-role p1) (.-role p2)) (== (.-color p1) (.-color p2))))
(defn distance [p1 p2]
  (js/Math.sqrt (+ (js/Math.pow (- (aget (.-pos p1) 0) (aget (.-pos p2) 0)) 2)
                   (js/Math.pow (- (aget (.-pos p1) 1) (aget (.-pos p2) 1)) 2))))
(defn- closer [p ps]
  (.sort ps #(- (distance p %1) (distance p %2)))
  (aget ps 0))

(defn compute [prev current]
  (let [anims #js {}
        missings #js []
        news #js []
        pre-pieces #js {}]
    (.forEach prev (fn [square]
                     (when-let [piece (.-piece square)]
                       (aset pre-pieces (.-key square) (make-piece (.-key square) piece)))))
    (.forEach current (fn [square]
                        (let [key (.-key square)
                              pre-p (aget pre-pieces key)
                              cur-p (.-piece square)]
                          (if cur-p
                            (if pre-p
                              (when-not (same-piece cur-p pre-p)
                                (.push missings pre-p)
                                (.push news (make-piece key cur-p)))
                              (.push news (make-piece key cur-p)))
                            (when pre-p (.push missings pre-p))))))
    (.forEach news (fn [new-p]
                     (when-let [pre-p (closer new-p (.filter missings #(same-piece new-p %)))]
                       (aset anims (.-key new-p) #js {:orig (.-key pre-p)
                                                      :dest (.-key new-p)}))))
    anims))
