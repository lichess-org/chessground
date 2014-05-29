(ns chessground.common
  "Shared utilities for the library"
  (:require [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(enable-console-print!)

(defn pp [expr] (println expr) expr)

(defn set-contains? [set val] (some #{val} set))

(defn push! [chan msg] (am/go (a/>! chan msg)))
