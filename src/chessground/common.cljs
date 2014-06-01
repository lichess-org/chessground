(ns chessground.common
  "Shared utilities for the library"
  (:require [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(enable-console-print!)

(defn pp [expr] (.log js/console (if (map? expr) (clj->js expr) expr)) expr)

(defn set-contains? [set val] (some #{val} set))

(defn push! [chan msg] (am/go (a/>! chan msg)))

(defn push-args! [chan] (fn [& args] (push! chan args)))

(defn has-class [dom-element class] (.contains (.-classList dom-element) class))

(defn is-touch-device [] 
  (js* "'ontouchstart' in document"))

(defn square-element [dom-element]
  "If element is a square, return it. If it's a piece, return its parent"
  (if (has-class dom-element "square")
    dom-element
    (when (has-class dom-element "piece") (square-element (.-parentNode dom-element)))))

(defn square-key [dom-element]
  "Gets the square key from the element, or its parent"
  (keyword (.getAttribute (square-element dom-element) "data-key")))
