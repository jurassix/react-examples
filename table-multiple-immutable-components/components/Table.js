/**
 * @jsx React.DOM
 */

var Immutable, ImmutableRenderMixin, Row, Table;

Immutable = require('immutable');

ImmutableRenderMixin = require('react-immutable-render-mixin');

Row = require('./Row');

Table = React.createClass({
  mixins: [ImmutableRenderMixin],
  propTypes: {
    rows: function(value) {
      return value instanceof Immutable.Vector;
    }
  },
  getDefaultProps: function() {
    return {
      rows: Immutable.Vector()
    };
  },
  render: function() {
    return (
      <table>
        {this.props.rows.map(this.renderRow).toArray()}
      </table>
    );
  },
  renderRow: function(row, index) {
    return (
      <Row cells={row.get('cells')} key={'row-'+index} />
    );
  }
});

module.exports = Table;
