/**
 * @jsx React.DOM
 */

var Child, Immutable, Parent;

Immutable = require('immutable');

Child = require('./Child');

Parent = React.createClass({
  displayName: 'Parent',
  getDefaultProps: function() {
    return {
      appState: Immutable.fromJS({
        header: {
          text: ''
        }
      })
    };
  },
  getInitialState: function() {
    return {
      cursor: Immutable.Map().cursor()
    };
  },
  componentDidMount: function() {
    return this.setState({
      cursor: this.props.appState.cursor(this.onTransaction)
    });
  },
  onTransaction: function(newData, oldData) {
    return this.setState({
      cursor: newData.cursor(this.onTransaction)
    });
  },
  render: function() {
    return (
      <div>
        <h2>{this.state.cursor.getIn(['header', 'text'])}</h2>
        <Child header={this.state.cursor.get('header')}/>
      </div>
    );
  }
});

module.exports = Parent;
