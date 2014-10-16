/**
 * @jsx React.DOM
 */

var Cell, Immutable, ImmutableRenderMixin;

Immutable = require('immutable');

ImmutableRenderMixin = require('react-immutable-render-mixin');

Cell = React.createClass({
  mixins: [ImmutableRenderMixin],
  propTypes: {
    cell: React.PropTypes.number
  },
  getDefaultProps: function() {
    return {
      cell: 0
    };
  },
  render: function() {
    return (
      <td>
        {this.props.cell}
      </td>
    );
  }
});

module.exports = Cell;

