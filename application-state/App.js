/**
 * @jsx React.DOM
 */

require('react-raf-batching').inject();

BindParent = require('./components/bind/Parent');

CursorParent = require('./components/cursor/Parent');

React.renderComponent(<BindParent />, document.querySelector('#app'));

React.renderComponent(<CursorParent />, document.querySelector('#app2'));
