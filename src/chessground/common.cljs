(ns chessground.common
  "Shared utilities for the library"
  (:require [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(enable-console-print!)

(def debug true)

(def exp 
  "Chessground namespace used to add a unique property to dom elements"
  (str "Chessground" (js/Date.)))

(def uid 
  "Unique ID generator (increment)"
  (atom 0))

(def store 
  "Data store used to associate objects to dom elements"
  (atom {}))

(defn get-dom-data [el key]
  "Alternative to jquery .data(key): retrieve an object associated to a dom element"
  (when-let [id (aget el exp)]
    (get-in @store [id key])))

(defn set-dom-data [el key value]
  "Alternative to of jquery .data(key, value): set an object associated to a dom element"
  (if-let [id (aget el exp)]
    (swap! store assoc-in [id key] value)
    (let [setid (swap! uid inc)]
      (aset el exp setid)
      (swap! store assoc-in [setid key] value))))

(defn remove-el [el]
  "Remove a dom element, and ensure that any data associated with in store is removed too"
  (when (.-parentNode el)
    (do
      (-> el .-parentNode (.removeChild el))
      (when-let [id (aget el exp)]
        (swap! store dissoc id)))))

(defn pp [& exprs]
  (when debug
    (doseq [expr exprs] (.log js/console (clj->js expr))))
  (first exprs))

(defn set-contains? [set val] (some #{val} set))

(defn push! [chan msg] (am/go (a/>! chan msg)))

(defn has-class [dom-element class] (.contains (.-classList dom-element) class))

(defn $ [selector & [context]]
  (if context
    (.querySelector context selector)
    (.querySelector js/document selector)))

(defn $$ [selector & [context]]
  (if context
    (.querySelectorAll context selector)
    (.querySelectorAll js/document selector)))

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

(defn nodelist-to-seq
  "Converts nodelist to (not lazy) seq."
  [nl]
  (let [result-seq (map #(.item nl %) (range (.length nl)))]
    (doall result-seq)))
