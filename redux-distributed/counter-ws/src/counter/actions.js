import {createPeer, connectToPeer as connect, send} from '../createPeer';

export const onIncrement = () => ({type: 'INCREMENT'});

export const onDecrement = () => ({type: 'DECREMENT'});

export const initPeer = (peerOptions) => (dispatch, getState) => dispatch({
  type: '@@PEER_INIT',
  peer: createPeer(
    peerOptions,
    (id) => dispatch({type: '@@PEER_OPEN', id}),
    (conn) => dispatch({type: '@@PEER_CONNECTION', conn})
  ),
});

export const connectToPeer = (remotePeerId) => (dispatch, getState) => {
  const {peer} = getState();
  dispatch({type: '@@PEER_CONNECTING', peer, remotePeerId});
  connect(
    peer,
    remotePeerId,
    (id) => dispatch({type: '@@PEER_OPEN', id}),
    (conn) => dispatch({type: '@@PEER_CONNECTION', conn}),
    (data) => dispatch({type: '@@PEER_DATA_RECEIVE', data}),
    (err) => dispatch({type: '@@PEER_ERROR', err}),
  );
};

export const sendMessage = (message) => (dispatch, getState) => {
  const {peer} = getState();
  send(peer)(message);
};
