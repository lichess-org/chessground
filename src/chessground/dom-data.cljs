(ns chessground.dom-data
  "Store data in dom element - like $.data")

(def exp
  "Chessground namespace used to add a unique property to dom elements"
  (str "chessground-" (-> (.random js/Math) (.toString 36) (.substring 2))))

(def uid
  "Unique ID generator (increment)"
  (atom 0))

(def data-store
  "Data store used to associate objects to dom elements"
  (atom {}))

(defn fetch [el key]
  "Alternative to jquery .data(key): retrieve an object associated to a dom element"
  (when-let [id (aget el exp)]
    (get-in @data-store [id key])))

(defn store [el key value]
  "Alternative to of jquery .data(key, value): set an object associated to a dom element"
  (if-let [id (aget el exp)]
    (swap! data-store assoc-in [id key] value)
    (let [setid (swap! uid inc)]
      (aset el exp setid)
      (swap! data-store assoc-in [setid key] value))))

(defn remove-el [el]
  "Remove a dom element, and ensure that any data associated with in store is removed too"
  (when (.-parentNode el)
    (-> el .-parentNode (.removeChild el))
    (when-let [id (aget el exp)]
      (swap! data-store dissoc id))))
