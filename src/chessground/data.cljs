(ns chessground.data
  "Contains functions for manipulating and persisting the application data"
  (:refer-clojure :exclude [filter])
  (:require [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(defn fresh
  "Returns a new, empty application state."
  []
  {:orientation :black
   :movable {:enabled :both ; :white | :black | :both | nil
             }
   :clicked nil ; last clicked square. :a2 | nil
   })
