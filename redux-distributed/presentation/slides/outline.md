## outline

### introduction

### redux
  - global application state
  - unidirectional flow
  - referential equality checks
  - containers vs components
  - store
   - getState
   - dispatch
   - subscribe
  - actions
   - serializable
   - action creators can orchestrate complex logic flows
   - dispatch data into the system
   - should not contain business logic
   - DEMO
    - async/await
  - selectors
   - access state as fine grained as possible
   - build up many levels of selectors for maximum efficiency
   - think presentational transformations
    - data should be transformed to simplify components as much as possible
   - DEMO
    - show memoization realtime
    - show
  - reducers
   - contains the business logic of your application
   - cannot dispatch additional actions from a reducer
   - should not mutate state
    - produce new object references to state that has changed   
  - components
   - containers connect to redux
   - presentational components
    - clean API defined entirely with props
    - can contain state - todomvc stateful input, dispatches on 'Enter'
    - has no data transforms
    - has no business logic

## enhancers
 - provides cross-cutting concerns into your application
 - i tend to think more belongs in enhancers than people realize

### action enhancers
 - middleware
 - redux-thunk
 - dynamically change actions or fire multiple actions in response to an action (implement state transition: loading, done)
 - should create middleware to expose async data into your system
  - WebSockets
  - Polling
  - offline cacheing
  - DB syncing
  - even eventing like determining if offline

### reducer enhancers
 - capture before and after state snapshots
 - inject alternate handling of actions
 - stop all state transitions by always returning the current state

### store enhancers
 - most powerful enhancer
 - allows access to manipulate the store object (getState, dispatch, subscribe)
 - allows access to manipulate initial state
 - allows access to introduce action enhancers
 - allows access to introduce reducer enhancers

## distributed systems
 - imposter alert
  - these are experiments please be safe in the real world
  - today is a thought exercise and clear demonstrations of the power of enhancers and Redux
 - network latency
 - offline capable
 - realtime
 - atomic clocks
 - transactions - firebase
 - further reading - @aphyr, @joe??

### cap theorem

### CFDS

### erlang - Joe
 - message passing systems

### time traveling algorithms MIT lectures

## DEMO
 - capture state and distribute it via WebSockets to all clients
 - counter (no issues of value + 1 with actions), drag and drop, realtime distribution of actions to peers via WebRTC data connections (carve out certain events as perfect for realtime)
 - add offline capability - detect offline, enhance actions, store all actions in PouchDB
 - introduce server side reducer to allow for action replay and time traveling state propagation
 - combined demo of WebRTC for DND reordering of todos, PouchDB store for offline capability and offline/online syncing, WebSocket syncing for appState and push actions to server for appState calculation and broadcasting.
