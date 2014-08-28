(ns chessground.klass)

(def board "cg-board")
(def square "cg-square")
(def piece "cg-piece")
(def last-move "last-move")
(def check "check")
(def dest "dest")
(def selected "selected")

(defn join [cs] (clojure.string/join " " (filter identity cs)))
