(ns chessground.common
  "Shared utilities for the library"
  (:require [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(enable-console-print!)

(defn pp [expr] (.log js/console (if (map? expr) (clj->js expr) expr)) expr)

(defn set-contains? [set val] (some #{val} set))

(defn push! [chan msg] (am/go (a/>! chan msg)))

(defn push-args! [chan] (fn [& args] (push! chan args)))

(defn square-key [dom-element]
  "Gets the square key from the element, or its parent"
  (keyword (or
             (.getAttribute dom-element "data-key")
             (.getAttribute (.-parentNode dom-element) "data-key"))))
