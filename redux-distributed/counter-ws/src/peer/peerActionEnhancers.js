import uuid from 'lodash-uuid';

export const ignorePeerActions = ({type = ''}) => type.indexOf('@@PEER') !== 0;

export const peerMetadataEnhancer = (key = 'peer') => (getState, dispatch, action) => {
  if (action.peerId) {
    return action;
  }
  const state = getState();
  const {peer = {}} = state[key];
  return {
    ...action,
    id: uuid(),
    ts: Date.now(),
    peerId: peer.id,
  };
};

export const peerReplicateActionEnhancer = (key = 'peer') => (getState, dispatch, action) => {
  const state = getState();
  const {peer = {}} = state[key];
  if (peer.id === action.peerId) {
    dispatch({
      type: '@@PEER_SEND_MESSAGE',
      message: action,
    });
  }
  return action;
};
