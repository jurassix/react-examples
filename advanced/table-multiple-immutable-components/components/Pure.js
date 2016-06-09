var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

function Pure(component) {
  return React.createClass({
    mixins: [PureRenderMixin],

    render: function() {
      return component(this.props);
    }
  });
}

module.exports = Pure;
