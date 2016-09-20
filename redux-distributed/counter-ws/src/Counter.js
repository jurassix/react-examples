import React, {PropTypes} from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';
import {createSelector} from 'reselect';
import thunk from 'redux-thunk';
import compose from 'lodash/flowRight';
import {createPeer, connectToPeer, send} from './createPeer';

class Peer extends React.Component {
  static propTypes = {
    connectToPeer: PropTypes.func,isRequired,
  }

  render() {
    return (
      <div>
        <label>
          PeerID to connect to:
        </label>
        <input type="text" ref={(r) => this._input = r} />
        <button onClick={this.handleConnect}>Connect</button>
      </div>
    );
  }

  handleConnect = () => {
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
    return createPeer(action.peerOptions);
  }
  return peer;
}

const reducers = (state, action) => ({
  value: reduceValue(state.value, action),
});

const actions = {
  onIncrement: () => ({type: 'INCREMENT'}),
  onDecrement: () => ({type: 'DECREMENT'}),
  initPeer: (peerOptions) => ({type: '@@PEER_INIT', peerOptions}),
  connectToPeer: (remotePeerId) => (dispatch, getState) => {
    const {peer} = getState();
    connectToPeer(
      peer,
      remotePeerId,
      (data) => dispatch({type: 'PEER_DATA_RECEIVE', data})
    );
  },
  sendMessage: (message) => (dispatch, getState) => {
    const {peer} = getState();
    send(peer)(message);
  }
};

const selectValue = (state) => state.value;

const mapStateToProps = (state) => ({
  value: selectValue,
});

const store = createStore(
  reducers,
  {
    value: 0,
  },
  compose(
    applyMiddleware(thunk),
    typeof window === 'object' &&
    typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f,
  )
);

const PeerContainer = connect(null, actions)(<Peer />);
const CounterContainer = connect(mapStateToProps, actions)(<Counter />);

render(
  <Provider store={store}>
    <PeerContainer />
    <CounterContainer />
  </Provider>
  , document.getElementById('root')
);
