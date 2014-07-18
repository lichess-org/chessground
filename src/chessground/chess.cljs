(ns chessground.chess
  "Immutable board data. Does not implement chess rules"
  (:require [chessground.common :refer [pp]]
            [chessground.fen :as forsyth]
            [chessground.schemas :refer [ChessPiece BoardState PiecesMap Square]]
            [schema.core :as s :refer [Str Int]])
  (:require-macros [schema.macros :as sm :refer [defschema]]))

(comment
  ; Representation of a chess game:
  {:pieces {"a1" {:color "white" :role "rook"}
            "b1" {:color "white" :role "knight"}}}
  )

(def colors ["white" "black"])
(def roles ["pawn" "rook" "knight" "bishop" "queen" "king"])

(def clear {:pieces {}})

(sm/defn make :- PiecesMap
  [fen :- Str]
  {:pieces (forsyth/parse (when (not= fen "start") fen))})

(sm/defn get-piece :- ChessPiece
  [chess :- PiecesMap
   key :- Str]
  (get-in chess [:pieces key]))

(sm/defn get-pieces :- BoardState
  [chess :- PiecesMap]
  (:pieces chess))

(sm/defn remove-piece :- PiecesMap
  [chess :- PiecesMap
   key :- Str]
  (update-in chess [:pieces] dissoc key))

(sm/defn put-piece :- PiecesMap
  [chess :- PiecesMap
   key :- Square
   piece :- ChessPiece]
  (assoc-in chess [:pieces key] piece))

(sm/defn set-pieces :- PiecesMap
  [chess :- PiecesMap
   changes :- [[Square ChessPiece]]]
  (update-in chess [:pieces]
    (fn [pieces]
      (reduce (fn [ps [key p]]
                (if p (assoc ps key p) (dissoc ps key)))
        pieces changes))))

(sm/defn count-pieces :- Int
  [chess :- PiecesMap]
  (count (:pieces chess)))

(sm/defn move-piece :- (s/maybe PiecesMap)
  "Return nil if orig and dest make no sense"
  [chess :- PiecesMap
   orig :- Square
   dest :- Square]
  (when (not= orig dest)
    (when-let [piece (get-piece chess orig)]
      (-> chess
          (remove-piece orig)
          (put-piece dest piece)))))

(sm/defn owner-color :- (s/enum "white" "black")
  "Returns the color of the piece on this square key, or nil"
  [chess :- PiecesMap
   key :- Square]
  (:color (get-piece chess key)))
