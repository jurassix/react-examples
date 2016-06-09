var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
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
