var React = require('react');
var Immutable = require('immutable');
var Row = require('./Row');
var Pure = require('./Pure');

function makeTable(RowType) {
  function createRow(row, index) {
    return React.createElement(
      RowType,
      {
        cells: row.get('cells'),
        key: 'row-' + index,
      }
    );
  }

  return function Table(props) {
    return React.createElement(
      React.DOM.table,
      null,
      React.createElement(
        React.DOM.tbody,
        null,
        props.rows.map(createRow).toArray()
      )
    );
  }
}

module.exports = {
  PureTable: Pure.PureRender(makeTable(Row.PureRow)),
  ImmutableTable: Pure.ImmutableRender(makeTable(Row.ImmutableRow)),
};
