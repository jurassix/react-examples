var React = require('react');
var Immutable = require('immutable');
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
    React.DOM.tr,
    null,
    props.cells.map(createCell).toArray()
  );
}

module.exports = Pure(Row);
