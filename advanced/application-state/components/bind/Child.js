/**
 * @jsx React.DOM
 */

var Child;

Child = React.createClass({
  displayName: 'Child',
  propTypes: {
    updateHeader: React.PropTypes.func,
    header: React.PropTypes.string
  },
  getDefaultProps: function() {
    return {
      updateHeader: function() {},
      header: null
    };
  },
  render: function() {
    return (
      <input
        type='text'
        placeholder='Bind: enter a header'
        value={this.props.header}
        onChange={this.props.updateHeader} />
    );
  }
});

module.exports = Child;
