import React from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import compose from 'lodash/flowRight';
import PeerContainer from './PeerContainer';
import CounterContainer from './CounterContainer';
import reducers from './reducers';
import actionEnhancerMiddleware from '../actionEnhancerMiddleware';

const store = createStore(
  reducers,
  {
    value: 0,
    peer: {},
  },
  compose(
    applyMiddleware(
      thunk,
      actionEnhancerMiddleware({
        filter: ({type = ''}) => type.indexOf('@@PEER') !== 0,
        enhancer: (store, action) => {
          console.log('1', action)
          const {peer} = store.getState();
          if (action.peerId) return action;
          return {
            ...action,
            peerId: peer.id,
            ts: Date.now(),
          };
        },
      }),
      actionEnhancerMiddleware({
        filter: ({type = ''}) => type.indexOf('@@PEER') !== 0,
        enhancer: (store, action) => {
          console.log('2', JSON.stringify(action))
          const {peer} = store.getState();
          if (peer.id === action.peerId) {
            store.dispatch({
              type: '@@PEER_SEND_MESSAGE',
              message: action,
            });
          }
          return action;
        },
      })),
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
