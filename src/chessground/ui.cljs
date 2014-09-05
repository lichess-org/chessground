(ns chessground.ui
  (:require [chessground.common :as common :refer [pp]]
            [chessground.react :as react]
            [chessground.ctrl :as ctrl]
            [chessground.select :as select]
            [chessground.drag :as drag]
            [chessground.api :as api]
            [chessground.klass :as klass]))

(defn- draggable? [piece] (or (:movable? piece) (:premovable? piece)))

(def files #js ["a" "b" "c" "d" "e" "f" "g" "h"])
(def ranks #js [1 2 3 4 5 6 7 8])

; (defn piece-view [piece owner]
;   (reify
;     om/IDisplayName (display-name [_] "Piece")
;     om/IDidMount
;     (did-mount [_]
;       (om/set-state! owner :draggable-instance (drag/piece
;                                                  (om/get-node owner)
;                                                  (om/get-shared owner :ctrl-chan)
;                                                  (draggable? piece))))
;     om/IWillUpdate
;     (will-update [_ next-prop next-state]
;       (if (not= (draggable? (om/get-props owner)) (draggable? next-prop))
;         (drag/piece-switch (:draggable-instance next-state) (draggable? next-prop))))
;     om/IWillUnmount
;     (will-unmount [_]
;       (.unset (om/get-state owner :draggable-instance)))
;     om/IRender
;     (render [_]
;       (dom/div #js {:className (klass/join [klass/piece (:color piece) (:role piece)])}))))

(defn square-diff? [prev next n]
  (not= (-> prev (aget "square") (aget n))
        (-> next (aget "square") (aget n))))

(def square-component
  (js/React.createClass
    #js
    {:shouldComponentUpdate
     (fn [next-props next-state]
       (this-as this
                (or (square-diff? (.-props this) next-props "selected?")
                    (square-diff? (.-props this) next-props "move-dest?"))))
     :componentDidMount
     (fn []
       (this-as this
                (let [el (.getDOMNode this)
                      chan (aget (.-props this) "chan")]
                  (select/handler el chan)
                  (drag/square el))))
     :render
     (fn []
       (this-as this
                (let [square (aget (.-props this) "square")
                      read #(aget square %)
                      key (read "key")
                      white (= "white" "white")
                      x (inc (.indexOf files (get key 0)))
                      y (js/parseInt (get key 1))
                      style-x (str (* (dec x) 12.5) "%")
                      style-y (str (* (dec y) 12.5) "%")
                      style (if white #js {"left" style-x "bottom" style-y}
                              #js {"right" style-x "top" style-y})
                      coord-x (when (= y (if white 1 8)) (get key 0))
                      coord-y (when (= x (if white 8 1)) y)
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
                                  :data-coord-y coord-y}))))}))

; (defn square-view [square owner]
;   (reify
;     om/IDisplayName (display-name [_] "Square")
;     om/IDidMount
;     (did-mount [_]
;       (let [el (om/get-node owner)]
;         (select/handler el (om/get-shared owner :ctrl-chan))
;         (drag/square el)))
;     om/IRender
;     (render [_]
;       (let [white (= (om/get-state owner :orientation) "white")
;             [x y] (common/key->pos (:key square))
;             style {(if white "left" "right") (str (* (dec x) 12.5) "%")
;                    (if white "bottom" "top") (str (* (dec y) 12.5) "%")}
;             coord-x (when (= y (if white 1 8)) (first (:key square)))
;             coord-y (when (= x (if white 8 1)) y)
;             class-name (klass/join [klass/square
;                                     (when (:selected? square) klass/selected)
;                                     (when (:check? square) klass/check)
;                                     (when (:last-move? square) klass/last-move)
;                                     (when (:move-dest? square) klass/move-dest)
;                                     (when (:premove-dest? square) klass/premove-dest)
;                                     (when (:current-premove? square) klass/current-premove)])]
;         (dom/div (clj->js (cond-> {:style style
;                                    :className class-name
;                                    :data-key (:key square)}
;                             coord-x (merge {:data-coord-x coord-x})
;                             coord-y (merge {:data-coord-y coord-y})))
;                  (when-let [piece (:piece square)]
;                    (om/build piece-view (get square :piece))))))))

(def board-component
  (js/React.createClass
    #js
    {:render
     (fn []
       (this-as this
                (let [chan (aget (.-props this) "chan")
                      chess (aget (.-props this) "chess")]
                  (react/div #js {:className "cg-board"}
                             (.map ranks
                                   (fn [y]
                                     (.map files
                                           (fn [x] (square-component
                                                     #js {:key (str x y)
                                                          :chan chan
                                                          :square (aget chess (str x y))})))))))))}))
; (defn board-view [app owner]
;   (reify
;     om/IDisplayName (display-name [_] "Board")
;     om/IWillMount
;     (will-mount [_]
;       (api/handler app (om/get-shared owner :api-chan))
;       (ctrl/handler app (om/get-shared owner :ctrl-chan)))
;     om/IRender
;     (render [_]
;       (apply dom/div #js {:className klass/board}
;              (om/build-all
;                square-view
;                (for [y (range 1 9)
;                      x "abcdefgh"]
;                  (get-in app [:chess (str x y)]))
;                {:key :key
;                 :init-state {:orientation (:orientation app)}})))))
