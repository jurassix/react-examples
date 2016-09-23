import React from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import compose from 'lodash/flowRight';
import PeerContainer from './PeerContainer';
import CounterContainer from './CounterContainer';
import reducers from './reducers';

const store = createStore(
  reducers,
  {
    value: 0,
    peer: {},
  },
  compose(
    applyMiddleware(thunk),
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
