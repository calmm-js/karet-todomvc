import * as L     from "partial.lenses"
import * as React from "karet"
import * as U     from "karet.util"

import {hash} from "./window"

const isCompleted = L.get("completed")
const isActive    = U.complement(isCompleted)

const filter = p => (x, i) => p(x) ? i : void 0

const routes =
  [{hash: "#/",          filter: filter(() => true),  title: "All"},
   {hash: "#/active",    filter: filter(isActive),    title: "Active"},
   {hash: "#/completed", filter: filter(isCompleted), title: "Completed"}]

const route = U.or(U.find(U.whereEq({hash}), routes), routes[0])

function focus(e) {
  if (e) {
    e.focus()
    e.selectionStart = e.value.length
  }
}

function Entry({editing, todo, value}) {
  const exit = () => editing.set(false)
  function save(e) {
    const newTitle = e.target.value.trim()
    exit()
    if (newTitle)
      todo.modify(L.set("title", newTitle))
    else
      todo.remove()
  }
  return (
    <input className="edit"
           type="text"
           onBlur={save}
           key="x"
           ref={focus}
           value={U.ifte(U.isNil(value), U.view("title", todo), value)}
           onChange={U.getProps({value})}
           onKeyDown={e => e.key === "Enter"  && save(e)
                        || e.key === "Escape" && exit()}/>
  )
}

function Todo({todo, editing, value}) {
  const checked = U.view("completed", todo)
  return (
    <li className={U.cns(U.ift(U.view("completed", todo), "completed"),
                         U.ift(editing, "editing"))}>
      <input className="toggle"
             type="checkbox"
             hidden={editing}
             checked={checked}
             onChange={U.getProps({checked})}/>
      <label className="view"
             onDoubleClick={() => editing.set(true)}>
        {U.view("title", todo)}
      </label>
      <button className="destroy" onClick={() => todo.remove()}/>
      {U.ift(editing, <Entry {...{editing, todo, value}}/>)}
    </li>
  )
}

const NewTodo = ({onEntry, value}) =>
  <input className="new-todo"
         type="text"
         autoFocus
         placeholder="What needs to be done?"
         value={value}
         onChange={U.getProps({value})}
         onKeyDown={({key, target}) => {
           const title = target.value.trim()
           if (key === "Enter" && title) {
             onEntry(title)
             target.value = ""
           }
         }}/>

const Filters = () =>
  <ul className="filters">
    {routes.map(r =>
      <li key={r.title}>
        <a className={U.ift(U.equals(U.view("hash", route), r.hash), "selected")}
           href={r.hash}>
          {r.title}
        </a>
      </li>)}
  </ul>

export default ({todos, aux}) => {
  const allCompleted =
    U.view(L.foldTraversalLens(L.and, [L.elems, "completed"]), todos)
  const clear = () => todos.modify(L.remove([L.elems, L.when(isCompleted)]))
  const onEntry = title => todos.modify(U.append({completed: false, title}))
  const count = U.pipe(L.countIf(isActive, L.elems),
                       n => `${n} item${n === 1 ? "" : "s"} left`)
  const editing = U.view(
    [L.props("editing", "title"),
     L.rewrite(L.get(L.props("editing"))),
     "editing"],
    aux)
  const title = U.view("title", aux)
  return (
    <div>
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <NewTodo onEntry={onEntry}
                   value={U.view(["newTodo", L.defaults("")], aux)}/>
        </header>
        <section className="main">
          <input type="checkbox"
                 className="toggle-all"
                 hidden={U.isEmpty(todos)}
                 checked={allCompleted}
                 onChange={U.getProps({checked: allCompleted})}/>
          <ul className="todo-list">
            {U.seq(todos,
                   U.lift(L.modify)([L.define([]), L.elems],
                                    U.view("filter", route)),
                   U.mapCached(i =>
                     <Todo key={i}
                           todo={U.view(i, todos)}
                           editing={U.view(L.is(i), editing)}
                           value={title}/>))}
          </ul>
        </section>
        <footer className="footer" hidden={U.isEmpty(todos)}>
          <span className="todo-count">{count(todos)}</span>
          <Filters/>
          <button className="clear-completed"
                  onClick={clear}
                  hidden={U.all(isActive, todos)}>
            Clear completed
          </button>
        </footer>
      </section>
      <footer className="info">
        <p>Double-click to edit a todo</p>
        <p><a href="https://github.com/calmm-js/karet-todomvc">GitHub</a></p>
      </footer>
    </div>
  )
}
