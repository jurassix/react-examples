### enhancers 3.X Redux

_Note: everything is changing in 4.x. Read more here: https://github.com/reactjs/redux/pull/1702_

Enhancers are powerful escape hatches provided by Redux that allow developers
to easily preform cross-cutting concerns and instrumentation on existing applications
without modification.

This is powerful stuff!

##### The enhancers

 - __middleware__
  - __action__ enhancer
 - __reducer__ enhancer
 - __store__ enhancer

### reducer enhancer

A simple function that wraps the existing __rootReducer__ and returns a new reducer.

##### API

```js
function reducerEnhancer(rootReducer) {
  return (state, action) => {
    const nextState = rootReducer(state, action);
    return nextState;
  }
}
```

##### Uses

 - Can inject new reducers into your application without internal modification
 - Can effect all reduced state in a single location
 - _redux-devtools-instrument_ uses this to store before and after snapshots of your _ state -> nextState_
   - https://github.com/zalmoxisus/redux-devtools-instrument/blob/master/src/instrument.js

GET MORE EXAMPLES TO TALK ABOUT

### action enhancer

Middleware that allows you to

### putting them together

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

### store enhancer - a little tidy up
