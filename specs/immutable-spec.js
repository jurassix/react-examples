var Immutable, expect, isEqual, isNotEqual;

expect = require('chai').expect;

Immutable = require('immutable');

isEqual = function(a, b) {
  return expect(Immutable.is(a, b)).to.be["true"];
};

isNotEqual = function(a, b) {
  return expect(Immutable.is(a, b)).to.be["false"];
};

describe('immutable app state', function() {
  it('has basic immutable pricipals', function() {
    var x, y, z;
    x = Immutable.fromJS([
      {
        value: 1
      }, {
        value: 3
      }
    ]);

    y = x.unshift({
      value: 0
    });

    z = y.unshift({
      value: 1
    });

    expect(x.length).to.equal(2);
    expect(y.length).to.equal(3);
    expect(z.length).to.equal(4);
  });
  it('ensures objects are recycled in persistent data', function() {
    var bar, foo, i_bar, i_foo;
    foo = {
      pie: 'apple',
      portion: 'large'
    };

    bar = {
      pie: 'apple',
      portion: 'large'
    };

    i_foo = Immutable.fromJS(foo);
    i_bar = Immutable.fromJS(bar);

    isEqual(i_foo, i_bar);
  });
  it('ensures objects data can be replaced and maintain ref integrity', function() {
    var foo, i_foo1, i_foo2;
    foo = {
      pie: 'apple',
      portion: 'large'
    };

    i_foo1 = Immutable.fromJS(foo);
    i_foo2 = Immutable.fromJS(foo);

    isEqual(i_foo1, i_foo2);
  });
  it('has shared structure', function() {
    var i_x, i_y, i_z, x, y, z;
    x = [
      {
        value: 1
      }, {
        value: 3
      }
    ];

    y = [
      {
        value: 0
      }, {
        value: 1
      }, {
        value: 3
      }
    ];

    z = [
      {
        value: 1
      }, {
        value: 0
      }, {
        value: 1
      }, {
        value: 3
      }
    ];

    i_x = Immutable.fromJS(x);
    i_y = Immutable.fromJS(y);
    i_z = Immutable.fromJS(z);

    isEqual(i_x.last(), i_y.last());
    isEqual(i_x.last(), i_z.last());
    isEqual(i_x.first(), i_y.get(1));
    isEqual(i_x.first(), i_z.get(2));
  });
  return it('can replace json and maintain ref integrity', function() {
    var i_initial, i_update, initial, update;
    initial = {
      rows: [
        {
          cells: [1, 2, 3, 4, 5]
        }, {
          cells: [1, 2, 3, 4, 5]
        }, {
          cells: [1, 2, 3, 4, 5]
        }, {
          cells: [1, 2, 3, 4, 5]
        }
      ]
    };

    update = {
      rows: [
        {
          cells: [5, 4, 3, 2, 1]
        }, {
          cells: [1, 2, 3, 4, 5]
        }, {
          cells: [1, 2, 3, 4, 5]
        }, {
          cells: [1, 2, 3, 4, 5]
        }
      ]
    };

    i_initial = Immutable.fromJS(initial);
    i_update = Immutable.fromJS(update);

    isNotEqual(i_initial, i_update);
    isNotEqual(i_initial.get('rows'), i_update.get('rows'));
    isNotEqual(i_initial.getIn(['rows', 0, 'cells']), i_update.getIn(['rows', 0, 'cells']));
    isEqual(i_initial.getIn(['rows', 1, 'cells']), i_update.getIn(['rows', 1, 'cells']));
    isEqual(i_initial.getIn(['rows', 2, 'cells']), i_update.getIn(['rows', 2, 'cells']));
    isEqual(i_initial.getIn(['rows', 3, 'cells']), i_update.getIn(['rows', 3, 'cells']));
  });
});
