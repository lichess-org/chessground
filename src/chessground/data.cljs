(ns chessground.data
  "Representation and manipulation of the application data"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]
            [chessground.schemas :refer [ChessState Square]]
            [schema.core :as s :refer [Str Bool]])
  (:require-macros [schema.macros :as sm :refer [defschema]]))

(sm/def defaults :- ChessState
  "Default state, overridable by user configuration"
  {:fen nil ; replaced by :chess by data/make
   :chess {} ; representation of a chess game
   :orientation "white"
   :movable {:free true ; all moves are valid - board editor
             :color "both" ; color that can move. white or black or both
             :dests nil ; valid moves. {"a2" {:a3 true :a4 true} "b1" {:a3 true :c3 true}} | nil
             :drop-off "revert" ; when a piece is dropped outside the board. "revert" | "trash"
             :drag-center true ; whether to center the piece under the cursor on drag start
             :events {:after (fn [orig dest chess] nil) ; called after the moves has been played
                      }
             }
   :shown-dests nil ; dests shown on board. We keep track of them for performance.
   :moved nil ; last move
   :selected nil ; square key of the currently moving piece. "a2" | nil
   :dragging false ; currently dragging?
   :spare-pieces false ; provide extra pieces to put on the board)
   })


(sm/defn with-fen :- ChessState
  [state :- ChessState
   fen :- Str]
  (assoc state :chess (chess/make fen)))

(sm/defn make :- ChessState
  [js-config :- js/Object]
  (let [config (-> js-config
                   common/keywordize-keys
                   (common/keywordize-keys-in [:movable])
                   (common/keywordize-keys-in [:movable :events]))]
    (-> (common/deep-merge defaults config)
        (with-fen (:fen config))
        (dissoc :fen))))

(sm/defn clear :- ChessState
  [state :- ChessState]
  (-> state
      (assoc :chess chess/clear)
      (assoc-in [:movable :dests] nil)))

(sm/defn is-movable? :- Bool
  "Piece on this square may be moved somewhere, if the validation allows it"
  [state :- ChessState
   key :- Str]
  (let [owner (chess/owner-color (:chess state) key)
        movable (:movable state)
        color (:color movable)]
    (and owner (or (= color "both") (= color owner)))))

(sm/defn can-move? :- Bool
  "The piece on orig can definitely be moved to dest"
  [state :- ChessState
   orig :- Str
   dest :- Str]
  (and (is-movable? state orig)
       (or (-> state :movable :free)
           (contains? (get-in state [:movable :dests orig]) dest))))

(sm/defn dests-of :- (s/maybe [Square])
  "List of destinations square keys for this origin"
  [state :- ChessState
   orig :- Str]
  (when (is-movable? state orig)
    (get-in state [:movable :dests orig])))
