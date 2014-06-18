(ns chessground.render
  "HTML templates"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]))

(defn piece [{color :color role :role}]
  (str "<div class='piece " color " " role "'></div>"))

(defn square [key pos p]
  (let [style (apply str (map (fn [[k v]] (str (name k) ":" v ";")) pos))
        piece-html (when p (piece p))]
    (str "<div class='square' data-key='" key "' style='" style "'>" piece-html "</div>")))

(defn board [state]
  (let [white (= (:orientation state) "white")
        c (:chess state)
        squares (for [rank (range 1 9)
                      file-n (range 1 9)
                      :let [file (get "abcdefgh" (- file-n 1))
                            key (str file rank)
                            pos {(if white :left :right) (str (* (- file-n 1) 12.5) "%")
                                 (if white :bottom :top) (str (* (- rank 1) 12.5) "%")}
                            p (chess/get-piece c key)]]
                  (square key pos p))]
    (str "<div class='board'>" (apply str squares) "</div>")))

(defn spare-pieces [state color klass]
  (when (:spare-pieces state)
    (str "<div class='spare-pieces " klass " " color "'>"
         (apply str (map #(str "<div class='piece " % " " color "'></div>") chess/roles))
         "</div>")))

(defn app [state]
  (str (spare-pieces state (if (= (:orientation state) "white") "black" "white") "top")
       (board state)
       (spare-pieces state (if (= (:orientation state) "white") "white" "black") "bottom")))
