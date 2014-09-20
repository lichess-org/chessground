(ns chessground.animation
  (:require [chessground.common :as common :refer [pp]]))

(defn- key->vector [key size]
  (let [pos (common/key->pos key)]
    [(* (aget pos 0) size -1) (* (aget pos 1) size)]))

(defn- square-vect [el plan]
  (let [size (.-clientWidth el)
        white (= (.-orientation plan) "white")
        orig-vec (key->vector (if white (.-orig plan) (.-dest plan)) size)
        dest-vec (key->vector (if white (.-dest plan) (.-orig plan)) size)]
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
            (when (.isMounted component)
              (.setState component #js {:anim delta2}
                         #(animate component start-at duration delta)))))))))

(defn start [component]
  (when-let [plan (.. component -state -plan)]
    (.setState component #js {:plan false})
    (let [square-el (.. component getDOMNode -parentNode)
          vect (square-vect square-el plan)]
      (animate component
               (.getTime (js/Date.))
               (.-duration plan)
               vect))))

(defn- make-piece [k piece invert?]
  (let [key (if invert? (common/invert-key k) k)]
    #js {:key key
         :pos (common/key->pos key)
         :role (.-role piece)
         :color (.-color piece)}))
(defn- same-piece [p1 p2] (and (== (.-role p1) (.-role p2)) (== (.-color p1) (.-color p2))))
(defn distance [p1 p2]
  (js/Math.sqrt (+ (js/Math.pow (- (aget (.-pos p1) 0) (aget (.-pos p2) 0)) 2)
                   (js/Math.pow (- (aget (.-pos p1) 1) (aget (.-pos p2) 1)) 2))))
(defn- closer [p ps]
  (.sort ps #(- (distance p %1) (distance p %2)))
  (aget ps 0))

(defn compute [prev current]
  (if (.. current -animation -enabled)
    (let [anims #js {}
          missings #js []
          news #js []
          invert? (not= (.-orientation prev) (.-orientation current))
          pre-pieces #js {}]
      (.forEach (.-chess prev) (fn [square]
                                 (when-let [p (.-piece square)]
                                   (let [piece (make-piece (.-key square) p invert?)]
                                     (aset pre-pieces (.-key piece) piece)))))
      (.forEach (.-chess current) (fn [square]
                                    (let [key (.-key square)
                                          pre-p (aget pre-pieces key)
                                          cur-p (.-piece square)]
                                      (when-not (== key (.. current -animation -exclude))
                                        (if cur-p
                                          (if pre-p
                                            (when-not (same-piece cur-p pre-p)
                                              (.push missings pre-p)
                                              (.push news (make-piece key cur-p false)))
                                            (.push news (make-piece key cur-p false)))
                                          (when pre-p (.push missings pre-p)))))))
      (.forEach news (fn [new-p]
                       (when-let [pre-p (closer new-p (.filter missings #(same-piece new-p %)))]
                         (aset anims (.-key new-p) #js {:orig (.-key pre-p)
                                                        :dest (.-key new-p)
                                                        :orientation (.-orientation current)
                                                        :duration (.. current -animation -duration)}))))
      anims)
    #js {}))
