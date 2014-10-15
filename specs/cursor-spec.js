var Immutable, expect, isEqual, isNotEqual, sinon;

expect = require('chai').expect;

sinon = require('sinon');

Immutable = require('immutable');

isEqual = function(a, b) {
  return expect(Immutable.is(a, b)).to.be["true"];
};

isNotEqual = function(a, b) {
  return expect(Immutable.is(a, b)).to.be["false"];
};

describe('cursor', function() {
  it('is equal to original data', function() {
    var cursor, foo, i_foo;
    foo = {
      pie: 'apple',
      portion: 'large'
    };

    i_foo = Immutable.fromJS(foo);
    cursor = i_foo.cursor();

    isEqual(i_foo, cursor);
  });
  it('can update cursor and perserve Immutable data', function() {
    var cursor, foo, i_foo, newData;
    foo = {
      pie: 'apple',
      portion: 'large'
    };

    i_foo = Immutable.fromJS(foo);
    cursor = i_foo.cursor();

    newData = cursor.set('pie', 'raspberry');

    isEqual(i_foo, cursor);
    isNotEqual(cursor, newData);
    isEqual(newData.get('pie'), 'raspberry');
  });
  it('can attach listener to cursor for single update', function() {
    var cursor, foo, i_foo, onTransaction;
    foo = {
      pie: 'apple',
      portion: 'large'
    };

    onTransaction = function(newData, oldData) {
      return cursor = newData.cursor();
    };

    i_foo = Immutable.fromJS(foo);
    cursor = i_foo.cursor(onTransaction);

    cursor.set('pie', 'raspberry');

    isNotEqual(i_foo, cursor);
    isEqual(cursor.get('pie'), 'raspberry');
  });
  it('can attach listener to cursor on repeated updates', function() {
    var cursor, foo, i_foo, onTransaction;
    foo = {
      pie: 'apple',
      portion: 'large'
    };

    onTransaction = function(newData, oldData) {
      return cursor = newData.cursor(onTransaction);
    };

    i_foo = Immutable.fromJS(foo);
    cursor = i_foo.cursor(onTransaction);

    cursor.set('pie', 'raspberry');
    cursor.set('portion', 'small');

    isNotEqual(i_foo, cursor);
    isEqual(cursor.get('pie'), 'raspberry');
    isEqual(cursor.get('portion'), 'small');
  });
  it('can allow multiple updates in a single transaction', function() {
    var cursor, foo, i_foo, onTransaction, spy;
    foo = {
      pie: 'apple',
      portion: 'large'
    };

    onTransaction = function(newData, oldData) {
      return cursor = newData.cursor();
    };

    spy = sinon.spy(onTransaction);

    i_foo = Immutable.fromJS(foo);
    cursor = i_foo.cursor(spy);

    cursor.update(function(data) {
      var newdata;
      newdata = data.set('pie', 'raspberry');
      return newdata.set('portion', 'small');
    });

    isNotEqual(i_foo, cursor);
    expect(spy.calledOnce).to.be["true"];
    isEqual(cursor.get('pie'), 'raspberry');
    isEqual(cursor.get('portion'), 'small');
  });
  return it('can create sub-cursor and listen to transacitons from main cursor', function() {
    var cursor, foo, i_foo, onTransaction, subCursor;
    foo = {
      pie: 'apple',
      portion: 'large'
    };

    onTransaction = function(newData, oldData) {
      return cursor = newData.cursor(onTransaction);
    };

    i_foo = Immutable.fromJS(foo);
    cursor = i_foo.cursor(onTransaction);
    subCursor = cursor.cursor('pie');

    subCursor.update(function() {
      return 'raspberry';
    });

    isNotEqual(i_foo, cursor);
    isEqual(cursor.get('pie'), 'raspberry');
  });
});
