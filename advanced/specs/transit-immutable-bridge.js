var Immutable, MapHandler, VectorHandler, reader, transit, writer;

transit = require('transit-js');

Immutable = require('immutable');

reader = transit.reader("json", {
  arrayBuilder: {
    init: function(node) {
      return Immutable.Vector().asMutable();
    },
    add: function(ret, val, node) {
      return ret.push(val);
    },
    finalize: function(ret, node) {
      return ret.asImmutable();
    },
    fromArray: function(arr, node) {
      return Immutable.Vector.from(arr);
    }
  },
  mapBuilder: {
    init: function(node) {
      return Immutable.Map().asMutable();
    },
    add: function(ret, key, val, node) {
      return ret.set(key, val);
    },
    finalize: function(ret, node) {
      return ret.asImmutable();
    }
  }
});

VectorHandler = transit.makeWriteHandler({
  tag: function(v) {
    return "array";
  },
  rep: function(v) {
    return v;
  },
  stringRep: function(v) {
    return null;
  }
});

MapHandler = transit.makeWriteHandler({
  tag: function(v) {
    return "map";
  },
  rep: function(v) {
    return v;
  },
  stringRep: function(v) {
    return null;
  }
});

writer = transit.writer("json-verbose", {
  handlers: transit.map([Immutable.Vector, VectorHandler, Immutable.Map, MapHandler])
});

module.exports = {
  reader: reader,
  writer: writer
};
