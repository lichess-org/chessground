(defproject chessground "0.1.0"
  :plugins [[lein-cljsbuild "1.0.3"]]
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-2268"]
                 [org.clojure/core.async "0.1.303.0-886421-alpha"]]
  :cljsbuild
  {:builds
   {:dev {:source-paths ["src"]
          :compiler
          {:output-dir "generated"
           :output-to "generated/chessground.dev.js"
           :optimizations :none
           :source-map true
           }}
    :prod {:source-paths ["src"]
           :compiler
           {:output-dir "generated-prod"
            :output-to "generated-prod/chessground.prod.js"
            :optimizations :advanced
            :externs ["libs/interact.js"]
            :pretty-print false
            :output-wrapper false
            ; :language-in :ecmascript5
            ; :language-out :ecmascript5
            :closure-warnings {:externs-validation :off
                               :non-standard-jsdoc :off}}}}})
