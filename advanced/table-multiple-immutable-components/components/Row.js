var React = require('react');
var Cell = require('./Cell');
var Pure = require('./Pure');

function makeRow(CellType) {
  function createCell(cell, index) {
    return React.createElement(
      CellType,
      {
        cell: cell,
        key: 'cell-' + index,
      }
    );
  }

  return function Row(props) {
    return React.createElement(
      'tr',
      null,
      props.cells.map(createCell)
    );
  }
}

module.exports = {
  PureRow: Pure.PureRender(makeRow(Cell.PureCell)),
  ImmutableRow: Pure.ImmutableRender(makeRow(Cell.ImmutableCell)),
};
