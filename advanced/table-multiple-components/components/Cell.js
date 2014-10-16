/**
 * @jsx React.DOM
 */

var Cell, PureRenderMixin;

PureRenderMixin = require('react/addons').PureRenderMixin;

Cell = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    cells: React.PropTypes.number
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

