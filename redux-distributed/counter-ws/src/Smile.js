import React from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';
import './index.css';

const Counter = ({value, dispatch}) => (
  <div>
    :smile:
  </div>
);

const reducer = (state = {value: 0}, action) => {
  if (action.type === 'INCREMENT') {
    return {
      ...state,
      value: state.value + 1,
    };
  } else if (action.type === 'DECREMENT') {
    return {
      ...state,
      value: state.value - 1,
    };
  }
  return state;
}

const store = createStore(reducer, {value: 0});

const mapStateToProps = (state) => state;
const ConnectedCounter = connect(mapStateToProps)(Counter);
render(
  <Provider store={store}>
    <ConnectedCounter />
  </Provider>
  , document.getElementById('root')
);
