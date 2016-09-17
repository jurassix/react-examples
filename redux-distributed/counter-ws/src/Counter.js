import React from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';

const Counter = ({value, dispatch}) => {
  <div>
    <button onClick={() => dispatch({type: 'DECREMENT'})}>-</button>
    <span>{value}</span>
    <button onClick={() => dispatch({type: 'INCREMENT'})}>+</button>
  </div>
};

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

const connectedCounter = connect()(<Counter />);
render(
  <Provider store={store}>
    <Counter />
  </Provider>
  , document.getElementById('root')
);
