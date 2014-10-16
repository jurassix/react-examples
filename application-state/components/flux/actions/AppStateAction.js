var ActionTypes, AppDisptcher;

AppDisptcher = require('../dispatcher/AppDispatcher');
ActionTypes = require('../constants/ActionTypes');

module.exports = {
  updateHeader: function(newHeader) {
    return AppDisptcher.dispatch({
      type  : ActionTypes.UPDATE_HEADER,
      value : newHeader
    });
  }
};
