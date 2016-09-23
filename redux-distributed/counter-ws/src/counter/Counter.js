import React, {PropTypes} from 'react';

const Counter = ({value, onIncrement, onDecrement}) => (
  <div>
    <button onClick={onDecrement}> - </button>
    <span>{value}</span>
    <button onClick={onIncrement}> + </button>
  </div>
);

Counter.propTypes = {
  value: PropTypes.number,
  onIncrement: PropTypes.func,
  onDecrement: PropTypes.func,
}

export default Counter;
