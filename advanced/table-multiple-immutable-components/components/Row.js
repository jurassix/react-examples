var React = require('react');
var Cell = require('./Cell');
var Pure = require('./Pure');

function createCell(cell, index) {
  return React.createElement(
    Cell,
    {
      cell: cell,
      key: 'cell-' + index,
    }
  );
}

function Row(props) {
  return React.createElement(
    'tr',
    null,
    props.cells.map(createCell)
  );
}

module.exports = Pure(Row);
