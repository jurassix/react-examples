var Benchmark, Immutable, Table, data, getRandomInt, numColls, numRows, suite;

require('react-raf-batching').inject();

Immutable = require('immutable');

Benchmark = require('benchmark').Benchmark;

Table = require('./components/Table');

numRows = 100;

numColls = 100;

data = {
  rows: Immutable.Range(1, Infinity).take(numRows).reduce(function(row) {
    row.push({
      cells: Immutable.Range(100, Infinity).take(numColls).reduce(function(cell, n) {
        cell.push(n);
        return cell;
      }, [])
    });
    return row;
  }, [])
};

getRandomInt = function(max, min) {
  if (min == null) {
    min = 0;
  }
  return Math.floor(Math.random() * (max - min)) + min;
};

suite = new Benchmark.Suite;

suite.add('Table singe component', {
  'defer': true,
  'fn': function(deferred) {
    data.rows[getRandomInt(numRows)].cells[getRandomInt(numColls)] += .001;
    React.renderComponent(Table(data), document.querySelector('#app'), function() {
      return deferred.resolve();
    });
  }
}).on('cycle', function(event) {
  return console.log(String(event.target));
}).run({
  'async': false
});
