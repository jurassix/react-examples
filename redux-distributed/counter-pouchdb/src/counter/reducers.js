
const reduceValue = (value = 0, action) => {
  if (action.type === 'INCREMENT') {
    return value + 1;
  }
  if (action.type === 'DECREMENT') {
    return value - 1;
  }
  return value;
}

const combineReducers = (state, action) => ({
  value: reduceValue(state.value, action),
});

export default combineReducers;
