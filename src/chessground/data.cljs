(ns chessground.data
  "Contains functions for manipulating and persisting the application data"
  (:refer-clojure :exclude [filter])
  (:require [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(defn fresh
  "Returns a new, empty application state."
  []
  {:filter :all
   :items []})
