import * as L        from "partial.lenses"
import * as React    from "karet"
import * as ReactDOM from "react-dom"
import * as U        from "karet.util"
import Stored        from "atom.storage"

import Todos from "./todos-control"

ReactDOM.render(<Todos todos={U.view(L.define([]),
                                     Stored({key: "todos-karet",
                                             value: [],
                                             Atom: U.atom,
                                             debounce: 250,
                                             storage: localStorage}))}/>,
                document.getElementById("app"))
