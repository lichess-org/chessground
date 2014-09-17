(ns chessground.common
  "Shared utilities for the library")

(defn pp [& exprs]
  (doseq [expr exprs] (.log js/console (clj->js expr)))
  (first exprs))

(def ^private files "abcdefgh")
(def ^private file-numbers #js {"a" 1 "b" 2 "c" 3 "d" 4 "e" 5 "f" 6 "g" 7 "h" 8})
(def ^private file-inverts #js {"a" "h" "b" "g" "c" "f" "d" "e" "e" "d" "f" "c" "g" "b" "h" "a"})

(defn key->pos [key]
  #js [(aget file-numbers (aget key 0)) (js/parseInt (aget key 1))])

(defn pos->key [pos]
  (str (get files (dec (aget pos 0))) (aget pos 1)))

(defn opposite-color [color] (case color
                               "white" "black"
                               "black" "white"
                               nil))

(defn invert-key [k]
  (str (aget file-inverts (aget k 0))
       (- 9 (js/parseInt (aget k 1)))))

(defn deep-merge [a b]
  (letfn [(smart-merge [x y]
            (if (and (map? x) (map? y))
              (merge x y)
              (or y x)))]
    (merge-with smart-merge a b)))

(defn seq-contains? [coll target] (some #(== target %) coll))

(defn offset [element]
  (let [rect (.getBoundingClientRect element)]
    {:top (+ (.-top rect) (-> js/document .-body .-scrollTop))
     :left (+ (.-left rect) (-> js/document .-body .-scrollLeft))}))

; mimics the JavaScript `in` operator
(defn js-in? [obj prop]
  (and obj (or (.hasOwnProperty obj prop)
               (js-in? (.-__proto__ obj) prop))))

(def transform-prop
  "Fun fact: this won't work if chessground is included in the <head>
   Because the <body> element must exist at the time this code runs."
  (do (or (.-body js/document) (throw "chessground must be included in the <body> tag!"))
      (let [style (-> js/document .-body .-style)
            props ["transform" "webkitTransform" "mozTransform" "oTransform"]]
        (first (or (filter #(js-in? style %) props) props)))))

(defn translate [x y] (str "translate3d(" x "px, " y "px, 0)"))

(def touch-device? (js-in? js/document "ontouchstart"))

(defn map-values [f hmap]
  (into {} (for [[k v] hmap] [k (f v)])))

(defn- convert-keys [hashmap f]
  (when hashmap (into {} (for [[k v] hashmap] [(f k) v]))))

(def keywordize-keys #(convert-keys % keyword))

(def stringify-keys #(convert-keys % name))
