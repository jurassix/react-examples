import React from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';
import './index.css';
import {
  createPeer,
  registerOpen,
  registerError,
  registerConnect,
  connectToPeer,
  send,
} from './createPeer';

const Counter = ({value, dispatch}) => (
  <div>
    <button onClick={() => dispatch({type: 'DECREMENT'})}>-</button>
    <span>{value}</span>
    <button onClick={() => dispatch({type: 'INCREMENT'})}>+</button>
  </div>
);

const reducer = (state = {value: 0}, action) => {
  if (action.type === 'INCREMENT') {
    return {
      ...state,
      value: state.value + 1,
    };
  } else if (action.type === 'DECREMENT') {
    return {
      ...state,
      value: state.value - 1,
    };
  }
  return state;
}

const store = createStore(reducer, {value: 0});

const mapStateToProps = (state) => state;
const ConnectedCounter = connect(mapStateToProps)(Counter);
render(
  <Provider store={store}>
    <ConnectedCounter />
  </Provider>
  , document.getElementById('root')
);

const peer = createPeer('one');
const peerTwo = createPeer('two');

registerOpen(peer, (id) => {
  console.log('@@open', id);
  connectToPeer(peerTwo, peer.id, (data) => console.log('@@DATA', JSON.stringify(data)));
});
// registerError(peer, (err) => console.error('@@error', err));
registerConnect(peer, (data) => console.log('@@data', JSON.stringify(data)));

// registerOpen(peerTwo, (id) => console.log('@@open2', id));
// registerError(peerTwo, (err) => console.error('@@error2', err));
// registerConnect(peerTwo, (data) => console.log('@@data2', data));

// connectToPeer(peer, peerTwo.id, (data) => console.log('@@DATA', data));

setTimeout(() => send(peer)({message: 'hello world'}), 5000);
setTimeout(() => send(peerTwo)({message: 'hello world'}), 5000);
