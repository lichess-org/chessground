(ns chessground.schemas
  (:require [schema.core :as s :refer [Any Str Bool]])
  (:require-macros [schema.macros :as sm :refer [defschema]]))

(comment
  ;; The main benefit of schemas is that they offer code as documentation. They
  ;; are not a replacement for a type system, but can nevertheless be used for
  ;; input and output validation similar to how one would use :pre and :post
  ;; conditions. Schemas should never get in the users way, and thus in order to
  ;; use the validation capabilities you need to explicitly declare so by:
  ;;   - Using schema.core/validate or schema.core/check, e.g.

  (s/validate Square "a1") ; => "a1"
  (s/validate Square "i4") ; => Throws

  (s/check ChessPiece {:role "knight" :color "white"}) ; => nil
  (s/check ChessPiece {:role "janitor" :colr "white"})
  ; => {:role (not (#{"bishop" "rook" "queen" "pawn" "king" "knight"} "janitor"))
  ;     :color missing-required-key, :colr disallowed-key}

  ;;   - Enabling namespace wide validation as a part of running tests with
  (cemerick.cljs.test/use-fixtures :once schema-test/validate-schemas)

  ;;   - Or by forcing validation for key functions:
  (sm/defn ^:always-validate make :- Str [fen :- Str] ...)
  )

(defschema AnyMap {Any Any})

(def valid-files (set (seq "abcdefgh")))
(def valid-ranks (set (seq "12345678")))

(defschema Square
  (s/both
    (s/pred #(contains? valid-files (first %)) 'proper-file)
    (s/pred #(contains? valid-ranks (second %)) 'proper-rank)))

(defschema ChessPiece
  {:role  (s/enum "pawn" "rook" "knight" "bishop" "queen" "king")
   :color (s/enum "black" "white")})

(defschema BoardState {Square ChessPiece})

(defschema PiecesMap {:pieces BoardState})

(defschema MoveMap {Square [Square]})

(defschema ChessState
  {:fen   (s/maybe Str)
   :chess (s/either PiecesMap {})
   :orientation (s/enum "white" "black")
   :movable {:free Bool
             :color (s/enum "white" "black" "both")
             :dests (s/maybe MoveMap)
             :drop-off (s/enum "revert" "trash")
             :drag-center Bool
             :events {Keyword js/Function}}
   :selected (s/maybe Str)
   :dragging Bool
   :spare-pieces Bool
   :moved (s/maybe Str)
   :showed-dests [Str]})
