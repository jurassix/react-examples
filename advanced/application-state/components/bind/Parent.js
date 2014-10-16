/**
 * @jsx React.DOM
 */

var Child, Parent;

Child = require('./Child');

Parent = React.createClass({
  displayName: 'Parent',
  getDefaultProps: function() {
    return {
      header: ''
    };
  },
  render: function() {
    return (
      <div>
        <h2>{this.props.header}</h2>
        <Child updateHeader={this.updateHeader} header={this.props.header} />
      </div>
    );
  },
  updateHeader: function(event) {
    var newHeader = event.currentTarget.value;
    this.setProps({
      header: newHeader
    });
  }
});

module.exports = Parent;
