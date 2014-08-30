(ns chessground.ui
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom :include-macros true]
            [cljs.core.async :as a]
            [chessground.common :as common :refer [pp]]
            [chessground.dom-data :as dom-data]
            [chessground.ctrl :as ctrl]
            [chessground.select :as select]
            [chessground.drag :as drag]
            [chessground.api :as api]
            [chessground.klass :as klass])
  (:require-macros [cljs.core.async.macros :as am]))

(defn square-view [square owner]
  (reify
    om/IDidMount
    (did-mount [_]
      (let [el (om/get-node owner)
            chan (om/get-shared owner :ctrl-chan)]
        (select/handler el chan)
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
                 (dom/div #js {:className (klass/join [klass/piece (:color piece) (:role piece)])}))))))

(defn board-view [app owner]
  (reify
    om/IWillMount
    (will-mount [_]
      (api/handler app (om/get-shared owner :api-chan))
      (ctrl/handler app (om/get-shared owner :ctrl-chan)))
    om/IDidMount
    (did-mount [_]
      (drag/pieces (om/get-node owner) (om/get-shared owner :ctrl-chan) app))
    om/IDidUpdate
    (did-update [_ _ _]
      (drag/pieces (om/get-node owner) (om/get-shared owner :ctrl-chan) app))
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
