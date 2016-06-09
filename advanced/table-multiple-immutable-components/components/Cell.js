var React = require('react');
var Pure = require('./Pure');

function Cell(props) {
  return React.createElement(
    'td',
    null,
    props.cell
  );
}

module.exports = {
  PureCell: Pure.PureRender(Cell),
  ImmutableCell: Pure.ImmutableRender(Cell),
};
