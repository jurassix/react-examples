/**
 * @jsx React.DOM
 */

var HelloWorld, React;

React = require('react');

HelloWorld = React.createClass({
  propTypes: {
    date: React.PropTypes.instanceOf(Date)
  },
  getDefaultProps: function() {
    return {
      date: new Date()
    };
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return nextProps.date !== this.props.date;
  },
  render: function() {
    return (
      <div>
        <p>Hello World the date is
          <b className="text-primary">
            {this.props.date.toDateString()}
          </b>
        </p>
      </div>
    );
  }
});

module.exports = HelloWorld;

