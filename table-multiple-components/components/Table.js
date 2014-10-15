/**
 * @jsx React.DOM
 */

module.exports = Table

var PureRenderMixin, Row, Table;

PureRenderMixin = require('react/addons').PureRenderMixin;

Row = require('./Row');

Table = React.createClass({
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
      <Row cells={row.cells} key={'row-'+index} />
    );
  }
});

module.exports = Table;
