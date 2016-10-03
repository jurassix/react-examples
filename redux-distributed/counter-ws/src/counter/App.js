import React from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import compose from 'lodash/flowRight';
import PeerContainer from '../peer/PeerContainer';
import CounterContainer from './CounterContainer';
import reducers from './reducers';
import actionEnhancerMiddleware from '../enhancers/actionEnhancerMiddleware';
import {peerReducerEnhancer} from '../peer/peerReducerEnhancer';
import {ignorePeerActions, peerMetadataEnhancer, peerReplicateActionEnhancer} from '../peer/peerActionEnhancers';

const store = createStore(
  peerReducerEnhancer(reducers),
  {
    value: 0,
    peer: {_peer: {}},
  },
  compose(
    applyMiddleware(
      thunk,
      actionEnhancerMiddleware({
        filter: ignorePeerActions,
        enhancer: peerReplicateActionEnhancer,
      }),
      actionEnhancerMiddleware({
        filter: ignorePeerActions,
        enhancer: peerMetadataEnhancer,
      })
    ),
    typeof window === 'object' &&
    typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f,
  )
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
