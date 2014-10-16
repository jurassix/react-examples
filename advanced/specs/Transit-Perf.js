var Immutable = require('immutable');

var Benchmark = require('benchmark');

var transit = require('transit-js');

var writer = require('./transit-immutable-bridge').writer;

var reader = require('./transit-immutable-bridge').reader;

var numRows = 100, numColls = 100;

var generateData = function() {
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

var r = transit.reader('json'),
    w = transit.writer('json');

var data = {};

var suite = new Benchmark.Suite;

suite.add('Transit to Immutable', {
  'defer': true,
  'onStart': function() {
    return data = w.write(generateData());
  },
  'fn': function(deferred) {
    var _data = reader.read(data);
    return deferred.resolve();
  }
}).add('JSON to Transit Bridge to Immutable', {
  'defer': true,
  'onStart': function() {
    return data = generateData();
  },
  'fn': function(deferred) {
    var _data = writer.write(data);
    reader.read(_data);
    return deferred.resolve();
  }
}).add('JSON to Immutable', {
  'defer': true,
  'onStart': function() {
    return data = generateData();
  },
  'fn': function(deferred) {
    var _data = Immutable.fromJS(data);
    return deferred.resolve();
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
