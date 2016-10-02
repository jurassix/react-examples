
/**

  My talk has become how to architect redux for state distribution. Deep dive on redux architecture and the extention points where they can be leveraged to make a distributed system. Our examples today use P2P because I was interessted in P2P, WS with a central DB would be fine too. Take aways should be design patterns for distribution and remote async event handling.

  extention points in redux:
  middleware -> enhances the action chains, has access to the store, can dispatch, and can evaluate state before and after reducers chains.
  reducer enhancers -> [redux-undo] HOC that takes a reducer and returns a new reducer that can handle additional actions or hold additional state


  [peer middleware initalizes peer, listens for messages to dispatches into system, collects actions to sync???] -> actions -> [peer reducer enhancers operates on top level state adding ] -> state -> UI

  state = {
    @@peer
  }
}
*/

import {send} from './peerAPI';

export const peerReducerEnhancer = (key = 'peer') => (rootReducer) =>
  (state, action) => {
    const nextState = {
      ...rootReducer(state, action),
    };
    nextState[key] = reducePeer(state[key], action);
    return nextState;
  };

export const reducePeer = (peerWrapper, action) => {
  const {peer} = peerWrapper;
  if (action.type === '@@PEER_INIT') {
    console.log('reduced init', action.peer);
    return {peer: action.peer};
  }
  if (action.type === '@@PEER_OPEN') {
    console.log('reduced open', peer, action)
    return {peer};
  }
  if (action.type === '@@PEER_CONNECTION') {
    console.log('reduced connection')
    return {peer};
  }
  if (action.type === '@@PEER_CONNECTING') {
    console.log('reduced connecting')
    return {peer};
  }
  if (action.type === '@@PEER_ERROR') {
    console.log('reduced error', action);
  }
  if (action.type === '@@PEER_DATA_RECIEVE') {
    console.log('reduced recieved', action);
  }
  if (action.type === '@@PEER_SEND_MESSAGE') {
    console.log('reduced send', action);
    send(peer)(action.message);
  }
  return peerWrapper;
}
