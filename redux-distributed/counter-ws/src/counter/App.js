import React from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import PeerContainer from '../peer/PeerContainer';
import CounterContainer from './CounterContainer';
import reducers from './reducers';
import devToolsEnhancer from '../enhancers/devToolsEnhancer';
import actionEnhancerMiddleware from '../enhancers/actionEnhancerMiddleware';
import peerReducerEnhancer from '../enhancers/peerReducerEnhancer';
import {ignorePeerActions, peerMetadataEnhancer, peerReplicateActionEnhancer} from '../enhancers/peerActionEnhancers';
import peerStoreEnhancer from '../enhancers/peerStoreEnhancer';

const store = createStore(
  reducers,
  {value: 0},
  peerStoreEnhancer(thunk)
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
