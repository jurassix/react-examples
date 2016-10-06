import uuid from 'node-uuid';

export const ignorePeerActions = ({type = ''}) => type.indexOf('@@PEER') !== 0;

export const peerMetadataEnhancer = (dispatch, getState, action) => {
  if (action.peerId) {
    return action;
  }
  const {peer} = getState();
  return {
    ...action,
    id: uuid.v4(),
    ts: Date.now(),
    peerId: peer._peer.id,
  };
};

export const peerReplicateActionEnhancer = (dispatch, getState, action) => {
  const {peer} = getState();
  if (peer._peer.id === action.peerId) {
    dispatch({
      type: '@@PEER_SEND_MESSAGE',
      message: action,
    });
  }
  return action;
};
