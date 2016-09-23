
export const peerMiddleware = store => {
    const {peer} = store.getState();

    return next => action => next(action);
  }
}


const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}
