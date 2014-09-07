(ns chessground.ui
  (:require [cljs.core.async :as a]
            [chessground.common :as common :refer [pp]]
            [chessground.react :as react]
            [chessground.ctrl :as ctrl]
            [chessground.drag :as drag]
            [chessground.api :as api])
  (:require-macros [cljs.core.async.macros :as am]))

(defn- draggable? [piece]
  (boolean (or (aget piece "movable?") (aget piece "premovable?"))))

(defn- make-diff [name prev next]
  (fn [k]
    (not= (-> prev (aget name) (aget k))
          (-> next (aget name) (aget k)))))

(def piece-component
  (js/React.createClass
    #js
    {:displayName "Piece"
     :shouldComponentUpdate
     (fn [_ _] false)
     :componentDidMount
     (fn []
       (this-as this
                (.setState this #js {:draggable-instance (drag/piece
                                                           (.getDOMNode this)
                                                           (aget (.-props this) "ctrl")
                                                           (draggable? (aget (.-props this) "piece")))})))
     :componentWillUpdate
     (fn [next-prop _]
       (this-as this
                (when (not= (draggable? (aget next-prop "piece"))
                            (draggable? (aget (.-props this) "piece")))
                  (drag/piece-switch (aget (.-state this) "draggable-instance")
                                     (draggable? (aget (.-props this) "piece"))))))
     :componentWillUnmount
     (fn []
       (this-as this
                (-> this .-state (aget "draggable-instance") .unset)))
     :render
     (fn []
       (this-as this
                (let [piece (aget (.-props this) "piece")]
                  (react/div #js {:className (str "cg-piece" " "
                                                  (aget piece "color") " "
                                                  (aget piece "role"))}))))}))
(defn- piece-hash [props]
  (when-let [piece (aget props "square" "piece")]
    (str (aget piece "color") (aget piece "role"))))


(def square-component
  (js/React.createClass
    #js
    {:displayName "Square"
     :shouldComponentUpdate
     (fn [next-props _]
       (this-as this
                (let [diff? (make-diff "square" (.-props this) next-props)]
                  (or (diff? "selected?")
                      (diff? "move-dest?")
                      (diff? "premove-dest?")
                      (diff? "check?")
                      (diff? "last-move?")
                      (diff? "current-premove?")
                      (not= (piece-hash (.-props this))
                            (piece-hash next-props))
                      (not= (aget (.-props this) "orientation")
                            (aget next-props "orientation"))))))
     :componentDidMount
     (fn []
       (this-as this
                (let [el (.getDOMNode this)
                      key (aget (.-props this) "key")
                      ctrl (aget (.-props this) "ctrl")]
                  (doseq [ev ["touchstart" "mousedown"]]
                    (.addEventListener el ev #(ctrl :select-square key)))
                  (drag/square el))))
     :render
     (fn []
       (this-as this
                (let [square (aget (.-props this) "square")
                      orientation (aget (.-props this) "orientation")
                      ctrl (aget (.-props this) "ctrl")
                      key (aget (.-props this) "key")
                      read #(aget square %)
                      white? (= orientation "white")
                      x (inc (.indexOf "abcdefgh" (get key 0)))
                      y (js/parseInt (get key 1))
                      style-x (str (* (dec x) 12.5) "%")
                      style-y (str (* (dec y) 12.5) "%")
                      style (if white?
                              #js {"left" style-x "bottom" style-y}
                              #js {"right" style-x "top" style-y})
                      coord-x (when (= y (if white? 1 8)) (get key 0))
                      coord-y (when (= x (if white? 8 1)) y)
                      classes #js {"cg-square" true
                                   "selected" (read "selected?")
                                   "check" (read "check?")
                                   "last-move" (read "last-move?")
                                   "move-dest" (read "move-dest?")
                                   "premove-dest" (read "premove-dest?")
                                   "current-premove" (read "current-premove?")}]
                  (react/div #js {:style style
                                  :className (react/class-set classes)
                                  :data-key key
                                  :data-coord-x coord-x
                                  :data-coord-y coord-y}
                             (when-let [piece (aget square "piece")]
                               (piece-component #js {:piece piece
                                                     :ctrl ctrl}))))))}))

(def board-component
  (js/React.createClass
    #js
    {:displayName "Board"
     :render
     (fn []
       (this-as this
                (let [ctrl (aget (.-props this) "ctrl")
                      chess (aget (.-props this) "chess")
                      orientation (aget (.-props this) "orientation")]
                  (react/div #js {:className "cg-board"}
                             (.map (js/Object.keys chess)
                                   (fn [key] (square-component
                                               #js {:key key
                                                    :ctrl ctrl
                                                    :orientation orientation
                                                    :square (aget chess key)})))))))}))
