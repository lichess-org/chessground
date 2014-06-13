(ns chessground.macros)

(defmacro bench
  "Times the execution of forms, discarding their output and returning
a long in nanoseconds."
  ([& forms]
    `(let [start# (.getTime (new js/Date))]
       ~@forms
       (- (.getTime (new js/Date)) start#))))
