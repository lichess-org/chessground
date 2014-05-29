(ns chessground.common)

(enable-console-print!)

(defn pp [expr] (println expr) expr)

(defn set-contains? [set val] (some #{val} set))
