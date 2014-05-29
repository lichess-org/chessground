(ns chessground.common)

(defn pp [expr]
  (.log js/console expr)
  expr)
