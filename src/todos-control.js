import * as L    from "partial.lenses"
import * as R    from "ramda"
import K, * as U from "karet.util"
import React     from "karet"

import {hash} from "./window"

import * as M from "./todos-meta"

const routes =
  [{hash: "#/",          filter: () => true,         title: "All"},
   {hash: "#/active",    filter: M.Todo.isActive,    title: "Active"},
   {hash: "#/completed", filter: M.Todo.isCompleted, title: "Completed"}]

const route = K(hash, h => routes.find(r => r.hash === h) || routes[0])

const Entry = ({editing, todo}) => {
  const focus = e => {
    e.focus()
    e.selectionStart = e.value.length
  }
  const exit = () => editing.set("")
  const save = e => {
    const newTitle = e.target.value.trim()
    exit()
    newTitle ? todo.view(M.Todo.title).set(newTitle) : todo.remove()
  }
  return <input className="edit"
                type="text"
                onBlur={save}
                key="x"
                ref={c => c && focus(c)}
                defaultValue={todo.view(M.Todo.title)}
                onKeyDown={e => e.key === "Enter"  && save(e)
                             || e.key === "Escape" && exit()}/>
}

const Todo = ({todo, editing = U.atom("")}) =>
  <li {...U.classes(K(todo, todo =>
                      L.get(M.Todo.completed, todo) && "completed"),
                    editing)}>
    <input className="toggle"
           type="checkbox"
           hidden={editing}
           {...U.bind({checked: todo.view(M.Todo.completed)})}/>
    <label className="view" onDoubleClick={() => editing.set("editing")}>
      {todo.view(M.Todo.title)}
    </label>
    <button className="destroy" onClick={() => todo.remove()}/>
    {U.ift(editing, <Entry {...{editing, todo}}/>)}
  </li>

const NewTodo = ({onEntry}) =>
  <input className="new-todo"
         type="text"
         autoFocus
         placeholder="What needs to be done?"
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
        <a {...U.classes(K(route, c => c.hash === r.hash && "selected"))}
           href={r.hash}>
          {r.title}
        </a>
      </li>)}
  </ul>

export default ({todos, all = todos.view(M.Todos.all)}) =>
  <div>
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <NewTodo onEntry={
          title => all.modify(M.All.append(M.Todo.create({title})))}/>
      </header>
      <section className="main">
        <input type="checkbox"
               className="toggle-all"
               hidden={K(all, M.All.isEmpty)}
               {...U.bind({checked: all.view(M.All.allDone)})}/>
        <ul className="todo-list">
          {U.seq(K(route, all, ({filter}, all) =>
                   R.flatten(all.map((it, i) => filter(it) ? [i] : []))),
                 U.mapCached(i => <Todo key={i} todo={all.view(i)}/>))}
        </ul>
      </section>
      <footer className="footer" hidden={K(all, M.All.isEmpty)}>
        <span className="todo-count">
          {K(all, R.pipe(M.All.numActive, n =>
                         `${n} item${n === 1 ? "" : "s"} left`))}
        </span>
        <Filters/>
        <button className="clear-completed"
                onClick={() => all.modify(M.All.clean)}
                hidden={K(all, M.All.allActive)}>
          Clear completed
        </button>
      </footer>
    </section>
    <footer className="info">
      <p>Double-click to edit a todo</p>
      <p><a href="https://github.com/calmm-js/karet-todomvc">GitHub</a></p>
    </footer>
  </div>
