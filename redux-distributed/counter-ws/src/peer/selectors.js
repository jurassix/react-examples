import {createSelector} from 'reselect';
import uniq from 'lodash/uniq';

export const selectPeer = (state) => state.peer || {};

export const selectPeerId = createSelector(
  selectPeer,
  (peer) => peer.id ? peer.id : 'not connected'
);

export const selectPeerConnections = createSelector(
  selectPeer,
  (peer) => peer.connections ? peer.connections : []
);

export const selectConnectedPeerIds = createSelector(
  selectPeerConnections,
  (connections) => uniq(Object.keys(connections))
);
