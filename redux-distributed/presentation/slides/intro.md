_slides + examples_ found under `redux-distrbuted/`

https://github.com/jurassix/react-examples

### Topics

 - prior art
 - redux
 - leveraging redux to simplify distributed systems

### Prior art

Systems leveraging the original FB flux - from experience

lots of deficiencies
 - no good patterns for working on dependent app state at once -> waitFor - unordered state management
 - run into circular references between stores
 - reducers were essentially part of each store - tightly coupled
 - had a Domain heavy store interface [EventEmitter]- not functional more OO
 - mutations were easy and excepted
  - once all your mutations were completed you called an event to update the UI - backbone anyone?
 - tight coupling to components - mostly due to lack of patterns and best practices
  - import actions and stores directly into a Component
  - listen to changes and ForceUpdate etc
  - components are not reusable in other applications
 - but...I built cool stuff and it was a good design

Redux is the refinement of the above deficiencies

lots of improvements
 - no longer Stores plural, we have a single global app state
 - our Store is also no longer a Domain object with accessors etc, it's just a simple JSON Object literal
 - reducers are now completely independent but still have knowledge of Global App State structure
 - reducers are completely in your control to order and manage as you need  - no eventing just a simple function reduce(state, action)
  - reducers know how to make changes to your state
 - components are segmented now into Containers and Presentational concerns
  - components are now reusable in other applications  - f(x) = y
 - patterns are easily identifiable (later talk about code reviews, boilerplate is great to filter out improper code)
