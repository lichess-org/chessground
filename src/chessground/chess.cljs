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

(defn- transform
  "f takes a key and a square, and returns a square"
  [chess f] (into {} (for [[k v] chess] [k (f k v)])))

(defn get-piece [chess key] (get-in chess [key :piece]))

(defn get-pieces [chess] (into {} (filter second (common/map-values :piece chess))))

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

(defn get-selected [chess] (->> chess (filter (comp :selected? second)) first first))

(defn update-dests [chess all-dests]
  (let [dests (set (when-let [orig (get-selected chess)]
                     (get all-dests orig)))]
    (transform chess (fn [k sq] (if (contains? dests k)
                                  (assoc sq :dest? true)
                                  (dissoc sq :dest?))))))

(defn remove-dests [chess] (common/map-values #(dissoc % :dest?) chess))

(defn set-selected [chess key all-dests]
  (-> chess
      (transform (fn [k sq] (if (= k key) (assoc sq :selected? true) (dissoc sq :selected?))))
      (update-dests all-dests)))

(defn set-unselected [chess]
  (remove-dests (common/map-values #(dissoc % :selected?) chess)))

(defn set-check [chess key]
  (transform chess (fn [k sq] (if (= k key)
                                (assoc sq :check? true)
                                (dissoc sq :check?)))))

(defn set-last-move [chess [orig dest]]
  (transform chess (fn [k sq] (if (or (= k orig) (= k dest))
                                (assoc sq :last-move? true)
                                (dissoc sq :last-move?)))))

(defn move-piece [chess [orig dest]]
  "Return nil if orig and dest make no sense"
  (or (when (not= orig dest)
        (when-let [piece (get-piece chess orig)]
          (-> chess
              (set-check nil)
              set-unselected
              remove-dests
              (set-last-move [orig dest])
              (remove-piece orig)
              (put-piece dest piece))))
      chess))

(defn owner-color [chess key]
  "Returns the color of the piece on this square key, or nil"
  (:color (get-piece chess key)))
