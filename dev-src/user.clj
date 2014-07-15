(ns user
  (:require weasel.repl.websocket)
  (:require cemerick.piggieback))

(defn start-repl []
  (cemerick.piggieback/cljs-repl
    :repl-env (weasel.repl.websocket/repl-env
                :ip "127.0.0.1" :port 9001)))

