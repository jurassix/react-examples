var React = require('react');
var Immutable = require('immutable');
var Pure = require('./Pure');

function Cell(props) {
  return React.createElement(
    React.DOM.td,
    null,
    props.cell
  );
}

module.exports = Pure(Cell);
