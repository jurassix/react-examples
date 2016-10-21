### Reducers

Reducers take the __current state__ and an __action__ describing an systems intent, and produces a __next state.__

 - Reducers cannot dispatch new actions.
 - They can only respond to actions and compute the next state.

_Most of your business logic of your application will be found in the reducing functions._

 - The __current state__ is immutable.
 - If the __current state__ is returned from the reducer
  - then all your selectors are _referentially equal_ and do not recompute
  - and no UI updates will be triggered

### API

```js
const reducer = (state, action) => nextState;
```

### Example

ref: https://github.com/reactjs/redux/blob/master/examples/todomvc/src/reducers/todos.js

```js
export default function todos(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        {
          id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
          completed: false,
          text: action.text
        },
        ...state
      ]

    case DELETE_TODO:
      return state.filter(todo =>
        todo.id !== action.id
      )

    case EDIT_TODO:
      return state.map(todo =>
        todo.id === action.id ?
          { ...todo, text: action.text } :
          todo
      )

    case COMPLETE_TODO:
      return state.map(todo =>
        todo.id === action.id ?
          { ...todo, completed: !todo.completed } :
          todo
      )

    case COMPLETE_ALL:
      const areAllMarked = state.every(todo => todo.completed)
      return state.map(todo => ({
        ...todo,
        completed: !areAllMarked
      }))

    case CLEAR_COMPLETED:
      return state.filter(todo => todo.completed === false)

    default:
      return state
  }
}
```
