var React = require('react/addons');
var PureRenderMixin = React.addons.PureRenderMixin;
var ImmutableRenderMixin = require('react-immutable-render-mixin');

function makePure(Mixin) {
  return function Pure(component) {
    return React.createClass({
      mixins: [Mixin],

      render: function() {
        return component(this.props);
      }
    });
  }
}

module.exports = {
  PureRender: makePure(PureRenderMixin),
  ImmutableRender: makePure(ImmutableRenderMixin),
};
