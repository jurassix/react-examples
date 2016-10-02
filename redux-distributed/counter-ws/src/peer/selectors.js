import {createSelector} from 'reselect';
import uniq from 'lodash.uniq';

export const selectPeer = (key = 'peer') => (state) => state[key] || {};

export const selectPeerId = (key = 'peer') => createSelector(
  selectPeer(key),
  (peerWrapper) => {
    const {peer} = peerWrapper;
    return peer.id ? peer.id : 'not connected';
  }
);

export const selectPeerConnections = (key = 'peer') => createSelector(
  selectPeer(key),
  (peerWrapper) => {
    const {peer} = peerWrapper;
    return peer.connections ? peer.connections : []
  }
);

// export const selectPeerId = (state) => state.peer ? state.peer.id ? state.peer.id : 'not connected' : 'not connected';
//
// export const selectPeerConnections = (state) => state.peer ? state.peer.connections ? state.peer.connections : {} : {}

export const selectConnectedPeerIds = (key = 'peer') => createSelector(
  selectPeerConnections(key),
  (connections) => uniq(Object.keys(connections))
);

// export const selectConnectedPeerIds = (state) => Object.keys(selectPeerConnections(state))
