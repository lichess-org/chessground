(ns chessground.fen
  "Forsyth Edwards notation"
  (:require [chessground.common :refer [pp]]
            [clojure.string :refer [lower-case]]))

(def default "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

(def role-names {:p :pawn :r :rook :n :knight :b :bishop :q :queen :k :king})

(defn- pos-to-key [pos]
  (keyword (str (get "abcdefgh" (mod pos 8)) (- 8 (int (/ pos 8))))))

(defn- parse-squares [fen-chars]
  (loop [pieces {} pos 0 [current & next] fen-chars]
    (let [as-int (js/parseInt current)
          spaces (when (not (js/isNaN as-int)) as-int)]
      (cond
        (nil? current) pieces
        (not (nil? spaces)) (recur pieces (+ pos spaces) next)
        :else (let [key (pos-to-key pos)
                    lower (lower-case current)
                    role ((keyword lower) role-names)
                    color (if (= current lower) :black :white)
                    piece {:role role :color color}]
                (recur (assoc pieces key piece) (inc pos) next))))))

(defn parse [fen]
  (parse-squares (->>
                   (or fen default)
                   (remove #(= "/" %))
                   (take-while #(not= \space %)))))
