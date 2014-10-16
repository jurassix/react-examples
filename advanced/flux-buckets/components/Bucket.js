/**
 * @jsx React.DOM
 */

var AppStateAction, AppStateStore, Bucket, Immutable, ImmutableRenderMixin, tweenState;

Immutable = require('immutable');

ImmutableRenderMixin = require('react-immutable-render-mixin');

tweenState = require('react-tween-state');

AppStateStore = require('../stores/AppStateStore');

AppStateAction = require('../actions/AppStateAction');

Bucket = React.createClass({
  mixins: [ImmutableRenderMixin, tweenState.Mixin],
  propTypes: {
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
      localNumClicks: 0,
      'font-size': 60
    };
  },
  componentWillReceiveProps: function(nextProps) {
    return this.startFontSizeTween();
  },
  componentDidMount: function() {
    return this.startFontSizeTween();
  },
  render: function() {
    return (
      <fieldset className= "bucket row well" onClick= {this.addItem}>
        <div className= "col-xs-4">
          <label>Application State Total:</label>
          <h2 className= "number-of-clicks text-primary" style={this.getFontSize()}>{this.props.appState.get('numClicks')}</h2>
        </div>
        <div className= "col-xs-4">
          <label>Component State Total:</label>
          <h2 className= "number-of-clicks large-font">{this.state.localNumClicks}</h2>
        </div>
        <div className= "col-xs-2">
          <button className= "btn btn-default btn-lg" onClick={this.handleAddClick}>Add to Bucket</button>
          <button className= "btn btn-default btn-lg" onClick={this.handleRemoveClick}>Remove from Bucket</button>
        </div>
      </fieldset>
    );
  },
  getFontSize: function() {
    return {
      'font-size': this.getTweeningValue('font-size') + 'px'
    };
  },
  handleAddClick: function() {
    AppStateAction.increaseNumClicks();
    return this.increaseLocalNumClicks();
  },
  handleRemoveClick: function() {
    AppStateAction.decreaseNumClicks();
    return this.decreaseLocalNumClicks();
  },
  increaseLocalNumClicks: function() {
    return this.addLocalNumClicks(1);
  },
  decreaseLocalNumClicks: function() {
    return this.addLocalNumClicks(-1);
  },
  addLocalNumClicks: function(ammount) {
    return this.setState({
      localNumClicks: this.state.localNumClicks + ammount
    });
  },
  startFontSizeTween: function() {
    return this.tweenState('font-size', {
      easing: tweenState.easingTypes.easeInOutBack,
      duration: 250,
      beginValue: 30,
      endValue: 60
    });
  }
});

module.exports = Bucket;

