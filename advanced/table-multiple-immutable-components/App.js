var ReactDOM = require('react-dom');
var React = require('react');
var Immutable = require('immutable');
var Benchmark = require('benchmark');
var Table = require('./components/Table');

var numRows = 100;
var numColls = 100;

function resetData() {
  return Immutable.fromJS({
    rows: Immutable.Range(1, Infinity).take(numRows).reduce(function(row) {
      row.push({
        cells: Immutable.Range(100, Infinity).take(numColls).reduce(function(cell, n) {
          cell.push(n);
          return cell;
        }, [])
      });
      return row;
    }, [])
  });
}

var getRandomInt = function(max, min) {
  if (min == null) {
    min = 0;
  }
  return Math.floor(Math.random() * (max - min)) + min;
};

var data = resetData();
var suite = new Benchmark.Suite;

suite.add('PureRenderMixin: Table multiple immutable components', {
  'defer': true,
  'fn': function(deferred) {
    data = data.updateIn(['rows', getRandomInt(numRows), 'cells'], function(cells) {
      var index = getRandomInt(numColls);
      return cells.set(index, cells.get(index) + .001);
    });
    ReactDOM.render(
      React.createElement(
        Table.PureTable,
        {
          rows: data.get('rows'),
        }
      )
    , document.querySelector('#app')
    , function() {
      return deferred.resolve();
    });
  }
}).add('ImmutableRenderMixin: Table multiple immutable components', {
  'defer': true,
  'fn': function(deferred) {
    data = data.updateIn(['rows', getRandomInt(numRows), 'cells'], function(cells) {
      var index = getRandomInt(numColls);
      return cells.set(index, cells.get(index) + .001);
    });
    ReactDOM.render(
      React.createElement(
        Table.ImmutableTable,
        {
          rows: data.get('rows'),
        }
      )
    , document.querySelector('#app')
    , function() {
      return deferred.resolve();
    });
  }
}).on('cycle', function(event) {
  document.querySelector('#app').innerHTML = '';
  return console.log(String(event.target));
}).run({
  'async': false
});
