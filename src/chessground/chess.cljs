(ns chessground.chess
  "Contains functions for manipulating the Chess object"
  (:require [chessground.common :refer [pp]]))

(defn create [fen]
  (let [chess (new js/Chess)]
    (if fen (pp (.load chess fen)) (.reset chess))
    chess))

(def colors '(:white :black))

(def color-names {"w" "white" "b" "black"})
(defn color-name [color-key] (get color-names color-key))
(def role-names {"p" "pawn" "n" "knight" "b" "bishop" "r" "rook" "q" "queen" "k" "king"})
(defn role-name [role-key] (get role-names role-key))

(defn get-piece [chess key]
  "Converts chess.js piece format to chessground piece format"
  (when-let [piece (js->clj (.get chess key))]
    {:color (color-name (get piece "color"))
     :role (role-name (get piece "type"))}))
