(ns chessground.ui
  (:require [cljs.core.async :as a]
            [chessground.common :as common :refer [pp]]
            [chessground.react :as react]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [chessground.premove :as premove]
            [chessground.drag :as drag]
            [chessground.api :as api])
  (:require-macros [cljs.core.async.macros :as am]))

(defn- piece-hash [props]
  (when-let [piece (aget props "piece")]
    (str (aget piece "color") (aget piece "role") (aget piece "draggable?"))))

(defn- make-diff [prev next]
  (fn [k] (not= (aget prev k) (aget next k))))

(def ^private piece-component
  (js/React.createClass
    #js
    {:displayName "Piece"
     :shouldComponentUpdate
     (fn [next-props _]
       (this-as this
                (or (not= (aget (.-props this) "color") (aget next-props "color"))
                    (not= (aget (.-props this) "role") (aget next-props "role")))))
     :componentDidMount
     (fn []
       (this-as this
                (.setState this #js {:draggable-instance (drag/piece
                                                           (.getDOMNode this)
                                                           (aget (.-props this) "ctrl")
                                                           (aget (.-props this) "draggable?"))})))
     :componentWillUpdate
     (fn [next-prop _]
       (this-as this
                (when (not= (aget next-prop "draggable?")
                            (aget (.-props this) "draggable?"))
                  (drag/piece-switch (aget (.-state this) "draggable-instance")
                                     (aget (.-props this) "draggable?")))))
     :componentWillUnmount
     (fn []
       (this-as this
                (-> this .-state (aget "draggable-instance") .unset)))
     :render
     (fn []
       (this-as this
                (react/div #js {:className (str "cg-piece" " "
                                                (aget (.-props this) "color") " "
                                                (aget (.-props this) "role"))})))}))

(def ^private square-component
  (js/React.createClass
    #js
    {:displayName "Square"
     :shouldComponentUpdate
     (fn [next-props _]
       (this-as this
                (let [diff? (make-diff (.-props this) next-props)]
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
                  (let [ev (if common/touch-device? "touchstart" "mousedown")]
                    (.addEventListener el ev #(ctrl :select-square key)))
                  (drag/square el))))
     :render
     (fn []
       (this-as this
                (let [read #(aget (.-props this) %)
                      orientation (read "orientation")
                      ctrl (read "ctrl")
                      key (read "key")
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
                             (when-let [piece (read "piece")]
                               (piece-component piece))))))}))

(def ^private board-component
  (js/React.createClass
    #js
    {:displayName "Board"
     :render
     (fn []
       (this-as this
                (react/div #js {:className "cg-board"}
                           (.map (aget (.-props this) "chess")
                                 square-component))))}))

(def ^private all-keys
  #js ["a1" "a2" "a3" "a4" "a5" "a6" "a7" "a8"
       "b1" "b2" "b3" "b4" "b5" "b6" "b7" "b8"
       "c1" "c2" "c3" "c4" "c5" "c6" "c7" "c8"
       "d1" "d2" "d3" "d4" "d5" "d6" "d7" "d8"
       "e1" "e2" "e3" "e4" "e5" "e6" "e7" "e8"
       "f1" "f2" "f3" "f4" "f5" "f6" "f7" "f8"
       "g1" "g2" "g3" "g4" "g5" "g6" "g7" "g8"
       "h1" "h2" "h3" "h4" "h5" "h6" "h7" "h8"])

(defn- array-of [coll] (if coll (clj->js coll) (array)))

(defn- clj->react [app ctrl]
  (let [orientation (get app :orientation)
        chess (get app :chess)
        draggable-color (data/draggable-color app)
        last-move (array-of (get app :last-move))
        selected (array-of (get app :selected))
        check (array-of (get app :check))
        current-premove (array-of (get (get app :premovable) :current))
        move-dests (array-of (when-let [orig (get app :selected)]
                               (when (data/movable? app orig)
                                 (get-in app [:movable :dests orig]))))
        premove-dests (array-of (when-let [orig (get app :selected)]
                                  (when (data/premovable? app orig)
                                    (when-let [piece (get chess orig)]
                                      (premove/possible chess orig piece)))))]
    (fn [key]
      #js {:key key
           :ctrl ctrl
           :orientation orientation
           :piece (when-let [piece (get chess key)]
                    (let [color (get piece :color)]
                      #js {:ctrl ctrl
                           :color color
                           :role (get piece :role)
                           :draggable? (= draggable-color color)}))
           :selected? (= selected key)
           :check? (= check key)
           :last-move? (not= -1 (.indexOf last-move key))
           :move-dest? (not= -1 (.indexOf move-dests key))
           :premove-dest? (not= -1 (.indexOf premove-dests key))
           :current-premove? (not= -1 (.indexOf current-premove key))})))

(defn root [app ctrl]
  ; (js/console.time "root")
  (let [data #js {:chess (.map all-keys (clj->react app ctrl))}]
    ; (js/console.timeEnd "root")
    (board-component data)))
