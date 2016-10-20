import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import App from './containers/App'
import reducer from './reducers'
import thunk from 'redux-thunk';
import PeerContainer from 'redux-peerjs-store-enhancer/lib/peer/PeerContainer';
import peerStoreEnhancer from 'redux-peerjs-store-enhancer';
import 'todomvc-app-css/index.css'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(thunk), peerStoreEnhancer())
);

render(
  <Provider store={store}>
    <div>
      <PeerContainer />
      <App />
    </div>
  </Provider>,
  document.getElementById('root')
)
