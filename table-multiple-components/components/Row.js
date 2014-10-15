/**
 * @jsx React.DOM
 */

var Cell, PureRenderMixin, Row;

PureRenderMixin = require('react/addons').PureRenderMixin;

Cell = require('./Cell');

Row = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    cells: React.PropTypes.array
  },
  getDefaultProps: function() {
    return {
      cells: []
    };
  },
  render: function() {
    return (
      <tr>
        {this.props.cells.map(this.renderCell)}
      </tr>
    );
  },
  renderCell: function(cell, index) {
    return (
      <Cell cell={cell} key={'cell-'+index} />
    );
  }
});

module.exports = Row;
