import {createSelector} from 'reselect';

export const selectValue = (state) => state.value;

export const selectPeer = (state) => {
  console.log('select peer', state);
  return state.peer || {};
}

// export const selectPeerId = createSelector(
//   selectPeer,
//   (peer) => {
//     console.log('select peer id', peer);
//     return peer.id ? peer.id : 'not connected';
//   }
// );
//
// export const selectPeerConnections = createSelector(
//   selectPeer,
//   (peer) => {
//     console.log('select connections', peer);
//     return peer.connections ? peer.connections : []
//   }
// );

export const selectPeerId = (state) => state.peer ? state.peer.id ? state.peer.id : 'not connected' : 'not connected';

export const selectPeerConnections = (state) => state.peer ? state.peer.connections ? state.peer.connections : {} : {}

// export const selectConnectedPeerIds = createSelector(
//   selectPeerConnections,
//   (connections) => Object.keys(connections)
// );

export const selectConnectedPeerIds = (state) => Object.keys(selectPeerConnections(state))
