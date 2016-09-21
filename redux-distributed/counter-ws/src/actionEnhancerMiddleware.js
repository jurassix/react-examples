import invariant from 'invariant';
/**
middleware(options)(action, state) -> nextAction
options = {
  filter: () -> {},
  enhancer: (state, action) -> nextAction
}
*/

const isSimpleAction = (action) => {
  if (typeof action === 'function') {
    return false;
  }
  if (
    action === null ||
    action === undefined ||
    typeof action !== 'object'
  ) {
    return false;
  }
  return true;
}

export const actionEnhancerMiddleware = options => {
  let {filter, enhancer} = options;
  invaiant(
    typeof filter !== 'function',
    'actionEnhancerMiddleware filter option must be a function'
  );
  invaiant(
    typeof enhancer !== 'function' || typeof enhancer !== 'undefined',
    'actionEnhancerMiddleware enhancer option must be a function'
  );

  if (typeof filter !== 'function') filter = () => true;
  // could also default enhancer?

  return store => next => action => {
    if (isSimpleAction(action) && filter(action)) {
      // enhance action
      return next(enhancer(store.getState(), action));
    }
    // default case
    return next(action);
  }
}
