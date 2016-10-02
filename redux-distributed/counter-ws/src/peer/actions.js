import {createPeer, connectToPeer as connect, send} from './peerAPI';

export const initPeer = (peerOptions) => (dispatch, getState) => dispatch({
  type: '@@PEER_INIT',
  peer: createPeer(
    peerOptions,
    (id) => dispatch({type: '@@PEER_OPEN', id}),
    (conn) => dispatch({type: '@@PEER_CONNECTION', conn}),
    (action) => {
      let {peer: peer} = getState();
      if (action.peerId === peer.id) {
        return;
      }
      dispatch({type: '@@PEER_DATA_RECEIVE', action});
      dispatch(action);
    },
    (err) => dispatch({type: '@@PEER_ERROR', err}),
  ),
});

export const connectToPeer = (remotePeerId) => (dispatch, getState) => {
  const {peer: peer} = getState();
  dispatch({type: '@@PEER_CONNECTING', peer, remotePeerId});
  connect(
    peer,
    remotePeerId,
    (id) => dispatch({type: '@@PEER_OPEN', id}),
    (action) => {
      let {peer: peer} = getState();
      if (action.peerId === peer.id) {
        return;
      }
      dispatch({type: '@@PEER_DATA_RECEIVE', action});
      dispatch(action);
    },
    (err) => dispatch({type: '@@PEER_ERROR', err}),
  );
};

export const sendMessage = (message) => (dispatch, getState) => {
  const {peer: peer} = getState();
  send(peer)(message);
};
