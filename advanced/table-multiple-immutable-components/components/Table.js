var React = require('react');
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
      'table',
      null,
      React.createElement(
        'tbody',
        null,
        props.rows.map(createRow)
      )
    );
  }
}

module.exports = {
  PureTable: Pure.PureRender(makeTable(Row.PureRow)),
  ImmutableTable: Pure.ImmutableRender(makeTable(Row.ImmutableRow)),
};
