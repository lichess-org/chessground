(ns chessground.animation
  (:require [chessground.common :as common :refer [pp]]))

(defn- key->vector [key size]
  (let [pos (common/key->pos key)]
    [(* (aget pos 0) size -1) (* (aget pos 1) size)]))

(defn- square-vect [el plan]
  (let [size (.-clientWidth el)
        white (= (aget plan "orientation") "white")
        orig-vec (key->vector (if white (aget plan "orig") (aget plan "dest")) size)
        dest-vec (key->vector (if white (aget plan "dest") (aget plan "orig")) size)]
    #js {:x (- (first dest-vec) (first orig-vec))
         :y (- (second dest-vec) (second orig-vec))}))

(defn- animate [component start-at duration delta]
  (js/requestAnimationFrame
    (fn []
      (let [progress (/ (- (.getTime (js/Date.)) start-at) duration)]
        (if (>= progress 1)
          (.setState component #js {:anim false})
          (let [x (* (aget delta "x") (- 1 progress))
                y (* (aget delta "y") (- 1 progress))
                delta2 #js {:x x :y y}]
            (when (.isMounted component)
              (.setState component #js {:anim delta2}
                         #(animate component start-at duration delta)))))))))

(defn start [component]
  (when-let [plan (-> component .-state (aget "plan"))]
    (.setState component #js {:plan false})
    (let [square-el (.. component getDOMNode -parentNode)
          vect (square-vect square-el plan)]
      (animate component
               (.getTime (js/Date.))
               (aget plan "duration")
               vect))))

(defn- make-piece [k piece invert?]
  (let [key (if invert? (common/invert-key k) k)]
    #js {:key key
         :pos (common/key->pos key)
         :role (aget piece "role")
         :color (aget piece "color")}))
(defn- same-piece [p1 p2] (and (== (aget p1 "role") (aget p2 "role")) (== (aget p1 "color") (aget p2 "color"))))
(defn distance [p1 p2]
  (js/Math.sqrt (+ (js/Math.pow (- (aget (aget p1 "pos") 0) (aget (aget p2 "pos") 0)) 2)
                   (js/Math.pow (- (aget (aget p1 "pos") 1) (aget (aget p2 "pos") 1)) 2))))
(defn- closer [p ps]
  (.sort ps #(- (distance p %1) (distance p %2)))
  (aget ps 0))

(defn compute [prev current]
  (if (-> current (aget "animation") (aget "enabled"))
    (let [anims #js {}
          missings #js []
          news #js []
          invert? (not= (aget prev "orientation") (aget current "orientation"))
          pre-pieces #js {}]
      (.forEach (aget prev "chess") (fn [square]
                                 (when-let [p (aget square "piece")]
                                   (let [piece (make-piece (aget square "key") p invert?)]
                                     (aset pre-pieces (aget piece "key") piece)))))
      (.forEach (aget current "chess") (fn [square]
                                    (let [key (aget square "key")
                                          pre-p (aget pre-pieces key)
                                          cur-p (aget square "piece")]
                                      (when-not (== key (-> current (aget "animation") (aget "exclude")))
                                        (if cur-p
                                          (if pre-p
                                            (when-not (same-piece cur-p pre-p)
                                              (.push missings pre-p)
                                              (.push news (make-piece key cur-p false)))
                                            (.push news (make-piece key cur-p false)))
                                          (when pre-p (.push missings pre-p)))))))
      (.forEach news (fn [new-p]
                       (when-let [pre-p (closer new-p (.filter missings #(same-piece new-p %)))]
                         (aset anims (aget new-p "key") #js {:orig (aget pre-p "key")
                                                        :dest (aget new-p "key")
                                                        :orientation (aget current "orientation")
                                                        :duration (-> current (aget "animation") (aget "duration"))}))))
      anims)
    #js {}))
