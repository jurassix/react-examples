import {createSelector} from 'reselect';
import uniq from 'lodash.uniq';

export const selectPeer = (state) => state.peer || {};

export const selectPeerId = createSelector(
  selectPeer,
  (peer) => {
    const {_peer} = peer;
    return _peer.id ? _peer.id : 'not connected';
  }
);

export const selectPeerConnections = createSelector(
  selectPeer,
  (peer) => {
    const {_peer} = peer;
    return _peer.connections ? _peer.connections : []
  }
);

// export const selectPeerId = (state) => state.peer ? state.peer.id ? state.peer.id : 'not connected' : 'not connected';
//
// export const selectPeerConnections = (state) => state.peer ? state.peer.connections ? state.peer.connections : {} : {}

export const selectConnectedPeerIds = createSelector(
  selectPeerConnections,
  (connections) => uniq(Object.keys(connections))
);

// export const selectConnectedPeerIds = (state) => Object.keys(selectPeerConnections(state))
