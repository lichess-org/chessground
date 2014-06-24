(defproject chessground "0.1.0"
  :plugins [[lein-cljsbuild "1.0.3"]]
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-2234"]
                 [org.clojure/core.async "0.1.303.0-886421-alpha"]]
  :cljsbuild
  {:builds
   {:dev {:source-paths ["src"]
          :compiler
          {:output-dir "generated"
           :output-to "generated/chessground.dev.js"
           :optimizations :none
           :libs ["libs/interact.js"]
           :source-map true
           }}
    :stage {:source-paths ["src"]
            :compiler
            {:output-dir "generated-stage"
             :output-to "generated-stage/chessground.stage.js"
             ; :optimizations :advanced
             :optimizations :simple
             :libs ["libs/interact.js"]
             ; :externs ["externs/misc.js"]
             :pretty-print false
             ; :source-map "generated-stage/map"
             :output-wrapper false
             :language-in :ecmascript5
             :closure-warnings {:non-standard-jsdoc :off}}}
    :prod {:source-paths ["src"]
           :compiler
           {:output-dir "generated-prod"
            :output-to "generated-prod/chessground.prod.js"
            :optimizations :advanced
            :libs ["libs/interact.js"]
            :pretty-print false
            :language-in :ecmascript5
            :closure-warnings {:non-standard-jsdoc :off}}}}})


