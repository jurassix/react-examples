import React from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore, applyMiddleware, compose} from 'redux';
import reducers from './reducers';
import thunk from 'redux-thunk';
import PeerContainer from 'redux-peerjs-store-enhancer/lib/peer/PeerContainer';
import peerStoreEnhancer from 'redux-peerjs-store-enhancer';
import CounterContainer from './CounterContainer';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducers,
  {value: 0},
  composeEnhancers(applyMiddleware(thunk), peerStoreEnhancer())
);

render(
  <Provider store={store}>
    <div>
      <PeerContainer />
      <CounterContainer />
    </div>
  </Provider>
  , document.getElementById('root')
);
