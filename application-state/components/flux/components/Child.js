/**
 * @jsx React.DOM
 */

var Child, AppStateAction;

AppStateAction = require('../actions/AppStateAction');

Child = React.createClass({
  displayName: 'Child',
  propTypes: {
    header: React.PropTypes.string
  },
  getDefaultProps: function() {
    return {
      header: ''
    };
  },
  render: function() {
    return (
      <input
        type='text'
        placeholder='Flux: enter a header'
        value={this.props.header}
        onChange={this.updateHeader} />
    );
  },
  updateHeader: function(event) {
    var newHeader = event.currentTarget.value;
    AppStateAction.updateHeader(newHeader);
  }
});

module.exports = Child;

