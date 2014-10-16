/**
 * @jsx React.DOM
 */

var Child, Immutable, Parent, AppStateStore;

Child = require('./Child');
AppStateStore = require('../stores/AppStateStore');

Parent = React.createClass({
  displayName: 'Parent',
  getDefaultProps: function() {
    return {
      appState: AppStateStore.getAppState()
    };
  },
  componentDidMount: function() {
    return AppStateStore.addChangeListener((function(_this) {
      return function() {
        return _this.setProps({
          appState: AppStateStore.getAppState()
        });
      };
    })(this));
  },
  render: function() {
    return (
      <div>
        <h2>{this.props.appState.header}</h2>
        <Child header={this.props.appState.header}/>
      </div>
    );
  }
});

module.exports = Parent;
