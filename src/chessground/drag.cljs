(ns chessground.drag
  "Make pieces draggable, and squares droppable"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]
            [cljs.core.async :as a]))

(def ^private class-dragging "dragging")
(def ^private class-drag-over "drag-over")

