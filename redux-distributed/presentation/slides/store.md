### store

The core abstraction to Redux is encapsulated into a store.

 - the store knows about your state
 - knows how to transform your state
 - and knows how to inform your application of state changes.

The Store knows these things about your application because the `createStore()` API
includes all this info to build the Store.

#### API

```js
const store = {
  dispatch: (o) => {},
  subscribe: (f) => {},
  getState: () => {},
};
```

_That's a pretty big abstraction for a 3 method object._

`dispatch` - how you introduce change into the system.

`subscribe` - how you are informed of the changes to the state.

`getState` - how you can access your state.

#### Example

ref: https://github.com/reactjs/redux#the-gist

```js
function reducer(state = 0, action) {
  switch (action.type) {
  case 'INCREMENT':
    return state + 1
  case 'DECREMENT':
    return state - 1
  default:
    return state
  }
}

const store = createStore(reducer, 0, enhancer);

const unsubscribe = store.subscribe(() => console.log(store.getState()));

store.dispatch({ type: 'INCREMENT' })
// 1
store.dispatch({ type: 'INCREMENT' })
// 2
store.dispatch({ type: 'DECREMENT' })
// 1
```
