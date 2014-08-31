(ns chessground.chess
  "Immutable board data. Does not implement chess rules"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.fen :as forsyth]
            [chessground.premove :as premove]))

(comment
  ; Representation of a chess game:
  {"a1" {:key "a1"}
   "a2" {:key "a2" ; denormalization for UI rendering
         :piece {:color "white" ; piece color
                 :role "king" ; piece role
                 :movable? false ; can the piece be moved by the user
                 :premovable? false} ; can the piece be premoved by the user
         :check? true ; is this square in check
         :last-move? true ; is this square part of the last move
         :selected? true ; is this square selected by the user
         :move-dest? true ; is this square a move destination of the current selected square
         :premove-dest? true ; is this square a premove destination of the current selected square
         :current-premove? true ; is this square part of the current premove
         }})

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

(defn transform
  "f takes a key and a square, and returns a square"
  [chess f] (into {} (for [[k v] chess] [k (f k v)])))

(defn get-piece [chess key] (get-in chess [key :piece]))

(defn get-pieces [chess] (into {} (filter second (common/map-values :piece chess))))

(defn movable? [chess key] (:movable? (get-piece chess key)))

(defn premovable? [chess key] (:premovable? (get-piece chess key)))

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

(defn update-movables [chess turn-color movable-color premove?]
  (common/map-values
    (fn [sq]
      (if-let [p (:piece sq)]
        (-> sq
            (assoc-in [:piece :movable?]
                      (or (= movable-color "both")
                          (= movable-color turn-color (:color p))))
            (assoc-in [:piece :premovable?]
                      (and premove?
                           (= movable-color (common/opposite-color turn-color) (:color p)))))
        sq))
    chess))

(defn update-dests [chess all-dests]
  (let [orig (get-selected chess)]
    (if-let [piece (get-piece chess orig)]
      (let [move-dests (when (:movable? piece)
                         (set (get all-dests orig)))
            premove-dests (when (:premovable? piece)
                            (set (premove/possible chess orig piece)))]
        (transform chess (fn [k sq] (-> sq
                                        (common/toggle :move-dest? (contains? move-dests k))
                                        (common/toggle :premove-dest? (contains? premove-dests k))))))
      chess)))

(defn remove-dests [chess] (common/map-values #(dissoc % :move-dest? :premove-dest?) chess))

(defn set-selected [chess key all-dests]
  (-> chess
      (transform (fn [k sq] (common/toggle sq :selected? (= k key))))
      (update-dests all-dests)))

(defn set-unselected [chess]
  (remove-dests (common/map-values #(dissoc % :selected?) chess)))

(defn set-check [chess key]
  (transform chess (fn [k sq] (common/toggle sq :check? (= k key)))))

(defn set-last-move [chess [orig dest]]
  (transform chess (fn [k sq] (common/toggle sq :last-move? (or (= k orig) (= k dest))))))

(defn set-current-premove [chess keys]
  (transform chess (fn [k sq] (common/toggle sq :current-premove? (or (= k (first keys))
                                                                      (= k (second keys)))))))

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
