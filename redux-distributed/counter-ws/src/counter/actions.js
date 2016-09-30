import {createPeer, connectToPeer as connect, send} from '../createPeer';

export const onIncrement = () => (dispatch, getState) => {
  const action = {type: 'INCREMENT'};
  dispatch(action);
  // sendMessage(action)(dispatch, getState); // we are not travelling through middleware so FUK
}

export const onDecrement = () => (dispatch, getState) => {
  const action = {type: 'DECREMENT'};
  dispatch(action);
  // sendMessage(action)(dispatch, getState);
}

export const initPeer = (peerOptions) => (dispatch, getState) => dispatch({
  type: '@@PEER_INIT',
  peer: createPeer(
    peerOptions,
    (id) => dispatch({type: '@@PEER_OPEN', id}),
    (conn) => dispatch({type: '@@PEER_CONNECTION', conn}),
    (action) => {
      let {peer} = getState();
      if (action.peerId === peer.id) {
        console.log('IGNORE');
        return;
      }
      dispatch({type: '@@PEER_DATA_RECEIVE', action});
      dispatch(action);
    }
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
