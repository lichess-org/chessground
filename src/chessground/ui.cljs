(ns chessground.ui
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [chessground.premove :as premove]
            [chessground.drag :as drag]
            [chessground.animation :as animation])
  (:require-macros [cljs.core.async.macros :as am]))

(def ^private dom (.-DOM js/React))
(def ^private div (.-div dom))
(defn class-set [obj] (-> obj js/Object.keys (.filter #(aget obj %)) (.join " ")))

(def ^private all-keys
  (let [arr (array)]
    (loop [rank 1]
      (loop [file 1]
        (.push arr (str (aget "abcdefgh" (dec file)) rank))
        (when (< file 8) (recur (inc file))))
      (when (< rank 8) (recur (inc rank))))
    arr))

(defn- piece-hash [piece]
  (when piece (.join #js [(.-color piece) (.-role piece) (.-draggable piece)] "")))

(defn- transform-style [x y]
  (let [st #js {}]
    (aset st common/transform-prop (common/translate x y))
    st))

(def ^private piece-component
  (js/React.createClass
    #js
    {:displayName "Piece"
     :getInitialState
     (fn [] (this-as this #js {:draggable (.. this -props -draggable)
                               :drag_rel nil
                               :drag_pos nil
                               :anim false
                               :plan (.. this -props -plan)}))
     ; :shouldComponentUpdate
     ; (fn [next-props next-state]
     ;   (this-as this
     ;            (not (== (piece-hash (.-props this))
     ;                     (piece-hash next-props)))))
     :componentWillReceiveProps
     (fn [props]
       (this-as this
                (drag/will-receive-props this props)
                (.setState this #js {:plan (.-plan props)
                                     :draggable (.-draggable props)})))
     :componentDidMount
     (fn [] (this-as this (animation/start this)))
     :componentDidUpdate
     (fn [_ state]
       (this-as this
                (animation/start this)
                (drag/did-update this state)))
     :onMouseMove
     (fn [e] (this-as this (drag/mousemove this e)))
     :onMouseUp
     (fn [e] (this-as this (drag/mouseup this e)))
     :render
     (fn []
       (this-as this
                (let [style (if-let [drag (.. this -state -drag-pos)]
                              (transform-style (.-x drag) (.-y drag))
                              (when-let [anim (.. this -state -anim)]
                                (transform-style (.-x anim) (.-y anim))))]
                  (div #js {:className (.join #js ["cg-piece"
                                                   (.. this -props -color)
                                                   (.. this -props -role)
                                                   (if (.. this -state -drag-pos) "dragging" "")] " ")
                            :onMouseDown (drag/mousedown this)
                            :style style}))))}))

(def ^private square-component
  (js/React.createClass
    #js
    {:displayName "Square"
     :shouldComponentUpdate
     (fn [next-props _]
       (this-as this
                (or (not (== (.. this -props -selected) (.-selected next-props)))
                    (not (== (.. this -props -move-dest) (.-move-dest next-props)))
                    (not (== (.. this -props -premove-dest) (.-premove-dest next-props)))
                    (not (== (.. this -props -check) (.-check next-props)))
                    (not (== (.. this -props -last-move) (.-last-move next-props)))
                    (not (== (.. this -props -current-premove) (.-current-premove next-props)))
                    (not (== (.. this -props -orientation) (.-orientation next-props)))
                    (not (== (.. this -props -hover) (.-hover next-props)))
                    (not (== (piece-hash (.. this -props -piece))
                             (piece-hash (.-piece next-props)))))))
     :componentDidMount
     (fn []
       (this-as this
                (let [el (.getDOMNode this)
                      key (.. this -props -key)
                      ctrl (.. this -props -ctrl)]
                  (let [ev (if common/touch-device? "touchstart" "mousedown")]
                    (.addEventListener el ev (fn [e]
                                               (.preventDefault e)
                                               (ctrl :select-square key)))))))
     :render
     (fn []
       (this-as this
                (let [key (.. this -props -key)
                      white? (= (.. this -props -orientation) "white")
                      x (inc (.indexOf "abcdefgh" (get key 0)))
                      y (js/parseInt (get key 1))
                      style-x (str (* (dec x) 12.5) "%")
                      style-y (str (* (dec y) 12.5) "%")]
                  (div #js
                       {:style (if white?
                                 #js {"left" style-x "bottom" style-y}
                                 #js {"right" style-x "top" style-y})
                        :className (class-set #js {"cg-square" true
                                                   "selected" (.. this -props -selected)
                                                   "check" (.. this -props -check)
                                                   "last-move" (.. this -props -last-move)
                                                   "move-dest" (.. this -props -move-dest)
                                                   "premove-dest" (.. this -props -premove-dest)
                                                   "current-premove" (.. this -props -current-premove)
                                                   "drag-over" (.. this -props -hover)})
                        :data-key key
                        :data-coord-x (when (== y (if white? 1 8)) (get key 0))
                        :data-coord-y (when (== x (if white? 8 1)) y)}
                       (when-let [piece (.. this -props -piece)]
                         (piece-component piece))))))}))

(def board-component
  (js/React.createClass
    #js
    {:displayName "Board"
     :getInitialState
     (fn [] #js {:plans #{}
                 :hover nil})
     :componentWillReceiveProps
     (fn [next-props]
       (this-as this
                (.setState this #js {:plans (animation/compute (.-props this) next-props)})))
     :setHover
     (fn [key]
       (this-as this (.setState this #js {:hover key})))
     :render
     (fn []
       (this-as this
                (div #js {:className "cg-board"}
                     (.map (.. this -props -chess)
                           (fn [square]
                             (when (.-piece square)
                               (set! (.. square -piece -set-hover) (.-setHover this))
                               (set! (.. square -piece -plan) (aget (.. this -state -plans) (.-key square))))
                             (set! (.-hover square) (== (.. this -state -hover) (.-key square)))
                             (square-component square))))))}))

(defn- array-of [coll]
  (let [ar (array)]
    (when coll (doseq [x coll] (.push ar x)))
    ar))

(defn clj->react [app ctrl]
  (let [orientation (get app :orientation)
        chess (get app :chess)
        draggable-color (data/draggable-color app)
        last-move (get app :last-move)
        last-move-orig (get last-move 0)
        last-move-dest (get last-move 1)
        selected (get app :selected)
        check (get app :check)
        current-premove (array-of (get (get app :premovable) :current))
        move-dests (array-of (when-let [orig (get app :selected)]
                               (when (data/movable? app orig)
                                 (get-in app [:movable :dests orig]))))
        premove-dests (array-of (when-let [orig (get app :selected)]
                                  (when (data/premovable? app orig)
                                    (when-let [piece (get chess orig)]
                                      (premove/possible chess orig piece)))))
        anim (get app :animation)
        make-square (fn [key]
                      #js {:key key
                           :ctrl ctrl
                           :orientation orientation
                           :piece (when-let [piece (get chess key)]
                                    (let [color (get piece :color)]
                                      #js {:ctrl ctrl
                                           :color color
                                           :role (get piece :role)
                                           :draggable (or (= draggable-color "both")
                                                          (= draggable-color color))}))
                           :selected (== selected key)
                           :check (== check key)
                           :last_move (or (== last-move-orig key) (== last-move-dest key))
                           :move_dest (not (== -1 (.indexOf move-dests key)))
                           :premove_dest (not (== -1 (.indexOf premove-dests key)))
                           :current_premove (not (== -1 (.indexOf current-premove key)))})]
    #js {:chess (.map all-keys make-square)
         :orientation orientation
         :animation #js {:enabled (get anim :enabled?)
                         :duration (get anim :duration)
                         :exclude (get-in app [:movable :dropped])}}))
