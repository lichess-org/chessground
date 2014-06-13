(ns chessground.render
  "HTML templates"
  (:require [jayq.core :as jq :refer [$]]
            [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]))

(defn render-piece [{color :color role :role}]
  (str "<div class='piece " color " " role "'></div>"))

(defn render-square [key pos piece]
  (let [style (apply str (map (fn [[k v]] (str (name k) ":" v ";")) pos))
        piece-html (when piece (render-piece piece))]
    (str "<div class='square' data-key='" key "' style=' " style "'>" piece-html "</div>")))

(defn render-board [state]
  (let [white (= (pp (:orientation state)) :white)
        c (:chess state)
        squares (for [rank (range 1 9)
                      file-n (range 1 9)
                      :let [file (get "abcdefgh" (- file-n 1))
                            key (str file rank)
                            pos {(if white :left :right) (str (* (- file-n 1) 12.5) "%")
                                 (if white :bottom :top) (str (* (- rank 1) 12.5) "%")}
                            piece (chess/get-piece c key)]]
                  (render-square key pos piece))]
    (str "<div class='board'>" (apply str squares) "</div>")))

(defn render-app [dom-element state]
  (jq/html ($ dom-element) (render-board state)))
