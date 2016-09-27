import {createPeer, connectToPeer as connect, send} from '../createPeer';

export const onIncrement = () => (dispatch, getState) => {
  const action = {type: 'INCREMENT'};
  dispatch(action);
  sendMessage(action)(dispatch, getState);
}

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
    (action) => {
      dispatch({type: '@@PEER_DATA_RECEIVE', action});
      dispatch(action);
    },
    (err) => dispatch({type: '@@PEER_ERROR', err}),
  );
};

export const sendMessage = (message) => (dispatch, getState) => {
  const {peer} = getState();
  send(peer)(message);
};
