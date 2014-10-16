/**
 * @jsx React.DOM
 */
var FluxBuckets, Immutable;
require('react-raf-batching').inject();
Immutable = require('immutable');
FluxBuckets = require('./components/FluxBuckets');

React.renderComponent( <FluxBuckets />, document.querySelector('#app'));
