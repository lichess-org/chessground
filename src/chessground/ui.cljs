(ns chessground.ui
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom]
            [chessground.common :as common :refer [pp]]
            [chessground.ctrl :as ctrl]
            [chessground.select :as select]
            [chessground.drag :as drag]
            [chessground.api :as api]
            [chessground.klass :as klass]))

(defn- draggable? [piece] (or (:movable? piece) (:premovable? piece)))

(defn piece-view [piece owner]
  (reify
    om/IDisplayName (display-name [_] "Piece")
    om/IDidMount
    (did-mount [_]
      (om/set-state! owner :draggable-instance (drag/piece
                                                 (om/get-node owner)
                                                 (om/get-shared owner :ctrl-chan)
                                                 (draggable? piece))))
    om/IWillUpdate
    (will-update [_ next-prop next-state]
      (if (not= (draggable? (om/get-props owner)) (draggable? next-prop))
        (drag/piece-switch (:draggable-instance next-state) (draggable? next-prop))))
    om/IWillUnmount
    (will-unmount [_]
      (.unset (om/get-state owner :draggable-instance)))
    om/IRender
    (render [_]
      (dom/div #js {:className (klass/join [klass/piece (:color piece) (:role piece)])}))))

(defn square-view [square owner]
  (reify
    om/IDisplayName (display-name [_] "Square")
    om/IDidMount
    (did-mount [_]
      (let [el (om/get-node owner)]
        (select/handler el (om/get-shared owner :ctrl-chan))
        (drag/square el)))
    om/IRender
    (render [_]
      (let [white (= (om/get-state owner :orientation) "white")
            [x y] (common/key->pos (:key square))
            style {(if white "left" "right") (str (* (dec x) 12.5) "%")
                   (if white "bottom" "top") (str (* (dec y) 12.5) "%")}
            coord-x (when (= y (if white 1 8)) (first (:key square)))
            coord-y (when (= x (if white 8 1)) y)
            class-name (klass/join [klass/square
                                    (when (:selected? square) klass/selected)
                                    (when (:check? square) klass/check)
                                    (when (:last-move? square) klass/last-move)
                                    (when (:move-dest? square) klass/move-dest)
                                    (when (:premove-dest? square) klass/premove-dest)
                                    (when (:current-premove? square) klass/current-premove)])]
        (dom/div (clj->js (cond-> {:style style
                                   :className class-name
                                   :data-key (:key square)}
                            coord-x (merge {:data-coord-x coord-x})
                            coord-y (merge {:data-coord-y coord-y})))
                 (when-let [piece (:piece square)]
                   (om/build piece-view (get square :piece))))))))

(defn board-view [app owner]
  (reify
    om/IDisplayName (display-name [_] "Board")
    om/IWillMount
    (will-mount [_]
      (api/handler app (om/get-shared owner :api-chan))
      (ctrl/handler app (om/get-shared owner :ctrl-chan)))
    om/IRender
    (render [_]
      (apply dom/div #js {:className klass/board}
             (om/build-all
               square-view
               (for [y (range 1 9)
                     x "abcdefgh"]
                 (get-in app [:chess (str x y)]))
               {:key :key
                :init-state {:orientation (:orientation app)}})))))
