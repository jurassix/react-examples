import React from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore, applyMiddleware, compose} from 'redux';
import reducers from './reducers';
import thunk from 'redux-thunk';
import CounterContainer from './CounterContainer';
import pouchdbStoreEnhancer from 'redux-pouchdb-store-enhancer';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducers,
  {value: 0},
  composeEnhancers(applyMiddleware(thunk), pouchdbStoreEnhancer())
);

render(
  <Provider store={store}>
    <CounterContainer />
  </Provider>
  , document.getElementById('root')
);
