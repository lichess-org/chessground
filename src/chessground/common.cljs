(ns chessground.common
  "Shared utilities for the library"
  (:require [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(enable-console-print!)

(def debug false)

(def ground-id
  "Ground unique ID generator (increment)"
  (atom 0))

(defn pp [& exprs]
  (when debug (doseq [expr exprs] (.log js/console (clj->js expr))))
  (first exprs))

(defn deep-merge [a b]
  (letfn [(smart-merge [x y]
            (if (and (map? x) (map? y))
              (merge x y)
              (or y x)))]
    (merge-with smart-merge a b)))

(defn set-contains? [set val] (some #{val} set))

(defn push! [chan msg] (am/go (a/>! chan msg)))

(defn has-class [dom-element class]
  (and dom-element (.contains (.-classList dom-element) class)))

(defn $ [selector context]
  (.querySelector (or context js/document) selector))

(defn $$ [selector context]
  (.querySelectorAll (or context js/document) selector))

(defn offset [element]
  (let [rect (.getBoundingClientRect element)]
    {:top (+ (.-top rect) (-> js/document .-body .-scrollTop))
     :left (+ (.-left rect) (-> js/document .-body .-scrollLeft))}))

; is there a better way to do that?
(def touch-device? (js* "'ontouchstart' in document"))

(defn hidden? [element]
  (nil? (js->clj (.-offsetParent element))))

(def transform-prop
  "Fun fact: this won't work if chessground is included in the <head>
   Because the <body> element must exist at the time this code runs."
  (do
    (or (.-body js/document) (throw "chessground must be included in the <body> tag!"))
    (cond
      (js* "'transform' in document.body.style") "transform"
      (js* "'webkitTransform' in document.body.style") "webkitTransform"
      (js* "'mozTransform' in document.body.style") "mozTransform"
      (js* "'oTransform' in document.body.style") "oTransform"
      :else "transform")))

(defn square-element [dom-element]
  "If element is a square, return it. If it's a piece, return its parent"
  (if (has-class dom-element "square")
    dom-element
    (when (has-class dom-element "piece")
      (let [parent (.-parentNode dom-element)]
        (when (has-class parent "square") parent)))))

(defn square-key [dom-element]
  "Gets the square key from the element, or its parent"
  (when-let [sq (square-element dom-element)]
    (.getAttribute sq "data-key")))

(defn keywordize-keys [hashmap]
  (into {} (for [[k v] hashmap] [(keyword k) v])))

(defn keywordize-keys-in [hashmap path]
  (if (map? (get-in hashmap path))
    (update-in hashmap path keywordize-keys)
    hashmap))
