(ns chessground.ui
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom :include-macros true]
            [cljs.core.async :as a]
            [chessground.common :as common :refer [pp]]
            [chessground.ctrl :as ctrl]
            [chessground.select :as select]
            [chessground.drag :as drag]
            [chessground.api :as api]
            [chessground.klass :as klass])
  (:require-macros [cljs.core.async.macros :as am]))

(defn piece-view [piece owner]
  (reify
    om/IDidMount
    (did-mount [_]
      (om/set-state! owner :draggable-instance (drag/piece
                                                 (om/get-node owner)
                                                 (om/get-shared owner :ctrl-chan))))
    om/IWillUpdate
    (will-update [_ next-prop next-state]
      (if (not= (:movable? (om/get-props owner)) (:movable? next-prop))
        (drag/piece-switch (:draggable-instance next-state) (:movable? next-prop))))
    om/IWillUnmount
    (will-unmount [_]
      (.unset (om/get-state owner :draggable-instance)))
    om/IRender
    (render [_]
      (dom/div #js {:className (klass/join [klass/piece (:color piece) (:role piece)])}))))

(defn square-view [square owner]
  (reify
    om/IDidMount
    (did-mount [_]
      (let [el (om/get-node owner)]
        (select/handler el (om/get-shared owner :ctrl-chan))
        (drag/square el)))
    om/IRender
    (render [_]
      (dom/div #js {:className (klass/join [klass/square
                                            (when (:selected? square) klass/selected)
                                            (when (:check? square) klass/check)
                                            (when (:last-move? square) klass/last-move)
                                            (when (:dest? square) klass/dest)])
                    :data-key (:key square)}
               (when-let [piece (:piece square)]
                 (om/build piece-view (get square :piece)))))))

(defn board-view [app owner]
  (reify
    om/IWillMount
    (will-mount [_]
      (api/handler app (om/get-shared owner :api-chan))
      (ctrl/handler app (om/get-shared owner :ctrl-chan)))
    om/IRender
    (render [_]
      (let [white (= (:orientation app) "white")]
        (apply dom/div #js {:className klass/board}
               (for [rank (range 1 9)
                     file-n (range 1 9)
                     :let [file (get "abcdefgh" (dec file-n))
                           key (str file rank)
                           pos {(if white "left" "right") (str (* (dec file-n) 12.5) "%")
                                (if white "bottom" "top") (str (* (dec rank) 12.5) "%")}
                           coord-x (when (= rank (if white 1 8)) file)
                           coord-y (when (= file-n (if white 8 1)) rank)]]
                 (dom/div (clj->js (cond-> {:style pos}
                                     coord-x (merge {:data-coord-x coord-x})
                                     coord-y (merge {:data-coord-y coord-y})))
                          (om/build
                            square-view
                            (get-in app [:chess key])
                            {:react-key key}))))))))
