/**
 * @jsx React.DOM
 */

var Child, Immutable;

Immutable = require('immutable');

Child = React.createClass({
  displayName: 'Child',
  propTypes: {
    header: function(value) {
      return value instanceof Immutable.Map;
    }
  },
  getDefaultProps: function() {
    return {
      header: Immutable.Map()
    };
  },
  render: function() {
    return (
      <input
        type='text'
        placeholder='Cursor: enter a header'
        value={this.props.header.get('text')}
        onChange={this.updateHeader} />
    );
  },
  updateHeader: function(event) {
    var newHeader;
    newHeader = event.currentTarget.value;
    this.props.header.set('text', newHeader);
  }
});

module.exports = Child;

