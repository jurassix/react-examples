var React = require('react');
var Pure = require('./Pure');

function Cell(props) {
  return React.createElement(
    'td',
    null,
    props.cell
  );
}

module.exports = Pure(Cell);
