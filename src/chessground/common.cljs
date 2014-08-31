(ns chessground.common
  "Shared utilities for the library"
  (:require [cljs.core.async :as a]
            [chessground.klass :as klass])
  (:require-macros [cljs.core.async.macros :as am]))

(enable-console-print!)

(def debug true)

(defn pp [& exprs]
  (when debug (doseq [expr exprs] (.log js/console (clj->js expr))))
  (first exprs))

(defn deep-merge [a b]
  (letfn [(smart-merge [x y]
            (if (and (map? x) (map? y))
              (merge x y)
              (or y x)))]
    (merge-with smart-merge a b)))

(defn seq-contains? [coll target] (some #{target} coll))

(defn offset [element]
  (let [rect (.getBoundingClientRect element)]
    {:top (+ (.-top rect) (-> js/document .-body .-scrollTop))
     :left (+ (.-left rect) (-> js/document .-body .-scrollLeft))}))

; mimics the JavaScript `in` operator
(defn js-in? [obj prop]
  (and obj (or (.hasOwnProperty obj prop)
               (js-in? (.-__proto__ obj) prop))))

(defn map-values [f hmap]
  (into {} (for [[k v] hmap] [k (f v)])))

(defn keywordize-keys [hashmap]
  (into {} (for [[k v] hashmap] [(keyword k) v])))

(defn keywordize-keys-in [hashmap path]
  (if (map? (get-in hashmap path))
    (update-in hashmap path keywordize-keys)
    hashmap))
