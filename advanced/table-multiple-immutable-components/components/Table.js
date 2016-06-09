var React = require('react');
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
    'table',
    null,
    React.createElement(
      'tbody',
      null,
      props.rows.map(createRow)
    )
  );
}

module.exports = Pure(Table);
