### enhancers 3.X Redux

_ Note: everything is changing in 4.x. Read more here: https://github.com/reactjs/redux/pull/1702 _

Enhancers are powerful escape hatches provided by Redux that allow developers
to easily preform _cross-cutting concerns and instrumentation_ on existing applications
without modification.

This is powerful stuff!

### The enhancers

 - __middleware__
  - __action__ enhancer
 - __reducer__ enhancer
 - __store__ enhancer

### Middleware [action enhancer]

- ref: http://redux.js.org/docs/advanced/Middleware.html

Middleware that allows you to intercept all dispatched actions and instrument as needed.

#### API

```js
const middleware = options => {
  return store => next => action => {
    return next(action);
  }
}
```

`store` - Redux store

`next` - Invokes the _next_ Middleware function

`action` - The dispatched action

#### Uses

 - Action enhancers are great when you want to listen in on all actions dispatched across the entire system.
 - _redux-thunk_ uses it to allow action creators access to the store.
  - ref:  https://github.com/gaearon/redux-thunk/blob/master/src/index.js
 - Provide Logging of all actions
 - Proxy Actions
 - Mute Actions
 - Manipulate Actions at a single point in your App
  - give then Timestamps or other metadata
 - Apply arbitrary transformations to actions
 - You can even dispatch additional actions as a result of an action

#### Examples
 - ref: https://github.com/jurassix/redux-action-enhancer-middleware/blob/master/actionEnhancerMiddleware.js
 - ref: https://github.com/gaearon/redux-thunk/blob/master/src/index.js

### reducer enhancer

A simple function that wraps the existing __rootReducer__ and returns a _new reducer_.

#### API

```js
function reducerEnhancer(rootReducer) {
  return (state, action) => {
    const nextState = rootReducer(state, action);
    return nextState;
  }
}
```

#### Uses

 - Can inject new reducers into your application without internal modification
 - Can effect all reduced state in a single location
 - _redux-devtools-instrument_ uses this to store before and after snapshots of your _ state -> nextState_
   - https://github.com/zalmoxisus/redux-devtools-instrument/blob/master/src/instrument.js#L576
 - _redux-undo_ uses this to travel backwards and forwards in user history
    - https://github.com/omnidan/redux-undo/blob/master/src/reducer.js#L119

### Store Enhancers

This is the most powerful enhancer.

Complete access to entire system:

 - Apply middleware
 - Apply reducer enhancer
 - Modify initial state _(not recommended)_
 - Modify the store
  - proxy api
  - add new api

#### API

```js
function storeEnhancer() {
  return (createStore) => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState);
    return store;
  }
}
```

`createStore` - Creates a Redux store

`reducer` - Apps rootReducer

`preloadedState` - Apps initial state

#### Uses

 - Completely re-instrument the behavior of an existing app without modifying any internal behavior
 - Setup WebSocket communication channels that automatically dispatch data into the system

### Putting them all together

```js
const store = createStore(
  peerReducerEnhancer(reducers),
  {
    value: 0,
    peer: {},
  },
  compose(
    applyMiddleware(
      thunk,
      actionEnhancerMiddleware({
        filter: ignorePeerActions,
        enhancer: peerReplicateActionEnhancer,
      }),
      actionEnhancerMiddleware({
        filter: ignorePeerActions,
        enhancer: peerMetadataEnhancer,
      })
    ),
    devToolsEnhancer
  )
);
```
