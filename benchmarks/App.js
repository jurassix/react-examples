var Benchmark, Immutable, ImmutableTable, MultipleTable, MultipleTableGamed, SingleTable, TableView, callback, data, eventBus, generateBackboneData, generateData, getRandomInt, numColls, numRows, suite;

require('react-raf-batching').inject();

Immutable = require('Immutable');

Benchmark = require('benchmark').Benchmark;

SingleTable = require('../table-single-component/components/Table');

MultipleTable = require('../table-multiple-components/components/Table');

ImmutableTable = require('../table-multiple-immutable-components/components/Table');

numRows = 100;

numColls = 100;

generateData = function() {
  return {
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
};

getRandomInt = function(max, min) {
  if (min == null) {
    min = 0;
  }
  return Math.floor(Math.random() * (max - min)) + min;
};

data = {};

suite = new Benchmark.Suite;

suite.add('Single Table', {
  'defer': true,
  'onStart': function() {
    return data = generateData();
  },
  'fn': function(deferred) {
    data.rows[getRandomInt(numRows)].cells[getRandomInt(numColls)] += .001;
    React.renderComponent(SingleTable(data), document.querySelector('#app'), function() {
      return deferred.resolve();
    });
  }
}).add('Multiple Table', {
  'defer': true,
  'onStart': function() {
    return data = generateData();
  },
  'fn': function(deferred) {
    data.rows[getRandomInt(numRows)].cells[getRandomInt(numColls)] += .001;
    React.renderComponent(MultipleTable(data), document.querySelector('#app2'), function() {
      return deferred.resolve();
    });
  }
}).add('Immutable Table', {
  'defer': true,
  'onStart': function() {
    return data = Immutable.fromJS(generateData());
  },
  'fn': function(deferred) {
    data = data.updateIn(['rows', getRandomInt(numRows), 'cells'], function(cells) {
      var index;
      index = getRandomInt(numColls);
      return cells.set(index, cells.get(index) + .001);
    });
    React.renderComponent(ImmutableTable({
      rows: data.get('rows')
    }), document.querySelector('#app3'), function() {
      return deferred.resolve();
    });
  }
}).on('cycle', function(event) {
  console.log(String(event.target));
  return document.querySelector('#results').appendChild(document.createElement('div')).textContent = String(event.target);
}).on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  return document.querySelector('#results').appendChild(document.createElement('div')).textContent = 'Fastest is ' + this.filter('fastest').pluck('name');
}).run({
  'async': false
});
