import Atom     from "kefir.atom"
import React    from "karet"
import ReactDOM from "react-dom"
import Stored   from "atom.storage"

import Todos from "./todos-control"

ReactDOM.render(<Todos todos={Stored({key: "todos-karet",
                                      value: [],
                                      Atom,
                                      debounce: 250,
                                      storage: localStorage})}/>,
                document.getElementById("app"))
