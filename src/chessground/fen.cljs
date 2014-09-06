(ns chessground.fen
  "Forsyth Edwards notation"
  (:require [chessground.common :refer [pp]]
            [clojure.string :refer [lower-case]]))

(def default "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

(def ^private role-names {"p" "pawn"
                 "r" "rook"
                 "n" "knight"
                 "b" "bishop"
                 "q" "queen"
                 "k" "king"})

(defn- pos-to-key [pos]
  (str (get "abcdefgh" (mod pos 8))
       (- 8 (int (/ pos 8)))))

(defn- parse-squares
  "Parses a FEN-notation of a chess board into a map of locations ->
   piece, where piece is represented as {:role r, :color c}."
  [fen-chars]
  (loop [pieces {}
         pos 0
         [current & next] fen-chars]
    (let [as-int (js/parseInt current)
          spaces (when-not (js/isNaN as-int) as-int)]
      (cond
        (> pos 63) pieces
        (= current "/") (recur pieces pos next)
        (not (nil? spaces)) (recur pieces (+ pos spaces) next)
        :else (let [key (keyword (pos-to-key pos))
                    lower (lower-case current)
                    piece {:role (get role-names lower)
                           :color (if (= current lower) "black" "white")}]
                (recur (assoc pieces key piece) (inc pos) next))))))

(defn parse [fen]
  (parse-squares
    (->> (or fen default)
         (remove #(= "/" %))
         (take-while #(not= \space %)))))
