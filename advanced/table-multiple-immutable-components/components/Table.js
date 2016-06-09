var React = require('react');
var Immutable = require('immutable');
var Row = require('./Row');
var Pure = require('./Pure');

function createRow(row, index) {
  return React.createElement(
    Row,
    {
      cells: row.get('cells'),
      key: 'row-' + index,
    }
  );
}

function Table(props) {
  return React.createElement(
    React.DOM.table,
    null,
    props.rows.map(createRow).toArray()
  );
}

module.exports = Pure(Table);
