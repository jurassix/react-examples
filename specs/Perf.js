var Benchmark, Immutable, ImmutableTable, TableView, backboneData, generateBackboneData, generateData, numColls, numRows, reactData, suite;

require('react-raf-batching').inject();

Immutable = require('immutable');

Benchmark = require('benchmark').Benchmark;

ImmutableTable = require('../table-multiple-immutable-components/components/Table.cjsx');

TableView = require('../backbone-table/views/TableView.coffee');

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

generateBackboneData = function() {
  return new Backbone.Model({
    rows: new Backbone.Collection(Immutable.Range(1, Infinity).take(numRows).reduce(function(row) {
      row.push({
        cells: new Backbone.Collection(Immutable.Range(100, Infinity).take(numColls).reduce(function(cell, n) {
          cell.push({
            value: n
          });
          return cell;
        }, []))
      });
      return row;
    }, []))
  });
};

reactData = Immutable.fromJS(generateData());

backboneData = generateBackboneData();

suite = new Benchmark.Suite;

suite.add('Immutable Table', {
  'defer': true,
  'fn': function(deferred) {
    return React.renderComponent(ImmutableTable({
      rows: reactData.get('rows')
    }), document.querySelector('#app1'), function() {
      return deferred.resolve();
    });
  }
}).add('Backbone Table', {
  'defer': true,
  'fn': function(deferred) {
    $('#app2').html(new TableView({
      collection: backboneData.get('rows')
    }).render().el);
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
