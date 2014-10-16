var ActionTypes, AppDispatcher, AppStateStore, EventEmitter, merge, _state;

merge = require("react/lib/merge")
AppDispatcher = require('../dispatcher/AppDispatcher');
ActionTypes = require('../constants/ActionTypes');
EventEmitter = require('events').EventEmitter;

_state = {
  header: ''
};

AppStateStore = merge(EventEmitter.prototype, {
  emitChange: function() {
    return this.emit('change');
  },
  getAppState: function() {
    return _state;
  },
  setHeader: function(newHeader) {
    return _state.header = newHeader;
  },
  addChangeListener: function(callback) {
    return this.on('change', callback);
  }
});

AppStateStore.dispatchToken = AppDispatcher.register(function(payload) {
  switch (payload.type) {
    case ActionTypes.UPDATE_HEADER:
      AppStateStore.setHeader(payload.value);
      return AppStateStore.emitChange();
  }
});

module.exports = AppStateStore;
