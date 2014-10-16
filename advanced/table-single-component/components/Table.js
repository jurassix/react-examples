/**
 * @jsx React.DOM
 */

var PureRenderMixin, Table;

PureRenderMixin = require('react/addons').PureRenderMixin;

Table = React.createClass({
  displayName: 'Table',
  mixins: [PureRenderMixin],
  propTypes: {
    rows: React.PropTypes.array
  },
  getDefaultProps: function() {
    return {
      rows: []
    };
  },
  render: function() {
    return (
      <table>
        {this.props.rows.map(this.renderRow)}
      </table>
    );
  },
  renderRow: function(row, index) {
    return (
      <tr key= "row-#{index}">
      {row.cells.map(this.renderCell)}
      </tr>
    );
  },
  renderCell: function(cell, index) {
    return (
      <td key= "cell-#{index}">
        {cell}
      </td>
    );
  }
});

module.exports = Table;
