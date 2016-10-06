import React from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import PeerContainer from '../peer/PeerContainer';
import CounterContainer from './CounterContainer';
import reducers from './reducers';
import actionEnhancerMiddleware from '../enhancers/actionEnhancerMiddleware';
import peerReducerEnhancer from '../enhancers/peerReducerEnhancer';
import {ignorePeerActions, peerMetadataEnhancer, peerReplicateActionEnhancer} from '../enhancers/peerActionEnhancers';
import peerStoreEnhancer from '../enhancers/peerStoreEnhancer';

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
