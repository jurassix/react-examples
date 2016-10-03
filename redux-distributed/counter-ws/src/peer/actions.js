import {createPeer, connectToPeer as connect, send} from './peerAPI';

export const initPeer = (peerOptions) => (dispatch, getState) => dispatch({
  type: '@@PEER_INIT',
  peer: createPeer(
    peerOptions,
    (id) => dispatch({type: '@@PEER_OPEN', id}),
    (conn) => dispatch({type: '@@PEER_CONNECTION', conn}),
    (action) => {
      const {peer: _peer} = getState();
      if (action.peerId === _peer.id) {
        return;
      }
      dispatch({type: '@@PEER_DATA_RECEIVE', action});
      dispatch(action);
    },
    (err) => dispatch({type: '@@PEER_ERROR', err}),
  ),
});

export const connectToPeer = (remotePeerId) => (dispatch, getState) => {
  const {peer} = getState();
  console.log('STATE', getState(), '_PEER', peer._peer);
  dispatch({type: '@@PEER_CONNECTING', peer, remotePeerId});
  connect(
    peer._peer,
    remotePeerId,
    (id) => dispatch({type: '@@PEER_OPEN', id}),
    (action) => {
      const {peer} = getState();
      if (action.peerId === peer._peer.id) {
        return;
      }
      dispatch({type: '@@PEER_DATA_RECEIVE', action});
      dispatch(action);
    },
    (err) => dispatch({type: '@@PEER_ERROR', err}),
  );
};

export const sendMessage = (message) => (dispatch, getState) => {
  const {peer} = getState();
  send(peer._peer)(message);
};
