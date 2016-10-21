### state

Redux adopts a _Global App State_ model to represent the _state_ of your application.

 - Global App State is not original to Redux
 - Om [ClojureScript] had it before FLUX
  - _I'm sure many others existed in this space too_

_Global App State is not unique to Redux but it's a critical design decision._

 Without a Global App State leveraging a deterministic UI via React is non-trivial

  - think backbone
  - think backbone collections backing React
  - imagine your state spread throughout your application
   - components creating it!
   - stores changing it!
   - or both! or worse!
   - fix this bug?
   - what else did I break
   - I don't even know what to re-test...

Redux simply maps a single state directly to the entire view layer. That's what a Global App State gets you for free.

### Two key abstractions

 1. Global App State structure matches your __API layer__
 1. Reselected State structure matches your __Presentational Layer__

To remove this duality model of state representation we need a new abstraction. _GraphQL_ via _Relay_ is making strides here. Same with _Om Next_.

This, _to me_, is one of the next great improvements for the UI state management.
