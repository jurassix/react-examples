var ActionTypes, AppDisptcher;

AppDisptcher = require('../dispatcher/AppDispatcher');

ActionTypes = require('../constants/ActionTypes');

module.exports = {
  increaseNumClicks: function() {
    return AppDisptcher.dispatch({
      type: ActionTypes.INCREASE_NUM_CLICKS
    });
  },
  decreaseNumClicks: function() {
    return AppDisptcher.dispatch({
      type: ActionTypes.DECREASE_NUM_CLICKS
    });
  },
  undo: function() {
    return AppDisptcher.dispatch({
      type: ActionTypes.UNDO
    });
  }
};
