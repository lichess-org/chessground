(ns browser-repl
  (:require [weasel.repl :as ws-repl]))

(enable-console-print!)

(ws-repl/connect "ws://localhost:9001" :verbose true)
