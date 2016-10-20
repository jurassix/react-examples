### Reducers

Reducers take the __current state__ and an __action__ describing an systems intent, and produces a __next state.__

Reducers cannot dispatch new actions. They can only respond to actions and compute the next state.

Most of your business logic of your application will be found in the reducing functions.

The __current state__ is immutable.

If the __current state__ is returned from the reducer, then all your selectors are _referentially equal_ and no UI updates will be triggered.

### API

```js
const reducer = (state, action) => nextState;
```
