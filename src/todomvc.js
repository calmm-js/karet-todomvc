import * as L        from "partial.lenses"
import * as React    from "karet"
import * as ReactDOM from "react-dom"
import * as U        from "karet.util"
import Stored        from "atom.storage"

import Todos from "./todos-control"

const state = U.molecule({
  todos: Stored({key: "todos-karet",
                 value: [],
                 Atom: U.atom,
                 debounce: 250,
                 storage: localStorage}),
  aux: U.atom()
})

if (process.env.NODE_ENV !== "production") {
  state.log("state")
  window.state = state
  window.L = L
  window.U = U
}

ReactDOM.render(<Todos todos={U.view(["todos", L.define([])], state)}
                       aux={U.view("aux", state)}/>,
                document.getElementById("app"))
