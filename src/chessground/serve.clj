(ns chessground.serve
  "Server for the app. Not necessary if demoing client-side pieces only."
  (:require [ring.middleware.file :as file]
            [ring.middleware.file-info :as fi]))

(def handler
  (-> (fn [_] nil)
      (file/wrap-file "./")
      (fi/wrap-file-info)))
