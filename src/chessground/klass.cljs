(ns chessground.klass)

(def board "cg-board")
(def square "cg-square")
(def piece "cg-piece")
(def dragging "dragging")
(def drag-over "drag-over")

(defn join [cs] (clojure.string/join " " (filter identity cs)))
