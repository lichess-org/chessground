(ns chessground.schemas
  (:require [schema.core :as s :refer [Any Str Bool]])
  (:require-macros [schema.macros :as sm :refer [defschema]]))

(defschema AnyMap {Any Any})

(defschema Square
  (s/both
    (s/pred #(contains? (set (seq "abcdefgh")) (first %)) 'proper-file)
    (s/pred #(contains? (set (seq "12345678")) (second %)) 'proper-rank)))

(defschema ChessPiece
  {:role  (s/enum "pawn" "rook" "knight" "bishop" "queen" "king")
   :color (s/enum "black" "white")})

(defschema BoardState {Square ChessPiece})

(defschema PiecesMap {:pieces BoardState})

(defschema MoveMap {Square [Square]})

(defschema ChessState
  {:fen   (s/maybe Str)
   :chess (s/either PiecesMap {})
   :orientation (s/enum "white" "black")
   :movable {:free Bool
             :color (s/enum "white" "black" "both")
             :dests (s/maybe MoveMap)
             :drop-off (s/enum "revert" "trash")
             :drag-center Bool
             :events {Keyword js/Function}}
   :selected (s/maybe Str)
   :dragging Bool
   :spare-pieces Bool})
