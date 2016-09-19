import React from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';
import './index.css';
import {
  connectToPeer,
  createPeer,
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

connectToPeer(peer, peerTwo);
connectToPeer(peerTwo, peer);

setTimeout(() => send(peer)({message: 'p1 hello world'}), 2000);
setTimeout(() => send(peerTwo)({message: 'p2 hello world'}), 4000);
