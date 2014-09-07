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
(defn- piece-hash [props]
  (when-let [piece (aget props "piece")]
    (str (aget piece "color") (aget piece "role") (aget piece "draggable?"))))

(defn- make-diff [prev next]
  (fn [k] (not= (aget prev k) (aget next k))))

(def square-component
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
                  (doseq [ev ["touchstart" "mousedown"]]
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

(def all-keys (clj->js (keys chess/clear)))

(defn- square-props [state ctrl]
  (let [orientation (:orientation state)
        move-dests (set (when-let [orig (:selected state)]
                          (when (data/movable? state orig)
                            (get-in state [:movable :dests orig]))))
        premove-dests (set (when-let [orig (:selected state)]
                             (when (data/premovable? state orig)
                               (when-let [piece (get-in state [:chess orig])]
                                 (premove/possible (:chess state) orig piece)))))]
    (fn [key]
      #js {:key key
           :ctrl ctrl
           :orientation orientation
           :piece (when-let [piece (get-in state [:chess key])]
                    #js {:ctrl ctrl
                         :color (:color piece)
                         :role (:role piece)
                         :draggable? (or (data/movable? state key)
                                         (data/premovable? state key))})
           :selected? (= (:selected state) key)
           :check? (= (:check state) key)
           :last-move? (when-let [move (:last-move state)]
                         (or (= (first move) key)
                             (= (second move) key)))
           :move-dest? (move-dests key)
           :premove-dest? (premove-dests key)
           :current-premove? (when-let [move (-> state :premovable :current)]
                               (or (= (first move) key)
                                   (= (second move) key)))})))

(defn make-props [state ctrl]
  #js {:chess (.map all-keys (square-props state ctrl))})

(def board-component
  (js/React.createClass
    #js
    {:displayName "Board"
     :render
     (fn []
       (this-as this
                (react/div #js {:className "cg-board"}
                           (.map (aget (.-props this) "chess")
                                 square-component))))}))
