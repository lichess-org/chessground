(ns chessground.fen
  "Forsyth Edwards notation"
  (:require [chessground.common :refer [pp]]
            [chessground.schemas :refer [ChessPiece BoardState]]
            [clojure.string :refer [lower-case]]
            [schema.core :as s])
  (:require-macros [schema.macros :as sm :refer [defschema]]))

(def default "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

(def role-names {"p" "pawn" "r" "rook" "n" "knight" "b" "bishop" "q" "queen" "k" "king"})

(sm/defn pos-to-key :- s/Str
  [pos :- s/Num]
  (str (get "abcdefgh" (mod pos 8))
       (- 8 (int (/ pos 8)))))

(sm/defn parse-squares :- (s/maybe BoardState)
  "Parses a FEN-notation of a chess board into a map of locations ->
  piece, where piece is represented as {:role r, :color c}."
  [fen-chars :- s/Str]
  (loop [pieces {}
         pos 0
         [current & next] fen-chars]
    (let [as-int (js/parseInt current)
          spaces (when-not (js/isNaN as-int) as-int)]
      (cond
        (> pos 63) pieces
        (= current "/") (recur pieces pos next)
        (not (nil? spaces)) (recur pieces (+ pos spaces) next)
        :else (let [key (pos-to-key pos)
                    lower (lower-case current)
                    role (get role-names lower)
                    color (if (= current lower) "black" "white")
                    piece {:role role :color color}]
                (recur (assoc pieces key piece) (inc pos) next))))))

(sm/defn parse :- BoardState
  [fen :- s/Str]
  (parse-squares (or fen default)))
