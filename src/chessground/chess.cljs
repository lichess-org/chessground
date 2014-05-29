(ns chessground.chess
  "Immutable board data. Does not implement chess rules"
  (:require [chessground.common :refer [pp]]
            [chessground.fen :as forsyth]
            [clojure.string :refer [lower-case]]))

(defn create [fen]
  {:pieces (forsyth/parse fen)})

(def colors '(:white :black))

(defn get-piece [chess key] (get-in chess [:pieces (keyword key)]))

(defn move-piece [chess from to validate] chess)
; "Tries to move a piece; returns a new chess on success, or nil on failure"
; (let [new-chess (create (.fen chess))
;       msg (clj->js {:from from :to to})]
;   (when-let [_ (.move new-chess msg)] new-chess)))
