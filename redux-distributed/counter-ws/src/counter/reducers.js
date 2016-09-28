
const reduceValue = (value = 0, action) => {
  if (action.type === 'INCREMENT') {
    return value + 1;
  }
  if (action.type === 'DECREMENT') {
    return value - 1;
  }
  return value;
}

const reducePeer = (peer, action) => {
  if (action.type === '@@PEER_INIT') {
    console.log('reduced init', action.peer);
    return action.peer;
  }
  if (action.type === '@@PEER_OPEN') {
    console.log('reduced open', peer, action)
    // return {...peer};
  }
  if (action.type === '@@PEER_CONNECTION') {
    console.log('reduced connection')
    // return {...action.conn};
  }
  if (action.type === '@@PEER_CONNECTING') {
    console.log('reduced connecting')
    // return {...action.conn};
  }
  if (action.type === '@@PEER_DATA_RECIEVE') {
    console.log('reduced recieved', action);
  }
  return peer;
}

const combineReducers = (state, action) => ({
  value: reduceValue(state.value, action),
  peer: reducePeer(state.peer, action),
});

export default combineReducers;
