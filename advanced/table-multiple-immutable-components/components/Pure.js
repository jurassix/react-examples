var React = require('react/addons');
var ImmutableRenderMixin = require('react-immutable-render-mixin');

function Pure(component) {
  return React.createClass({
    mixins: [ImmutableRenderMixin],

    render: function() {
      return component(this.props);
    }
  });
}

module.exports = Pure;
