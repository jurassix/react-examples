var React = require('react');
var Immutable = require('immutable');
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
      React.DOM.tr,
      null,
      props.cells.map(createCell).toArray()
    );
  }
}

module.exports = {
  PureRow: Pure.PureRender(makeRow(Cell.PureCell)),
  ImmutableRow: Pure.ImmutableRender(makeRow(Cell.ImmutableCell)),
};
