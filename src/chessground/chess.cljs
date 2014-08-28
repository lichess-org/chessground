(ns chessground.chess
  "Immutable board data. Does not implement chess rules"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.fen :as forsyth]))

(comment
  ; Representation of a chess game:
  {"a1" {:key "a1"}
   "a2" {:key "a2"
         :piece {:color "white" :role "king"}
         :check? true
         :last-move? true
         :selected? true
         :dragging? true
         :dest? true}})

(def colors ["white" "black"])
(def roles ["pawn" "rook" "knight" "bishop" "queen" "king"])

(def clear
  (into {} (for [rank (range 1 9)
                 file ["a" "b" "c" "d" "e" "f" "g" "h"]
                 :let [key (str file rank)]]
             [key {:key key}])))

(defn make [fen]
  (merge-with
    #(assoc %1 :piece %2)
    clear
    (forsyth/parse (if (= fen "start") forsyth/default fen))))

(defn get-piece [chess key] (get-in chess [key :piece]))

(defn get-pieces [chess] (into {} (filter second (for [[k v] chess] [k (:piece v)]))))

(comment
  {"white" {"pawn" 3 "queen" 1}
   "black" {"bishop" 2}})
(defn material-diff [chess]
  (reduce (fn [diff [role value]]
            (if (= value 0) diff
              (assoc-in diff [(if (> value 0) "white" "black") role] (Math/abs value))))
          {"white" {} "black" {}}
          (reduce (fn [acc [_ {color :color role :role}]]
                    (update-in acc [role] (if (= color "white") inc dec)))
                  {}
                  (get-pieces chess))))

(defn remove-piece [chess key] (update-in chess [key] dissoc :piece))

(defn put-piece [chess key piece] (update-in chess [key] assoc :piece piece))

(defn set-pieces [chess changes]
  (reduce (fn [c [key p]]
            (if p (put-piece c key p) (remove-piece c key)))
          chess changes))

(defn- transform
  "f takes a key and a square, and returns a square"
  [chess f]
  (into {} (for [[k v] chess] [k (f k v)])))

(defn set-check [chess key]
  (transform chess (fn [k sq] (if (= k key)
                                (assoc sq :check? true)
                                (dissoc sq :check?)))))

(defn set-last-move [chess [orig dest]]
  (transform chess (fn [k sq] (if (or (= k orig) (= k dest))
                                (assoc sq :last-move? true)
                                (dissoc sq :last-move?)))))

(defn set-dests [chess dests]
  (transform chess (fn [k sq] (if (common/seq-contains? dests k)
                                (assoc sq :dest? true)
                                (dissoc sq :dest?)))))

(defn move-piece [prev [orig dest]]
  "Return nil if orig and dest make no sense"
  (or (when (not= orig dest)
        (when-let [piece (get-piece prev orig)]
          (pp (-> prev
                  (set-check nil)
                  (set-last-move [orig dest])
                  (remove-piece orig)
                  (put-piece dest piece)))))
      prev))

(defn owner-color [chess key]
  "Returns the color of the piece on this square key, or nil"
  (:color (get-piece chess key)))
