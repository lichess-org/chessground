(ns chessground.common
  "Shared utilities for the library"
  (:require [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(enable-console-print!)

(def debug true)

(defn pp [& exprs]
  (when debug (doseq [expr exprs] (.log js/console (clj->js expr))))
  (first exprs))

(defn set-contains? [set val] (some #{val} set))

(defn push! [chan msg] (am/go (a/>! chan msg)))

(defn has-class [dom-element class] (.contains (.-classList dom-element) class))

(defn $ [selector context]
  (.querySelector (or context js/document) selector))

(defn $$ [selector context]
  (.querySelectorAll (or context js/document) selector))

; is there a better way to do that?
(def is-touch-device (js* "'ontouchstart' in document"))

(def transform-prop "webkitTransform")
; (let [style (.-style (.querySelector js/document "body"))]
; (if (js* "'transform' in style") "transform"
;   (if (js* "'webkitTransform' in style") "webkitTransform"
;     (if (js* "'mozTransform' in style") "mozTransform"
;       (if (js* "'oTransform' in style") "oTransform"
;         "transform"))))))

(defn square-element [dom-element]
  "If element is a square, return it. If it's a piece, return its parent"
  (if (has-class dom-element "square")
    dom-element
    (when (has-class dom-element "piece")
      (let [parent (.-parentNode dom-element)]
        (when (has-class parent "square") parent)))))

(defn square-key [dom-element]
  "Gets the square key from the element, or its parent"
  (.getAttribute (square-element dom-element) "data-key"))

(defn keywordize-keys [hashmap]
  (into {} (for [[k v] hashmap] [(keyword k) v])))

(defn keywordize-keys-in [hashmap path]
  (if (map? (get-in hashmap path))
    (update-in hashmap path keywordize-keys)
    hashmap))
