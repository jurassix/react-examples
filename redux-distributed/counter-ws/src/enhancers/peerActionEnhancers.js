import uuid from 'node-uuid';

export const ignorePeerActions = ({type = ''}) => type.indexOf('@@PEER') !== 0;

export const peerMetadataEnhancer = (dispatch, getState, action) => {
  if (action.peerId) {
    return action;
  }
  const {peer: _peer} = getState();
  return {
    ...action,
    id: uuid.v4(),
    ts: Date.now(),
    peerId: _peer.id,
  };
};

export const peerReplicateActionEnhancer = (dispatch, getState, action) => {
  const {peer: _peer} = getState();
  if (_peer.id === action.peerId) {
    dispatch({
      type: '@@PEER_SEND_MESSAGE',
      message: action,
    });
  }
  return action;
};
