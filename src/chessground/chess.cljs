(ns chessground.chess
  "Immutable board data. Does not implement chess rules"
  (:require [chessground.common :refer [pp]]
            [chessground.fen :as forsyth]
            [clojure.string :refer [lower-case]]))

(def colors [:white :black])

(defn make [fen]
  {:pieces (forsyth/parse fen)})

(defn get-piece [chess key] (get-in chess [:pieces key]))

(defn remove-piece [chess key] (update-in chess [:pieces] dissoc key))

(defn put-piece [chess key piece] (assoc-in chess [:pieces key] piece))

(defn- count-pieces [chess] (count (:pieces chess)))

(defn move-piece [chess from to]
  (when-let [piece (get-piece chess from)]
    (-> chess
        (remove-piece from)
        (put-piece to piece))))
