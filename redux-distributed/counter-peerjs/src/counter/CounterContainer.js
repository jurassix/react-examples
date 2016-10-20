import {connect} from 'react-redux';
import Counter from './Counter';
import {selectValue} from './selectors';
import {onIncrement, onDecrement} from './actions';

const actions = {onIncrement, onDecrement};
const mapStateToProps = (state) => ({value: selectValue(state)});

const CounterContainer = connect(mapStateToProps, actions)(Counter);

export default CounterContainer;
