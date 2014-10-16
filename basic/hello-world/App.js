/**
 * @jsx React.DOM
 */

var HelloWorld, React;

React = require('react');

require('react-raf-batching').inject();

HelloWorld = require('./components/HelloWorld');

React.renderComponent(<HelloWorld />, document.querySelector('#app'));

