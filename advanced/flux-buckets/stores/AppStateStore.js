var ActionTypes, AppDispatcher, AppStateStore, EventEmitter, Immutable, merge, _AppStateStore, _history, _state;

Immutable = require('immutable');
merge = require("react/lib/merge")
AppDispatcher = require('../dispatcher/AppDispatcher');
ActionTypes = require('../constants/ActionTypes');
EventEmitter = require('events').EventEmitter;

_state = Immutable.fromJS({
  numClicks: 0
});

_history = Immutable.Vector();

AppStateStore = merge(EventEmitter.prototype, {
  emitChange: function() {
    return this.emit('change');
  },
  getNumClicks: function() {
    return _state.get('numClicks');
  },
  increaseNumClicks: function() {
    return this.addNumClicks(1);
  },
  decreaseNumClick: function() {
    return this.addNumClicks(-1);
  },
  addNumClicks: function(ammount) {
    var currentValue = _state.get('numClicks');
    return this.setAppState(_state.set('numClicks', currentValue + ammount));
  },
  getAppState: function() {
    return _state;
  },
  setAppState: function(newState) {
    return _state = newState;
  },
  undo: function() {
    this.setAppState(_history.last());
    return this.setHistory(_history.pop());
  },
  pushHistory: function(snapshot) {
    if (snapshot == null) {
      snapshot = this.getAppState();
    }
    return this.setHistory(_history.push(snapshot));
  },
  hasHistory: function() {
    return _history.length > 0;
  },
  setHistory: function(newHistory) {
    return _history = newHistory;
  },
  addChangeListener: function(callback) {
    return this.on('change', callback);
  },
  removeChangeListener: function(callback) {
    return this.removeListener('change', callback);
  }
});

AppStateStore.dispatchToken = AppDispatcher.register(function(payload) {
  switch (payload.type) {

    case ActionTypes.INCREASE_NUM_CLICKS:
      AppStateStore.pushHistory();
      AppStateStore.increaseNumClicks();
      return AppStateStore.emitChange();

    case ActionTypes.DECREASE_NUM_CLICKS:
      AppStateStore.pushHistory();
      AppStateStore.decreaseNumClick();
      return AppStateStore.emitChange();

    case ActionTypes.UNDO:
      AppStateStore.undo();
      return AppStateStore.emitChange();
  }
});

module.exports = AppStateStore;
