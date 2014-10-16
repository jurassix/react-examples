/**
 * @jsx React.DOM
 */

require('react-raf-batching').inject();
BindParent = require('./components/bind/Parent');
CursorParent = require('./components/cursor/Parent');
FluxParent = require('./components/flux/components/Parent');

React.renderComponent(<BindParent />, document.querySelector('#app'));

React.renderComponent(<CursorParent />, document.querySelector('#app2'));

React.renderComponent(<FluxParent />, document.querySelector('#app3'));
