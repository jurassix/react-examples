import React, {PropTypes} from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import {createSelector} from 'reselect';
import thunk from 'redux-thunk';
import compose from 'lodash/flowRight';
import {createPeer, connectToPeer, send} from './createPeer';

class Peer extends React.Component {
  static propTypes = {
    peerId: PropTypes.string,
    initPeer: PropTypes.func.isRequired,
    connectToPeer: PropTypes.func.isRequired,
  }

  componentWillMount() {
    this.props.initPeer();
  }

  render() {
    const {peerId} = this.props;
    return (
      <div>
        <h4>PeerID is {peerId || 'not initialized'}</h4>
        <label>
          PeerID to connect to:
        </label>
        <input type="text" ref={(r) => this._input = r} />
        <button onClick={this.handleConnect}>Connect</button>
      </div>
    );
  }

  handleConnect = () => {
    if (this._input.value.trim() === '') return;
    this.props.connectToPeer(this._input.value);
    this._input.value = '';
  }
}

const Counter = ({value, onIncrement, onDecrement}) => (
  <div>
    <button onClick={onDecrement}>-</button>
    <span>{value}</span>
    <button onClick={onIncrement}>+</button>
  </div>
);

const reduceValue = (value = 0, action) => {
  if (action.type === 'INCREMENT') {
    return value + 1;
  }
  if (action.type === 'DECREMENT') {
    return value - 1;
  }
  return value;
}

const reducePeer = (peer, action) => {
  if (action.type === '@@PEER_INIT') {
    return action.peer;
  }
  return peer;
}

const reducers = (state, action) => ({
  value: reduceValue(state.value, action),
  peer: reducePeer(state.peer, action),
});

const actions = {
  onIncrement: () => ({type: 'INCREMENT'}),
  onDecrement: () => ({type: 'DECREMENT'}),
  initPeer: (peerOptions) => ({type: '@@PEER_INIT', peer: createPeer(peerOptions)}),
  connectToPeer: (remotePeerId) => (dispatch, getState) => {
    const {peer} = getState();
    dispatch({type: '@@PEER_CONNECTING', peer, remotePeerId});
    connectToPeer(
      peer,
      remotePeerId,
      (data) => dispatch({type: '@@PEER_DATA_RECEIVE', data})
    );
  },
  sendMessage: (message) => (dispatch, getState) => {
    const {peer} = getState();
    send(peer)(message);
  }
};

const selectValue = (state) => state.value;
const selectPeerId = (state) => state.peer !== undefined ? state.peer.id : 'not connected';

const mapStateToProps = (state) => ({
  value: selectValue(state),
  peerId: selectPeerId(state),
});

const store = createStore(
  reducers,
  {
    value: 0,
    peerId: 'not connected',
  },
  compose(
    applyMiddleware(thunk),
    typeof window === 'object' &&
    typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f,
  )
);

const PeerContainer = connect(mapStateToProps, actions)(Peer);
const CounterContainer = connect(mapStateToProps, actions)(Counter);

render(
  <Provider store={store}>
    <div>
      <PeerContainer />
      <CounterContainer />
    </div>
  </Provider>
  , document.getElementById('root')
);
