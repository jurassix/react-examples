/**
 * @jsx React.DOM
 */

var Cell, Immutable, ImmutableRenderMixin, Row;

Immutable = require('immutable');

ImmutableRenderMixin = require('react-immutable-render-mixin');

Cell = require('./Cell');

Row = React.createClass({
  mixins: [ImmutableRenderMixin],
  propTypes: {
    cells: function(value) {
      return value instanceof Immutable.Vector;
    }
  },
  getDefaultProps: function() {
    return {
      cells: Immutable.Vector()
    };
  },
  render: function() {
    return (
      <tr>
        {this.props.cells.map(this.renderCell).toArray()}
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
