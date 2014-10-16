/**
 * @jsx React.DOM
 */

var AppStateAction, AppStateStore, Bucket, FluxBuckets, Immutable;

Immutable = require('immutable');

Bucket = require('./Bucket');

AppStateStore = require('../stores/AppStateStore');

AppStateAction = require('../actions/AppStateAction');

FluxBuckets = React.createClass({
  propTyps: {
    appState: React.PropTypes.shape({
      numClicks: React.PropTypes.number
    })
  },
  getDefaultProps: function() {
    return {
      appState: AppStateStore.getAppState()
    };
  },
  getInitialState: function() {
    return {
      buckets: 1
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
        <button className="btn btn-link" onClick={this.addBucket}>Add Bucket</button>
        <button className="btn btn-link" onClick={this.removeBucket} disabled={(this.state.buckets - 1) <= 0}>Remove Bucket</button>
        <button className="btn btn-link" onClick={this.undo} disabled={!AppStateStore.hasHistory()}>Undo</button>
        <hr />
        {Immutable.Range(0, this.state.buckets).map(this.renderBucket).toArray()}
      </div>
    );
  },
  renderBucket: function(index) {
    return Bucket({
      "key": index,
      "appState": this.props.appState
    });
  },
  addBucket: function(event) {
    return this.setState({
      buckets: this.state.buckets + 1
    });
  },
  removeBucket: function(event) {
    return this.setState({
      buckets: this.state.buckets - 1
    });
  },
  undo: function(event) {
    return AppStateAction.undo();
  }
});

module.exports = FluxBuckets;

