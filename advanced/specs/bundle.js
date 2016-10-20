require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./transit-immutable-bridge":149,"benchmark":2,"immutable":4,"transit-js":148}],2:[function(require,module,exports){
(function (process,global){
/*!
 * Benchmark.js v1.0.0 <http://benchmarkjs.com/>
 * Copyright 2010-2012 Mathias Bynens <http://mths.be/>
 * Based on JSLitmus.js, copyright Robert Kieffer <http://broofa.com/>
 * Modified by John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
;(function(window, undefined) {
  'use strict';

  /** Used to assign each benchmark an incrimented id */
  var counter = 0;

  /** Detect DOM document object */
  var doc = isHostType(window, 'document') && document;

  /** Detect free variable `define` */
  var freeDefine = typeof define == 'function' &&
    typeof define.amd == 'object' && define.amd && define;

  /** Detect free variable `exports` */
  var freeExports = typeof exports == 'object' && exports &&
    (typeof global == 'object' && global && global == global.global && (window = global), exports);

  /** Detect free variable `require` */
  var freeRequire = typeof require == 'function' && require;

  /** Used to crawl all properties regardless of enumerability */
  var getAllKeys = Object.getOwnPropertyNames;

  /** Used to get property descriptors */
  var getDescriptor = Object.getOwnPropertyDescriptor;

  /** Used in case an object doesn't have its own method */
  var hasOwnProperty = {}.hasOwnProperty;

  /** Used to check if an object is extensible */
  var isExtensible = Object.isExtensible || function() { return true; };

  /** Used to access Wade Simmons' Node microtime module */
  var microtimeObject = req('microtime');

  /** Used to access the browser's high resolution timer */
  var perfObject = isHostType(window, 'performance') && performance;

  /** Used to call the browser's high resolution timer */
  var perfName = perfObject && (
    perfObject.now && 'now' ||
    perfObject.webkitNow && 'webkitNow'
  );

  /** Used to access Node's high resolution timer */
  var processObject = isHostType(window, 'process') && process;

  /** Used to check if an own property is enumerable */
  var propertyIsEnumerable = {}.propertyIsEnumerable;

  /** Used to set property descriptors */
  var setDescriptor = Object.defineProperty;

  /** Used to resolve a value's internal [[Class]] */
  var toString = {}.toString;

  /** Used to prevent a `removeChild` memory leak in IE < 9 */
  var trash = doc && doc.createElement('div');

  /** Used to integrity check compiled tests */
  var uid = 'uid' + (+new Date);

  /** Used to avoid infinite recursion when methods call each other */
  var calledBy = {};

  /** Used to avoid hz of Infinity */
  var divisors = {
    '1': 4096,
    '2': 512,
    '3': 64,
    '4': 8,
    '5': 0
  };

  /**
   * T-Distribution two-tailed critical values for 95% confidence
   * http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm
   */
  var tTable = {
    '1':  12.706,'2':  4.303, '3':  3.182, '4':  2.776, '5':  2.571, '6':  2.447,
    '7':  2.365, '8':  2.306, '9':  2.262, '10': 2.228, '11': 2.201, '12': 2.179,
    '13': 2.16,  '14': 2.145, '15': 2.131, '16': 2.12,  '17': 2.11,  '18': 2.101,
    '19': 2.093, '20': 2.086, '21': 2.08,  '22': 2.074, '23': 2.069, '24': 2.064,
    '25': 2.06,  '26': 2.056, '27': 2.052, '28': 2.048, '29': 2.045, '30': 2.042,
    'infinity': 1.96
  };

  /**
   * Critical Mann-Whitney U-values for 95% confidence
   * http://www.saburchill.com/IBbiology/stats/003.html
   */
  var uTable = {
    '5':  [0, 1, 2],
    '6':  [1, 2, 3, 5],
    '7':  [1, 3, 5, 6, 8],
    '8':  [2, 4, 6, 8, 10, 13],
    '9':  [2, 4, 7, 10, 12, 15, 17],
    '10': [3, 5, 8, 11, 14, 17, 20, 23],
    '11': [3, 6, 9, 13, 16, 19, 23, 26, 30],
    '12': [4, 7, 11, 14, 18, 22, 26, 29, 33, 37],
    '13': [4, 8, 12, 16, 20, 24, 28, 33, 37, 41, 45],
    '14': [5, 9, 13, 17, 22, 26, 31, 36, 40, 45, 50, 55],
    '15': [5, 10, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64],
    '16': [6, 11, 15, 21, 26, 31, 37, 42, 47, 53, 59, 64, 70, 75],
    '17': [6, 11, 17, 22, 28, 34, 39, 45, 51, 57, 63, 67, 75, 81, 87],
    '18': [7, 12, 18, 24, 30, 36, 42, 48, 55, 61, 67, 74, 80, 86, 93, 99],
    '19': [7, 13, 19, 25, 32, 38, 45, 52, 58, 65, 72, 78, 85, 92, 99, 106, 113],
    '20': [8, 14, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 98, 105, 112, 119, 127],
    '21': [8, 15, 22, 29, 36, 43, 50, 58, 65, 73, 80, 88, 96, 103, 111, 119, 126, 134, 142],
    '22': [9, 16, 23, 30, 38, 45, 53, 61, 69, 77, 85, 93, 101, 109, 117, 125, 133, 141, 150, 158],
    '23': [9, 17, 24, 32, 40, 48, 56, 64, 73, 81, 89, 98, 106, 115, 123, 132, 140, 149, 157, 166, 175],
    '24': [10, 17, 25, 33, 42, 50, 59, 67, 76, 85, 94, 102, 111, 120, 129, 138, 147, 156, 165, 174, 183, 192],
    '25': [10, 18, 27, 35, 44, 53, 62, 71, 80, 89, 98, 107, 117, 126, 135, 145, 154, 163, 173, 182, 192, 201, 211],
    '26': [11, 19, 28, 37, 46, 55, 64, 74, 83, 93, 102, 112, 122, 132, 141, 151, 161, 171, 181, 191, 200, 210, 220, 230],
    '27': [11, 20, 29, 38, 48, 57, 67, 77, 87, 97, 107, 118, 125, 138, 147, 158, 168, 178, 188, 199, 209, 219, 230, 240, 250],
    '28': [12, 21, 30, 40, 50, 60, 70, 80, 90, 101, 111, 122, 132, 143, 154, 164, 175, 186, 196, 207, 218, 228, 239, 250, 261, 272],
    '29': [13, 22, 32, 42, 52, 62, 73, 83, 94, 105, 116, 127, 138, 149, 160, 171, 182, 193, 204, 215, 226, 238, 249, 260, 271, 282, 294],
    '30': [13, 23, 33, 43, 54, 65, 76, 87, 98, 109, 120, 131, 143, 154, 166, 177, 189, 200, 212, 223, 235, 247, 258, 270, 282, 293, 305, 317]
  };

  /**
   * An object used to flag environments/features.
   *
   * @static
   * @memberOf Benchmark
   * @type Object
   */
  var support = {};

  (function() {

    /**
     * Detect Adobe AIR.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.air = isClassOf(window.runtime, 'ScriptBridgingProxyObject');

    /**
     * Detect if `arguments` objects have the correct internal [[Class]] value.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.argumentsClass = isClassOf(arguments, 'Arguments');

    /**
     * Detect if in a browser environment.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.browser = doc && isHostType(window, 'navigator');

    /**
     * Detect if strings support accessing characters by index.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.charByIndex =
      // IE 8 supports indexes on string literals but not string objects
      ('x'[0] + Object('x')[0]) == 'xx';

    /**
     * Detect if strings have indexes as own properties.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.charByOwnIndex =
      // Narwhal, Rhino, RingoJS, IE 8, and Opera < 10.52 support indexes on
      // strings but don't detect them as own properties
      support.charByIndex && hasKey('x', '0');

    /**
     * Detect if Java is enabled/exposed.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.java = isClassOf(window.java, 'JavaPackage');

    /**
     * Detect if the Timers API exists.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.timeout = isHostType(window, 'setTimeout') && isHostType(window, 'clearTimeout');

    /**
     * Detect if functions support decompilation.
     *
     * @name decompilation
     * @memberOf Benchmark.support
     * @type Boolean
     */
    try {
      // Safari 2.x removes commas in object literals
      // from Function#toString results
      // http://webk.it/11609
      // Firefox 3.6 and Opera 9.25 strip grouping
      // parentheses from Function#toString results
      // http://bugzil.la/559438
      support.decompilation = Function(
        'return (' + (function(x) { return { 'x': '' + (1 + x) + '', 'y': 0 }; }) + ')'
      )()(0).x === '1';
    } catch(e) {
      support.decompilation = false;
    }

    /**
     * Detect ES5+ property descriptor API.
     *
     * @name descriptors
     * @memberOf Benchmark.support
     * @type Boolean
     */
    try {
      var o = {};
      support.descriptors = (setDescriptor(o, o, o), 'value' in getDescriptor(o, o));
    } catch(e) {
      support.descriptors = false;
    }

    /**
     * Detect ES5+ Object.getOwnPropertyNames().
     *
     * @name getAllKeys
     * @memberOf Benchmark.support
     * @type Boolean
     */
    try {
      support.getAllKeys = /\bvalueOf\b/.test(getAllKeys(Object.prototype));
    } catch(e) {
      support.getAllKeys = false;
    }

    /**
     * Detect if own properties are iterated before inherited properties (all but IE < 9).
     *
     * @name iteratesOwnLast
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.iteratesOwnFirst = (function() {
      var props = [];
      function ctor() { this.x = 1; }
      ctor.prototype = { 'y': 1 };
      for (var prop in new ctor) { props.push(prop); }
      return props[0] == 'x';
    }());

    /**
     * Detect if a node's [[Class]] is resolvable (all but IE < 9)
     * and that the JS engine errors when attempting to coerce an object to a
     * string without a `toString` property value of `typeof` "function".
     *
     * @name nodeClass
     * @memberOf Benchmark.support
     * @type Boolean
     */
    try {
      support.nodeClass = ({ 'toString': 0 } + '', toString.call(doc || 0) != '[object Object]');
    } catch(e) {
      support.nodeClass = true;
    }
  }());

  /**
   * Timer object used by `clock()` and `Deferred#resolve`.
   *
   * @private
   * @type Object
   */
  var timer = {

   /**
    * The timer namespace object or constructor.
    *
    * @private
    * @memberOf timer
    * @type Function|Object
    */
    'ns': Date,

   /**
    * Starts the deferred timer.
    *
    * @private
    * @memberOf timer
    * @param {Object} deferred The deferred instance.
    */
    'start': null, // lazy defined in `clock()`

   /**
    * Stops the deferred timer.
    *
    * @private
    * @memberOf timer
    * @param {Object} deferred The deferred instance.
    */
    'stop': null // lazy defined in `clock()`
  };

  /** Shortcut for inverse results */
  var noArgumentsClass = !support.argumentsClass,
      noCharByIndex = !support.charByIndex,
      noCharByOwnIndex = !support.charByOwnIndex;

  /** Math shortcuts */
  var abs   = Math.abs,
      floor = Math.floor,
      max   = Math.max,
      min   = Math.min,
      pow   = Math.pow,
      sqrt  = Math.sqrt;

  /*--------------------------------------------------------------------------*/

  /**
   * The Benchmark constructor.
   *
   * @constructor
   * @param {String} name A name to identify the benchmark.
   * @param {Function|String} fn The test to benchmark.
   * @param {Object} [options={}] Options object.
   * @example
   *
   * // basic usage (the `new` operator is optional)
   * var bench = new Benchmark(fn);
   *
   * // or using a name first
   * var bench = new Benchmark('foo', fn);
   *
   * // or with options
   * var bench = new Benchmark('foo', fn, {
   *
   *   // displayed by Benchmark#toString if `name` is not available
   *   'id': 'xyz',
   *
   *   // called when the benchmark starts running
   *   'onStart': onStart,
   *
   *   // called after each run cycle
   *   'onCycle': onCycle,
   *
   *   // called when aborted
   *   'onAbort': onAbort,
   *
   *   // called when a test errors
   *   'onError': onError,
   *
   *   // called when reset
   *   'onReset': onReset,
   *
   *   // called when the benchmark completes running
   *   'onComplete': onComplete,
   *
   *   // compiled/called before the test loop
   *   'setup': setup,
   *
   *   // compiled/called after the test loop
   *   'teardown': teardown
   * });
   *
   * // or name and options
   * var bench = new Benchmark('foo', {
   *
   *   // a flag to indicate the benchmark is deferred
   *   'defer': true,
   *
   *   // benchmark test function
   *   'fn': function(deferred) {
   *     // call resolve() when the deferred test is finished
   *     deferred.resolve();
   *   }
   * });
   *
   * // or options only
   * var bench = new Benchmark({
   *
   *   // benchmark name
   *   'name': 'foo',
   *
   *   // benchmark test as a string
   *   'fn': '[1,2,3,4].sort()'
   * });
   *
   * // a test's `this` binding is set to the benchmark instance
   * var bench = new Benchmark('foo', function() {
   *   'My name is '.concat(this.name); // My name is foo
   * });
   */
  function Benchmark(name, fn, options) {
    var me = this;

    // allow instance creation without the `new` operator
    if (me == null || me.constructor != Benchmark) {
      return new Benchmark(name, fn, options);
    }
    // juggle arguments
    if (isClassOf(name, 'Object')) {
      // 1 argument (options)
      options = name;
    }
    else if (isClassOf(name, 'Function')) {
      // 2 arguments (fn, options)
      options = fn;
      fn = name;
    }
    else if (isClassOf(fn, 'Object')) {
      // 2 arguments (name, options)
      options = fn;
      fn = null;
      me.name = name;
    }
    else {
      // 3 arguments (name, fn [, options])
      me.name = name;
    }
    setOptions(me, options);
    me.id || (me.id = ++counter);
    me.fn == null && (me.fn = fn);
    me.stats = deepClone(me.stats);
    me.times = deepClone(me.times);
  }

  /**
   * The Deferred constructor.
   *
   * @constructor
   * @memberOf Benchmark
   * @param {Object} clone The cloned benchmark instance.
   */
  function Deferred(clone) {
    var me = this;
    if (me == null || me.constructor != Deferred) {
      return new Deferred(clone);
    }
    me.benchmark = clone;
    clock(me);
  }

  /**
   * The Event constructor.
   *
   * @constructor
   * @memberOf Benchmark
   * @param {String|Object} type The event type.
   */
  function Event(type) {
    var me = this;
    return (me == null || me.constructor != Event)
      ? new Event(type)
      : (type instanceof Event)
          ? type
          : extend(me, { 'timeStamp': +new Date }, typeof type == 'string' ? { 'type': type } : type);
  }

  /**
   * The Suite constructor.
   *
   * @constructor
   * @memberOf Benchmark
   * @param {String} name A name to identify the suite.
   * @param {Object} [options={}] Options object.
   * @example
   *
   * // basic usage (the `new` operator is optional)
   * var suite = new Benchmark.Suite;
   *
   * // or using a name first
   * var suite = new Benchmark.Suite('foo');
   *
   * // or with options
   * var suite = new Benchmark.Suite('foo', {
   *
   *   // called when the suite starts running
   *   'onStart': onStart,
   *
   *   // called between running benchmarks
   *   'onCycle': onCycle,
   *
   *   // called when aborted
   *   'onAbort': onAbort,
   *
   *   // called when a test errors
   *   'onError': onError,
   *
   *   // called when reset
   *   'onReset': onReset,
   *
   *   // called when the suite completes running
   *   'onComplete': onComplete
   * });
   */
  function Suite(name, options) {
    var me = this;

    // allow instance creation without the `new` operator
    if (me == null || me.constructor != Suite) {
      return new Suite(name, options);
    }
    // juggle arguments
    if (isClassOf(name, 'Object')) {
      // 1 argument (options)
      options = name;
    } else {
      // 2 arguments (name [, options])
      me.name = name;
    }
    setOptions(me, options);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Note: Some array methods have been implemented in plain JavaScript to avoid
   * bugs in IE, Opera, Rhino, and Mobile Safari.
   *
   * IE compatibility mode and IE < 9 have buggy Array `shift()` and `splice()`
   * functions that fail to remove the last element, `object[0]`, of
   * array-like-objects even though the `length` property is set to `0`.
   * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
   * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
   *
   * In Opera < 9.50 and some older/beta Mobile Safari versions using `unshift()`
   * generically to augment the `arguments` object will pave the value at index 0
   * without incrimenting the other values's indexes.
   * https://github.com/documentcloud/underscore/issues/9
   *
   * Rhino and environments it powers, like Narwhal and RingoJS, may have
   * buggy Array `concat()`, `reverse()`, `shift()`, `slice()`, `splice()` and
   * `unshift()` functions that make sparse arrays non-sparse by assigning the
   * undefined indexes a value of undefined.
   * https://github.com/mozilla/rhino/commit/702abfed3f8ca043b2636efd31c14ba7552603dd
   */

  /**
   * Creates an array containing the elements of the host array followed by the
   * elements of each argument in order.
   *
   * @memberOf Benchmark.Suite
   * @returns {Array} The new array.
   */
  function concat() {
    var value,
        j = -1,
        length = arguments.length,
        result = slice.call(this),
        index = result.length;

    while (++j < length) {
      value = arguments[j];
      if (isClassOf(value, 'Array')) {
        for (var k = 0, l = value.length; k < l; k++, index++) {
          if (k in value) {
            result[index] = value[k];
          }
        }
      } else {
        result[index++] = value;
      }
    }
    return result;
  }

  /**
   * Utility function used by `shift()`, `splice()`, and `unshift()`.
   *
   * @private
   * @param {Number} start The index to start inserting elements.
   * @param {Number} deleteCount The number of elements to delete from the insert point.
   * @param {Array} elements The elements to insert.
   * @returns {Array} An array of deleted elements.
   */
  function insert(start, deleteCount, elements) {
    // `result` should have its length set to the `deleteCount`
    // see https://bugs.ecmascript.org/show_bug.cgi?id=332
    var deleteEnd = start + deleteCount,
        elementCount = elements ? elements.length : 0,
        index = start - 1,
        length = start + elementCount,
        object = this,
        result = Array(deleteCount),
        tail = slice.call(object, deleteEnd);

    // delete elements from the array
    while (++index < deleteEnd) {
      if (index in object) {
        result[index - start] = object[index];
        delete object[index];
      }
    }
    // insert elements
    index = start - 1;
    while (++index < length) {
      object[index] = elements[index - start];
    }
    // append tail elements
    start = index--;
    length = max(0, (object.length >>> 0) - deleteCount + elementCount);
    while (++index < length) {
      if ((index - start) in tail) {
        object[index] = tail[index - start];
      } else if (index in object) {
        delete object[index];
      }
    }
    // delete excess elements
    deleteCount = deleteCount > elementCount ? deleteCount - elementCount : 0;
    while (deleteCount--) {
      index = length + deleteCount;
      if (index in object) {
        delete object[index];
      }
    }
    object.length = length;
    return result;
  }

  /**
   * Rearrange the host array's elements in reverse order.
   *
   * @memberOf Benchmark.Suite
   * @returns {Array} The reversed array.
   */
  function reverse() {
    var upperIndex,
        value,
        index = -1,
        object = Object(this),
        length = object.length >>> 0,
        middle = floor(length / 2);

    if (length > 1) {
      while (++index < middle) {
        upperIndex = length - index - 1;
        value = upperIndex in object ? object[upperIndex] : uid;
        if (index in object) {
          object[upperIndex] = object[index];
        } else {
          delete object[upperIndex];
        }
        if (value != uid) {
          object[index] = value;
        } else {
          delete object[index];
        }
      }
    }
    return object;
  }

  /**
   * Removes the first element of the host array and returns it.
   *
   * @memberOf Benchmark.Suite
   * @returns {Mixed} The first element of the array.
   */
  function shift() {
    return insert.call(this, 0, 1)[0];
  }

  /**
   * Creates an array of the host array's elements from the start index up to,
   * but not including, the end index.
   *
   * @memberOf Benchmark.Suite
   * @param {Number} start The starting index.
   * @param {Number} end The end index.
   * @returns {Array} The new array.
   */
  function slice(start, end) {
    var index = -1,
        object = Object(this),
        length = object.length >>> 0,
        result = [];

    start = toInteger(start);
    start = start < 0 ? max(length + start, 0) : min(start, length);
    start--;
    end = end == null ? length : toInteger(end);
    end = end < 0 ? max(length + end, 0) : min(end, length);

    while ((++index, ++start) < end) {
      if (start in object) {
        result[index] = object[start];
      }
    }
    return result;
  }

  /**
   * Allows removing a range of elements and/or inserting elements into the
   * host array.
   *
   * @memberOf Benchmark.Suite
   * @param {Number} start The start index.
   * @param {Number} deleteCount The number of elements to delete.
   * @param {Mixed} [val1, val2, ...] values to insert at the `start` index.
   * @returns {Array} An array of removed elements.
   */
  function splice(start, deleteCount) {
    var object = Object(this),
        length = object.length >>> 0;

    start = toInteger(start);
    start = start < 0 ? max(length + start, 0) : min(start, length);

    // support the de-facto SpiderMonkey extension
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice#Parameters
    // https://bugs.ecmascript.org/show_bug.cgi?id=429
    deleteCount = arguments.length == 1
      ? length - start
      : min(max(toInteger(deleteCount), 0), length - start);

    return insert.call(object, start, deleteCount, slice.call(arguments, 2));
  }

  /**
   * Converts the specified `value` to an integer.
   *
   * @private
   * @param {Mixed} value The value to convert.
   * @returns {Number} The resulting integer.
   */
  function toInteger(value) {
    value = +value;
    return value === 0 || !isFinite(value) ? value || 0 : value - (value % 1);
  }

  /**
   * Appends arguments to the host array.
   *
   * @memberOf Benchmark.Suite
   * @returns {Number} The new length.
   */
  function unshift() {
    var object = Object(this);
    insert.call(object, 0, 0, arguments);
    return object.length;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * A generic `Function#bind` like method.
   *
   * @private
   * @param {Function} fn The function to be bound to `thisArg`.
   * @param {Mixed} thisArg The `this` binding for the given function.
   * @returns {Function} The bound function.
   */
  function bind(fn, thisArg) {
    return function() { fn.apply(thisArg, arguments); };
  }

  /**
   * Creates a function from the given arguments string and body.
   *
   * @private
   * @param {String} args The comma separated function arguments.
   * @param {String} body The function body.
   * @returns {Function} The new function.
   */
  function createFunction() {
    // lazy define
    createFunction = function(args, body) {
      var result,
          anchor = freeDefine ? define.amd : Benchmark,
          prop = uid + 'createFunction';

      runScript((freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '=function(' + args + '){' + body + '}');
      result = anchor[prop];
      delete anchor[prop];
      return result;
    };
    // fix JaegerMonkey bug
    // http://bugzil.la/639720
    createFunction = support.browser && (createFunction('', 'return"' + uid + '"') || noop)() == uid ? createFunction : Function;
    return createFunction.apply(null, arguments);
  }

  /**
   * Delay the execution of a function based on the benchmark's `delay` property.
   *
   * @private
   * @param {Object} bench The benchmark instance.
   * @param {Object} fn The function to execute.
   */
  function delay(bench, fn) {
    bench._timerId = setTimeout(fn, bench.delay * 1e3);
  }

  /**
   * Destroys the given element.
   *
   * @private
   * @param {Element} element The element to destroy.
   */
  function destroyElement(element) {
    trash.appendChild(element);
    trash.innerHTML = '';
  }

  /**
   * Iterates over an object's properties, executing the `callback` for each.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   * @param {Object} options The options object.
   * @returns {Object} Returns the object iterated over.
   */
  function forProps() {
    var forShadowed,
        skipSeen,
        forArgs = true,
        shadowed = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

    (function(enumFlag, key) {
      // must use a non-native constructor to catch the Safari 2 issue
      function Klass() { this.valueOf = 0; };
      Klass.prototype.valueOf = 0;
      // check various for-in bugs
      for (key in new Klass) {
        enumFlag += key == 'valueOf' ? 1 : 0;
      }
      // check if `arguments` objects have non-enumerable indexes
      for (key in arguments) {
        key == '0' && (forArgs = false);
      }
      // Safari 2 iterates over shadowed properties twice
      // http://replay.waybackmachine.org/20090428222941/http://tobielangel.com/2007/1/29/for-in-loop-broken-in-safari/
      skipSeen = enumFlag == 2;
      // IE < 9 incorrectly makes an object's properties non-enumerable if they have
      // the same name as other non-enumerable properties in its prototype chain.
      forShadowed = !enumFlag;
    }(0));

    // lazy define
    forProps = function(object, callback, options) {
      options || (options = {});

      var result = object;
      object = Object(object);

      var ctor,
          key,
          keys,
          skipCtor,
          done = !result,
          which = options.which,
          allFlag = which == 'all',
          index = -1,
          iteratee = object,
          length = object.length,
          ownFlag = allFlag || which == 'own',
          seen = {},
          skipProto = isClassOf(object, 'Function'),
          thisArg = options.bind;

      if (thisArg !== undefined) {
        callback = bind(callback, thisArg);
      }
      // iterate all properties
      if (allFlag && support.getAllKeys) {
        for (index = 0, keys = getAllKeys(object), length = keys.length; index < length; index++) {
          key = keys[index];
          if (callback(object[key], key, object) === false) {
            break;
          }
        }
      }
      // else iterate only enumerable properties
      else {
        for (key in object) {
          // Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
          // (if the prototype or a property on the prototype has been set)
          // incorrectly set a function's `prototype` property [[Enumerable]] value
          // to `true`. Because of this we standardize on skipping the `prototype`
          // property of functions regardless of their [[Enumerable]] value.
          if ((done =
              !(skipProto && key == 'prototype') &&
              !(skipSeen && (hasKey(seen, key) || !(seen[key] = true))) &&
              (!ownFlag || ownFlag && hasKey(object, key)) &&
              callback(object[key], key, object) === false)) {
            break;
          }
        }
        // in IE < 9 strings don't support accessing characters by index
        if (!done && (forArgs && isArguments(object) ||
            ((noCharByIndex || noCharByOwnIndex) && isClassOf(object, 'String') &&
              (iteratee = noCharByIndex ? object.split('') : object)))) {
          while (++index < length) {
            if ((done =
                callback(iteratee[index], String(index), object) === false)) {
              break;
            }
          }
        }
        if (!done && forShadowed) {
          // Because IE < 9 can't set the `[[Enumerable]]` attribute of an existing
          // property and the `constructor` property of a prototype defaults to
          // non-enumerable, we manually skip the `constructor` property when we
          // think we are iterating over a `prototype` object.
          ctor = object.constructor;
          skipCtor = ctor && ctor.prototype && ctor.prototype.constructor === ctor;
          for (index = 0; index < 7; index++) {
            key = shadowed[index];
            if (!(skipCtor && key == 'constructor') &&
                hasKey(object, key) &&
                callback(object[key], key, object) === false) {
              break;
            }
          }
        }
      }
      return result;
    };
    return forProps.apply(null, arguments);
  }

  /**
   * Gets the name of the first argument from a function's source.
   *
   * @private
   * @param {Function} fn The function.
   * @returns {String} The argument name.
   */
  function getFirstArgument(fn) {
    return (!hasKey(fn, 'toString') &&
      (/^[\s(]*function[^(]*\(([^\s,)]+)/.exec(fn) || 0)[1]) || '';
  }

  /**
   * Computes the arithmetic mean of a sample.
   *
   * @private
   * @param {Array} sample The sample.
   * @returns {Number} The mean.
   */
  function getMean(sample) {
    return reduce(sample, function(sum, x) {
      return sum + x;
    }) / sample.length || 0;
  }

  /**
   * Gets the source code of a function.
   *
   * @private
   * @param {Function} fn The function.
   * @param {String} altSource A string used when a function's source code is unretrievable.
   * @returns {String} The function's source code.
   */
  function getSource(fn, altSource) {
    var result = altSource;
    if (isStringable(fn)) {
      result = String(fn);
    } else if (support.decompilation) {
      // escape the `{` for Firefox 1
      result = (/^[^{]+\{([\s\S]*)}\s*$/.exec(fn) || 0)[1];
    }
    // trim string
    result = (result || '').replace(/^\s+|\s+$/g, '');

    // detect strings containing only the "use strict" directive
    return /^(?:\/\*+[\w|\W]*?\*\/|\/\/.*?[\n\r\u2028\u2029]|\s)*(["'])use strict\1;?$/.test(result)
      ? ''
      : result;
  }

  /**
   * Checks if a value is an `arguments` object.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the value is an `arguments` object, else `false`.
   */
  function isArguments() {
    // lazy define
    isArguments = function(value) {
      return toString.call(value) == '[object Arguments]';
    };
    if (noArgumentsClass) {
      isArguments = function(value) {
        return hasKey(value, 'callee') &&
          !(propertyIsEnumerable && propertyIsEnumerable.call(value, 'callee'));
      };
    }
    return isArguments(arguments[0]);
  }

  /**
   * Checks if an object is of the specified class.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @param {String} name The name of the class.
   * @returns {Boolean} Returns `true` if the value is of the specified class, else `false`.
   */
  function isClassOf(value, name) {
    return value != null && toString.call(value) == '[object ' + name + ']';
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of object, function, or unknown.
   *
   * @private
   * @param {Mixed} object The owner of the property.
   * @param {String} property The property to check.
   * @returns {Boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Checks if a given `value` is an object created by the `Object` constructor
   * assuming objects created by the `Object` constructor have no inherited
   * enumerable properties and that there are no `Object.prototype` extensions.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a plain `Object` object, else `false`.
   */
  function isPlainObject(value) {
    // avoid non-objects and false positives for `arguments` objects in IE < 9
    var result = false;
    if (!(value && typeof value == 'object') || (noArgumentsClass && isArguments(value))) {
      return result;
    }
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
    // methods that are `typeof` "string" and still can coerce nodes to strings.
    // Also check that the constructor is `Object` (i.e. `Object instanceof Object`)
    var ctor = value.constructor;
    if ((support.nodeClass || !(typeof value.toString != 'function' && typeof (value + '') == 'string')) &&
        (!isClassOf(ctor, 'Function') || ctor instanceof ctor)) {
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      if (support.iteratesOwnFirst) {
        forProps(value, function(subValue, subKey) {
          result = subKey;
        });
        return result === false || hasKey(value, result);
      }
      // IE < 9 iterates inherited properties before own properties. If the first
      // iterated property is an object's own property then there are no inherited
      // enumerable properties.
      forProps(value, function(subValue, subKey) {
        result = !hasKey(value, subKey);
        return false;
      });
      return result === false;
    }
    return result;
  }

  /**
   * Checks if a value can be safely coerced to a string.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the value can be coerced, else `false`.
   */
  function isStringable(value) {
    return hasKey(value, 'toString') || isClassOf(value, 'String');
  }

  /**
   * Wraps a function and passes `this` to the original function as the
   * first argument.
   *
   * @private
   * @param {Function} fn The function to be wrapped.
   * @returns {Function} The new function.
   */
  function methodize(fn) {
    return function() {
      var args = [this];
      args.push.apply(args, arguments);
      return fn.apply(null, args);
    };
  }

  /**
   * A no-operation function.
   *
   * @private
   */
  function noop() {
    // no operation performed
  }

  /**
   * A wrapper around require() to suppress `module missing` errors.
   *
   * @private
   * @param {String} id The module id.
   * @returns {Mixed} The exported module or `null`.
   */
  function req(id) {
    try {
      var result = freeExports && freeRequire(id);
    } catch(e) { }
    return result || null;
  }

  /**
   * Runs a snippet of JavaScript via script injection.
   *
   * @private
   * @param {String} code The code to run.
   */
  function runScript(code) {
    var anchor = freeDefine ? define.amd : Benchmark,
        script = doc.createElement('script'),
        sibling = doc.getElementsByTagName('script')[0],
        parent = sibling.parentNode,
        prop = uid + 'runScript',
        prefix = '(' + (freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '||function(){})();';

    // Firefox 2.0.0.2 cannot use script injection as intended because it executes
    // asynchronously, but that's OK because script injection is only used to avoid
    // the previously commented JaegerMonkey bug.
    try {
      // remove the inserted script *before* running the code to avoid differences
      // in the expected script element count/order of the document.
      script.appendChild(doc.createTextNode(prefix + code));
      anchor[prop] = function() { destroyElement(script); };
    } catch(e) {
      parent = parent.cloneNode(false);
      sibling = null;
      script.text = code;
    }
    parent.insertBefore(script, sibling);
    delete anchor[prop];
  }

  /**
   * A helper function for setting options/event handlers.
   *
   * @private
   * @param {Object} bench The benchmark instance.
   * @param {Object} [options={}] Options object.
   */
  function setOptions(bench, options) {
    options = extend({}, bench.constructor.options, options);
    bench.options = forOwn(options, function(value, key) {
      if (value != null) {
        // add event listeners
        if (/^on[A-Z]/.test(key)) {
          forEach(key.split(' '), function(key) {
            bench.on(key.slice(2).toLowerCase(), value);
          });
        } else if (!hasKey(bench, key)) {
          bench[key] = deepClone(value);
        }
      }
    });
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Handles cycling/completing the deferred benchmark.
   *
   * @memberOf Benchmark.Deferred
   */
  function resolve() {
    var me = this,
        clone = me.benchmark,
        bench = clone._original;

    if (bench.aborted) {
      // cycle() -> clone cycle/complete event -> compute()'s invoked bench.run() cycle/complete
      me.teardown();
      clone.running = false;
      cycle(me);
    }
    else if (++me.cycles < clone.count) {
      // continue the test loop
      if (support.timeout) {
        // use setTimeout to avoid a call stack overflow if called recursively
        setTimeout(function() { clone.compiled.call(me, timer); }, 0);
      } else {
        clone.compiled.call(me, timer);
      }
    }
    else {
      timer.stop(me);
      me.teardown();
      delay(clone, function() { cycle(me); });
    }
  }

  /*--------------------------------------------------------------------------*/

  /**
   * A deep clone utility.
   *
   * @static
   * @memberOf Benchmark
   * @param {Mixed} value The value to clone.
   * @returns {Mixed} The cloned value.
   */
  function deepClone(value) {
    var accessor,
        circular,
        clone,
        ctor,
        descriptor,
        extensible,
        key,
        length,
        markerKey,
        parent,
        result,
        source,
        subIndex,
        data = { 'value': value },
        index = 0,
        marked = [],
        queue = { 'length': 0 },
        unmarked = [];

    /**
     * An easily detectable decorator for cloned values.
     */
    function Marker(object) {
      this.raw = object;
    }

    /**
     * The callback used by `forProps()`.
     */
    function forPropsCallback(subValue, subKey) {
      // exit early to avoid cloning the marker
      if (subValue && subValue.constructor == Marker) {
        return;
      }
      // add objects to the queue
      if (subValue === Object(subValue)) {
        queue[queue.length++] = { 'key': subKey, 'parent': clone, 'source': value };
      }
      // assign non-objects
      else {
        try {
          // will throw an error in strict mode if the property is read-only
          clone[subKey] = subValue;
        } catch(e) { }
      }
    }

    /**
     * Gets an available marker key for the given object.
     */
    function getMarkerKey(object) {
      // avoid collisions with existing keys
      var result = uid;
      while (object[result] && object[result].constructor != Marker) {
        result += 1;
      }
      return result;
    }

    do {
      key = data.key;
      parent = data.parent;
      source = data.source;
      clone = value = source ? source[key] : data.value;
      accessor = circular = descriptor = false;

      // create a basic clone to filter out functions, DOM elements, and
      // other non `Object` objects
      if (value === Object(value)) {
        // use custom deep clone function if available
        if (isClassOf(value.deepClone, 'Function')) {
          clone = value.deepClone();
        } else {
          ctor = value.constructor;
          switch (toString.call(value)) {
            case '[object Array]':
              clone = new ctor(value.length);
              break;

            case '[object Boolean]':
              clone = new ctor(value == true);
              break;

            case '[object Date]':
              clone = new ctor(+value);
              break;

            case '[object Object]':
              isPlainObject(value) && (clone = {});
              break;

            case '[object Number]':
            case '[object String]':
              clone = new ctor(value);
              break;

            case '[object RegExp]':
              clone = ctor(value.source,
                (value.global     ? 'g' : '') +
                (value.ignoreCase ? 'i' : '') +
                (value.multiline  ? 'm' : ''));
          }
        }
        // continue clone if `value` doesn't have an accessor descriptor
        // http://es5.github.com/#x8.10.1
        if (clone && clone != value &&
            !(descriptor = source && support.descriptors && getDescriptor(source, key),
              accessor = descriptor && (descriptor.get || descriptor.set))) {
          // use an existing clone (circular reference)
          if ((extensible = isExtensible(value))) {
            markerKey = getMarkerKey(value);
            if (value[markerKey]) {
              circular = clone = value[markerKey].raw;
            }
          } else {
            // for frozen/sealed objects
            for (subIndex = 0, length = unmarked.length; subIndex < length; subIndex++) {
              data = unmarked[subIndex];
              if (data.object === value) {
                circular = clone = data.clone;
                break;
              }
            }
          }
          if (!circular) {
            // mark object to allow quickly detecting circular references and tie it to its clone
            if (extensible) {
              value[markerKey] = new Marker(clone);
              marked.push({ 'key': markerKey, 'object': value });
            } else {
              // for frozen/sealed objects
              unmarked.push({ 'clone': clone, 'object': value });
            }
            // iterate over object properties
            forProps(value, forPropsCallback, { 'which': 'all' });
          }
        }
      }
      if (parent) {
        // for custom property descriptors
        if (accessor || (descriptor && !(descriptor.configurable && descriptor.enumerable && descriptor.writable))) {
          if ('value' in descriptor) {
            descriptor.value = clone;
          }
          setDescriptor(parent, key, descriptor);
        }
        // for default property descriptors
        else {
          parent[key] = clone;
        }
      } else {
        result = clone;
      }
    } while ((data = queue[index++]));

    // remove markers
    for (index = 0, length = marked.length; index < length; index++) {
      data = marked[index];
      delete data.object[data.key];
    }
    return result;
  }

  /**
   * An iteration utility for arrays and objects.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Array|Object} Returns the object iterated over.
   */
  function each(object, callback, thisArg) {
    var result = object;
    object = Object(object);

    var fn = callback,
        index = -1,
        length = object.length,
        isSnapshot = !!(object.snapshotItem && (length = object.snapshotLength)),
        isSplittable = (noCharByIndex || noCharByOwnIndex) && isClassOf(object, 'String'),
        isConvertable = isSnapshot || isSplittable || 'item' in object,
        origObject = object;

    // in Opera < 10.5 `hasKey(object, 'length')` returns `false` for NodeLists
    if (length === length >>> 0) {
      if (isConvertable) {
        // the third argument of the callback is the original non-array object
        callback = function(value, index) {
          return fn.call(this, value, index, origObject);
        };
        // in IE < 9 strings don't support accessing characters by index
        if (isSplittable) {
          object = object.split('');
        } else {
          object = [];
          while (++index < length) {
            // in Safari 2 `index in object` is always `false` for NodeLists
            object[index] = isSnapshot ? result.snapshotItem(index) : result[index];
          }
        }
      }
      forEach(object, callback, thisArg);
    } else {
      forOwn(object, callback, thisArg);
    }
    return result;
  }

  /**
   * Copies enumerable properties from the source(s) object to the destination object.
   *
   * @static
   * @memberOf Benchmark
   * @param {Object} destination The destination object.
   * @param {Object} [source={}] The source object.
   * @returns {Object} The destination object.
   */
  function extend(destination, source) {
    // Chrome < 14 incorrectly sets `destination` to `undefined` when we `delete arguments[0]`
    // http://code.google.com/p/v8/issues/detail?id=839
    var result = destination;
    delete arguments[0];

    forEach(arguments, function(source) {
      forProps(source, function(value, key) {
        result[key] = value;
      });
    });
    return result;
  }

  /**
   * A generic `Array#filter` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function|String} callback The function/alias called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Array} A new array of values that passed callback filter.
   * @example
   *
   * // get odd numbers
   * Benchmark.filter([1, 2, 3, 4, 5], function(n) {
   *   return n % 2;
   * }); // -> [1, 3, 5];
   *
   * // get fastest benchmarks
   * Benchmark.filter(benches, 'fastest');
   *
   * // get slowest benchmarks
   * Benchmark.filter(benches, 'slowest');
   *
   * // get benchmarks that completed without erroring
   * Benchmark.filter(benches, 'successful');
   */
  function filter(array, callback, thisArg) {
    var result;

    if (callback == 'successful') {
      // callback to exclude those that are errored, unrun, or have hz of Infinity
      callback = function(bench) { return bench.cycles && isFinite(bench.hz); };
    }
    else if (callback == 'fastest' || callback == 'slowest') {
      // get successful, sort by period + margin of error, and filter fastest/slowest
      result = filter(array, 'successful').sort(function(a, b) {
        a = a.stats; b = b.stats;
        return (a.mean + a.moe > b.mean + b.moe ? 1 : -1) * (callback == 'fastest' ? 1 : -1);
      });
      result = filter(result, function(bench) {
        return result[0].compare(bench) == 0;
      });
    }
    return result || reduce(array, function(result, value, index) {
      return callback.call(thisArg, value, index, array) ? (result.push(value), result) : result;
    }, []);
  }

  /**
   * A generic `Array#forEach` like method.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Array} Returns the array iterated over.
   */
  function forEach(array, callback, thisArg) {
    var index = -1,
        length = (array = Object(array)).length >>> 0;

    if (thisArg !== undefined) {
      callback = bind(callback, thisArg);
    }
    while (++index < length) {
      if (index in array &&
          callback(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @static
   * @memberOf Benchmark
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Object} Returns the object iterated over.
   */
  function forOwn(object, callback, thisArg) {
    return forProps(object, callback, { 'bind': thisArg, 'which': 'own' });
  }

  /**
   * Converts a number to a more readable comma-separated string representation.
   *
   * @static
   * @memberOf Benchmark
   * @param {Number} number The number to convert.
   * @returns {String} The more readable string representation.
   */
  function formatNumber(number) {
    number = String(number).split('.');
    return number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') +
      (number[1] ? '.' + number[1] : '');
  }

  /**
   * Checks if an object has the specified key as a direct property.
   *
   * @static
   * @memberOf Benchmark
   * @param {Object} object The object to check.
   * @param {String} key The key to check for.
   * @returns {Boolean} Returns `true` if key is a direct property, else `false`.
   */
  function hasKey() {
    // lazy define for worst case fallback (not as accurate)
    hasKey = function(object, key) {
      var parent = object != null && (object.constructor || Object).prototype;
      return !!parent && key in Object(object) && !(key in parent && object[key] === parent[key]);
    };
    // for modern browsers
    if (isClassOf(hasOwnProperty, 'Function')) {
      hasKey = function(object, key) {
        return object != null && hasOwnProperty.call(object, key);
      };
    }
    // for Safari 2
    else if ({}.__proto__ == Object.prototype) {
      hasKey = function(object, key) {
        var result = false;
        if (object != null) {
          object = Object(object);
          object.__proto__ = [object.__proto__, object.__proto__ = null, result = key in object][0];
        }
        return result;
      };
    }
    return hasKey.apply(this, arguments);
  }

  /**
   * A generic `Array#indexOf` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Mixed} value The value to search for.
   * @param {Number} [fromIndex=0] The index to start searching from.
   * @returns {Number} The index of the matched value or `-1`.
   */
  function indexOf(array, value, fromIndex) {
    var index = toInteger(fromIndex),
        length = (array = Object(array)).length >>> 0;

    index = (index < 0 ? max(0, length + index) : index) - 1;
    while (++index < length) {
      if (index in array && value === array[index]) {
        return index;
      }
    }
    return -1;
  }

  /**
   * Modify a string by replacing named tokens with matching object property values.
   *
   * @static
   * @memberOf Benchmark
   * @param {String} string The string to modify.
   * @param {Object} object The template object.
   * @returns {String} The modified string.
   */
  function interpolate(string, object) {
    forOwn(object, function(value, key) {
      // escape regexp special characters in `key`
      string = string.replace(RegExp('#\\{' + key.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1') + '\\}', 'g'), value);
    });
    return string;
  }

  /**
   * Invokes a method on all items in an array.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} benches Array of benchmarks to iterate over.
   * @param {String|Object} name The name of the method to invoke OR options object.
   * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the method with.
   * @returns {Array} A new array of values returned from each method invoked.
   * @example
   *
   * // invoke `reset` on all benchmarks
   * Benchmark.invoke(benches, 'reset');
   *
   * // invoke `emit` with arguments
   * Benchmark.invoke(benches, 'emit', 'complete', listener);
   *
   * // invoke `run(true)`, treat benchmarks as a queue, and register invoke callbacks
   * Benchmark.invoke(benches, {
   *
   *   // invoke the `run` method
   *   'name': 'run',
   *
   *   // pass a single argument
   *   'args': true,
   *
   *   // treat as queue, removing benchmarks from front of `benches` until empty
   *   'queued': true,
   *
   *   // called before any benchmarks have been invoked.
   *   'onStart': onStart,
   *
   *   // called between invoking benchmarks
   *   'onCycle': onCycle,
   *
   *   // called after all benchmarks have been invoked.
   *   'onComplete': onComplete
   * });
   */
  function invoke(benches, name) {
    var args,
        bench,
        queued,
        index = -1,
        eventProps = { 'currentTarget': benches },
        options = { 'onStart': noop, 'onCycle': noop, 'onComplete': noop },
        result = map(benches, function(bench) { return bench; });

    /**
     * Invokes the method of the current object and if synchronous, fetches the next.
     */
    function execute() {
      var listeners,
          async = isAsync(bench);

      if (async) {
        // use `getNext` as the first listener
        bench.on('complete', getNext);
        listeners = bench.events.complete;
        listeners.splice(0, 0, listeners.pop());
      }
      // execute method
      result[index] = isClassOf(bench && bench[name], 'Function') ? bench[name].apply(bench, args) : undefined;
      // if synchronous return true until finished
      return !async && getNext();
    }

    /**
     * Fetches the next bench or executes `onComplete` callback.
     */
    function getNext(event) {
      var cycleEvent,
          last = bench,
          async = isAsync(last);

      if (async) {
        last.off('complete', getNext);
        last.emit('complete');
      }
      // emit "cycle" event
      eventProps.type = 'cycle';
      eventProps.target = last;
      cycleEvent = Event(eventProps);
      options.onCycle.call(benches, cycleEvent);

      // choose next benchmark if not exiting early
      if (!cycleEvent.aborted && raiseIndex() !== false) {
        bench = queued ? benches[0] : result[index];
        if (isAsync(bench)) {
          delay(bench, execute);
        }
        else if (async) {
          // resume execution if previously asynchronous but now synchronous
          while (execute()) { }
        }
        else {
          // continue synchronous execution
          return true;
        }
      } else {
        // emit "complete" event
        eventProps.type = 'complete';
        options.onComplete.call(benches, Event(eventProps));
      }
      // When used as a listener `event.aborted = true` will cancel the rest of
      // the "complete" listeners because they were already called above and when
      // used as part of `getNext` the `return false` will exit the execution while-loop.
      if (event) {
        event.aborted = true;
      } else {
        return false;
      }
    }

    /**
     * Checks if invoking `Benchmark#run` with asynchronous cycles.
     */
    function isAsync(object) {
      // avoid using `instanceof` here because of IE memory leak issues with host objects
      var async = args[0] && args[0].async;
      return Object(object).constructor == Benchmark && name == 'run' &&
        ((async == null ? object.options.async : async) && support.timeout || object.defer);
    }

    /**
     * Raises `index` to the next defined index or returns `false`.
     */
    function raiseIndex() {
      var length = result.length;
      if (queued) {
        // if queued remove the previous bench and subsequent skipped non-entries
        do {
          ++index > 0 && shift.call(benches);
        } while ((length = benches.length) && !('0' in benches));
      }
      else {
        while (++index < length && !(index in result)) { }
      }
      // if we reached the last index then return `false`
      return (queued ? length : index < length) ? index : (index = false);
    }

    // juggle arguments
    if (isClassOf(name, 'String')) {
      // 2 arguments (array, name)
      args = slice.call(arguments, 2);
    } else {
      // 2 arguments (array, options)
      options = extend(options, name);
      name = options.name;
      args = isClassOf(args = 'args' in options ? options.args : [], 'Array') ? args : [args];
      queued = options.queued;
    }

    // start iterating over the array
    if (raiseIndex() !== false) {
      // emit "start" event
      bench = result[index];
      eventProps.type = 'start';
      eventProps.target = bench;
      options.onStart.call(benches, Event(eventProps));

      // end early if the suite was aborted in an "onStart" listener
      if (benches.aborted && benches.constructor == Suite && name == 'run') {
        // emit "cycle" event
        eventProps.type = 'cycle';
        options.onCycle.call(benches, Event(eventProps));
        // emit "complete" event
        eventProps.type = 'complete';
        options.onComplete.call(benches, Event(eventProps));
      }
      // else start
      else {
        if (isAsync(bench)) {
          delay(bench, execute);
        } else {
          while (execute()) { }
        }
      }
    }
    return result;
  }

  /**
   * Creates a string of joined array values or object key-value pairs.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array|Object} object The object to operate on.
   * @param {String} [separator1=','] The separator used between key-value pairs.
   * @param {String} [separator2=': '] The separator used between keys and values.
   * @returns {String} The joined result.
   */
  function join(object, separator1, separator2) {
    var result = [],
        length = (object = Object(object)).length,
        arrayLike = length === length >>> 0;

    separator2 || (separator2 = ': ');
    each(object, function(value, key) {
      result.push(arrayLike ? value : key + separator2 + value);
    });
    return result.join(separator1 || ',');
  }

  /**
   * A generic `Array#map` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Array} A new array of values returned by the callback.
   */
  function map(array, callback, thisArg) {
    return reduce(array, function(result, value, index) {
      result[index] = callback.call(thisArg, value, index, array);
      return result;
    }, Array(Object(array).length >>> 0));
  }

  /**
   * Retrieves the value of a specified property from all items in an array.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {String} property The property to pluck.
   * @returns {Array} A new array of property values.
   */
  function pluck(array, property) {
    return map(array, function(object) {
      return object == null ? undefined : object[property];
    });
  }

  /**
   * A generic `Array#reduce` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} accumulator Initial value of the accumulator.
   * @returns {Mixed} The accumulator.
   */
  function reduce(array, callback, accumulator) {
    var noaccum = arguments.length < 3;
    forEach(array, function(value, index) {
      accumulator = noaccum ? (noaccum = false, value) : callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Aborts all benchmarks in the suite.
   *
   * @name abort
   * @memberOf Benchmark.Suite
   * @returns {Object} The suite instance.
   */
  function abortSuite() {
    var event,
        me = this,
        resetting = calledBy.resetSuite;

    if (me.running) {
      event = Event('abort');
      me.emit(event);
      if (!event.cancelled || resetting) {
        // avoid infinite recursion
        calledBy.abortSuite = true;
        me.reset();
        delete calledBy.abortSuite;

        if (!resetting) {
          me.aborted = true;
          invoke(me, 'abort');
        }
      }
    }
    return me;
  }

  /**
   * Adds a test to the benchmark suite.
   *
   * @memberOf Benchmark.Suite
   * @param {String} name A name to identify the benchmark.
   * @param {Function|String} fn The test to benchmark.
   * @param {Object} [options={}] Options object.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // basic usage
   * suite.add(fn);
   *
   * // or using a name first
   * suite.add('foo', fn);
   *
   * // or with options
   * suite.add('foo', fn, {
   *   'onCycle': onCycle,
   *   'onComplete': onComplete
   * });
   *
   * // or name and options
   * suite.add('foo', {
   *   'fn': fn,
   *   'onCycle': onCycle,
   *   'onComplete': onComplete
   * });
   *
   * // or options only
   * suite.add({
   *   'name': 'foo',
   *   'fn': fn,
   *   'onCycle': onCycle,
   *   'onComplete': onComplete
   * });
   */
  function add(name, fn, options) {
    var me = this,
        bench = Benchmark(name, fn, options),
        event = Event({ 'type': 'add', 'target': bench });

    if (me.emit(event), !event.cancelled) {
      me.push(bench);
    }
    return me;
  }

  /**
   * Creates a new suite with cloned benchmarks.
   *
   * @name clone
   * @memberOf Benchmark.Suite
   * @param {Object} options Options object to overwrite cloned options.
   * @returns {Object} The new suite instance.
   */
  function cloneSuite(options) {
    var me = this,
        result = new me.constructor(extend({}, me.options, options));

    // copy own properties
    forOwn(me, function(value, key) {
      if (!hasKey(result, key)) {
        result[key] = value && isClassOf(value.clone, 'Function')
          ? value.clone()
          : deepClone(value);
      }
    });
    return result;
  }

  /**
   * An `Array#filter` like method.
   *
   * @name filter
   * @memberOf Benchmark.Suite
   * @param {Function|String} callback The function/alias called per iteration.
   * @returns {Object} A new suite of benchmarks that passed callback filter.
   */
  function filterSuite(callback) {
    var me = this,
        result = new me.constructor;

    result.push.apply(result, filter(me, callback));
    return result;
  }

  /**
   * Resets all benchmarks in the suite.
   *
   * @name reset
   * @memberOf Benchmark.Suite
   * @returns {Object} The suite instance.
   */
  function resetSuite() {
    var event,
        me = this,
        aborting = calledBy.abortSuite;

    if (me.running && !aborting) {
      // no worries, `resetSuite()` is called within `abortSuite()`
      calledBy.resetSuite = true;
      me.abort();
      delete calledBy.resetSuite;
    }
    // reset if the state has changed
    else if ((me.aborted || me.running) &&
        (me.emit(event = Event('reset')), !event.cancelled)) {
      me.running = false;
      if (!aborting) {
        invoke(me, 'reset');
      }
    }
    return me;
  }

  /**
   * Runs the suite.
   *
   * @name run
   * @memberOf Benchmark.Suite
   * @param {Object} [options={}] Options object.
   * @returns {Object} The suite instance.
   * @example
   *
   * // basic usage
   * suite.run();
   *
   * // or with options
   * suite.run({ 'async': true, 'queued': true });
   */
  function runSuite(options) {
    var me = this;

    me.reset();
    me.running = true;
    options || (options = {});

    invoke(me, {
      'name': 'run',
      'args': options,
      'queued': options.queued,
      'onStart': function(event) {
        me.emit(event);
      },
      'onCycle': function(event) {
        var bench = event.target;
        if (bench.error) {
          me.emit({ 'type': 'error', 'target': bench });
        }
        me.emit(event);
        event.aborted = me.aborted;
      },
      'onComplete': function(event) {
        me.running = false;
        me.emit(event);
      }
    });
    return me;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Executes all registered listeners of the specified event type.
   *
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String|Object} type The event type or object.
   * @returns {Mixed} Returns the return value of the last listener executed.
   */
  function emit(type) {
    var listeners,
        me = this,
        event = Event(type),
        events = me.events,
        args = (arguments[0] = event, arguments);

    event.currentTarget || (event.currentTarget = me);
    event.target || (event.target = me);
    delete event.result;

    if (events && (listeners = hasKey(events, event.type) && events[event.type])) {
      forEach(listeners.slice(), function(listener) {
        if ((event.result = listener.apply(me, args)) === false) {
          event.cancelled = true;
        }
        return !event.aborted;
      });
    }
    return event.result;
  }

  /**
   * Returns an array of event listeners for a given type that can be manipulated
   * to add or remove listeners.
   *
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String} type The event type.
   * @returns {Array} The listeners array.
   */
  function listeners(type) {
    var me = this,
        events = me.events || (me.events = {});

    return hasKey(events, type) ? events[type] : (events[type] = []);
  }

  /**
   * Unregisters a listener for the specified event type(s),
   * or unregisters all listeners for the specified event type(s),
   * or unregisters all listeners for all event types.
   *
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String} [type] The event type.
   * @param {Function} [listener] The function to unregister.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // unregister a listener for an event type
   * bench.off('cycle', listener);
   *
   * // unregister a listener for multiple event types
   * bench.off('start cycle', listener);
   *
   * // unregister all listeners for an event type
   * bench.off('cycle');
   *
   * // unregister all listeners for multiple event types
   * bench.off('start cycle complete');
   *
   * // unregister all listeners for all event types
   * bench.off();
   */
  function off(type, listener) {
    var me = this,
        events = me.events;

    events && each(type ? type.split(' ') : events, function(listeners, type) {
      var index;
      if (typeof listeners == 'string') {
        type = listeners;
        listeners = hasKey(events, type) && events[type];
      }
      if (listeners) {
        if (listener) {
          index = indexOf(listeners, listener);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        } else {
          listeners.length = 0;
        }
      }
    });
    return me;
  }

  /**
   * Registers a listener for the specified event type(s).
   *
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String} type The event type.
   * @param {Function} listener The function to register.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // register a listener for an event type
   * bench.on('cycle', listener);
   *
   * // register a listener for multiple event types
   * bench.on('start cycle', listener);
   */
  function on(type, listener) {
    var me = this,
        events = me.events || (me.events = {});

    forEach(type.split(' '), function(type) {
      (hasKey(events, type)
        ? events[type]
        : (events[type] = [])
      ).push(listener);
    });
    return me;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Aborts the benchmark without recording times.
   *
   * @memberOf Benchmark
   * @returns {Object} The benchmark instance.
   */
  function abort() {
    var event,
        me = this,
        resetting = calledBy.reset;

    if (me.running) {
      event = Event('abort');
      me.emit(event);
      if (!event.cancelled || resetting) {
        // avoid infinite recursion
        calledBy.abort = true;
        me.reset();
        delete calledBy.abort;

        if (support.timeout) {
          clearTimeout(me._timerId);
          delete me._timerId;
        }
        if (!resetting) {
          me.aborted = true;
          me.running = false;
        }
      }
    }
    return me;
  }

  /**
   * Creates a new benchmark using the same test and options.
   *
   * @memberOf Benchmark
   * @param {Object} options Options object to overwrite cloned options.
   * @returns {Object} The new benchmark instance.
   * @example
   *
   * var bizarro = bench.clone({
   *   'name': 'doppelganger'
   * });
   */
  function clone(options) {
    var me = this,
        result = new me.constructor(extend({}, me, options));

    // correct the `options` object
    result.options = extend({}, me.options, options);

    // copy own custom properties
    forOwn(me, function(value, key) {
      if (!hasKey(result, key)) {
        result[key] = deepClone(value);
      }
    });
    return result;
  }

  /**
   * Determines if a benchmark is faster than another.
   *
   * @memberOf Benchmark
   * @param {Object} other The benchmark to compare.
   * @returns {Number} Returns `-1` if slower, `1` if faster, and `0` if indeterminate.
   */
  function compare(other) {
    var critical,
        zStat,
        me = this,
        sample1 = me.stats.sample,
        sample2 = other.stats.sample,
        size1 = sample1.length,
        size2 = sample2.length,
        maxSize = max(size1, size2),
        minSize = min(size1, size2),
        u1 = getU(sample1, sample2),
        u2 = getU(sample2, sample1),
        u = min(u1, u2);

    function getScore(xA, sampleB) {
      return reduce(sampleB, function(total, xB) {
        return total + (xB > xA ? 0 : xB < xA ? 1 : 0.5);
      }, 0);
    }

    function getU(sampleA, sampleB) {
      return reduce(sampleA, function(total, xA) {
        return total + getScore(xA, sampleB);
      }, 0);
    }

    function getZ(u) {
      return (u - ((size1 * size2) / 2)) / sqrt((size1 * size2 * (size1 + size2 + 1)) / 12);
    }

    // exit early if comparing the same benchmark
    if (me == other) {
      return 0;
    }
    // reject the null hyphothesis the two samples come from the
    // same population (i.e. have the same median) if...
    if (size1 + size2 > 30) {
      // ...the z-stat is greater than 1.96 or less than -1.96
      // http://www.statisticslectures.com/topics/mannwhitneyu/
      zStat = getZ(u);
      return abs(zStat) > 1.96 ? (zStat > 0 ? -1 : 1) : 0;
    }
    // ...the U value is less than or equal the critical U value
    // http://www.geoib.com/mann-whitney-u-test.html
    critical = maxSize < 5 || minSize < 3 ? 0 : uTable[maxSize][minSize - 3];
    return u <= critical ? (u == u1 ? 1 : -1) : 0;
  }

  /**
   * Reset properties and abort if running.
   *
   * @memberOf Benchmark
   * @returns {Object} The benchmark instance.
   */
  function reset() {
    var data,
        event,
        me = this,
        index = 0,
        changes = { 'length': 0 },
        queue = { 'length': 0 };

    if (me.running && !calledBy.abort) {
      // no worries, `reset()` is called within `abort()`
      calledBy.reset = true;
      me.abort();
      delete calledBy.reset;
    }
    else {
      // a non-recursive solution to check if properties have changed
      // http://www.jslab.dk/articles/non.recursive.preorder.traversal.part4
      data = { 'destination': me, 'source': extend({}, me.constructor.prototype, me.options) };
      do {
        forOwn(data.source, function(value, key) {
          var changed,
              destination = data.destination,
              currValue = destination[key];

          if (value && typeof value == 'object') {
            if (isClassOf(value, 'Array')) {
              // check if an array value has changed to a non-array value
              if (!isClassOf(currValue, 'Array')) {
                changed = currValue = [];
              }
              // or has changed its length
              if (currValue.length != value.length) {
                changed = currValue = currValue.slice(0, value.length);
                currValue.length = value.length;
              }
            }
            // check if an object has changed to a non-object value
            else if (!currValue || typeof currValue != 'object') {
              changed = currValue = {};
            }
            // register a changed object
            if (changed) {
              changes[changes.length++] = { 'destination': destination, 'key': key, 'value': currValue };
            }
            queue[queue.length++] = { 'destination': currValue, 'source': value };
          }
          // register a changed primitive
          else if (value !== currValue && !(value == null || isClassOf(value, 'Function'))) {
            changes[changes.length++] = { 'destination': destination, 'key': key, 'value': value };
          }
        });
      }
      while ((data = queue[index++]));

      // if changed emit the `reset` event and if it isn't cancelled reset the benchmark
      if (changes.length && (me.emit(event = Event('reset')), !event.cancelled)) {
        forEach(changes, function(data) {
          data.destination[data.key] = data.value;
        });
      }
    }
    return me;
  }

  /**
   * Displays relevant benchmark information when coerced to a string.
   *
   * @name toString
   * @memberOf Benchmark
   * @returns {String} A string representation of the benchmark instance.
   */
  function toStringBench() {
    var me = this,
        error = me.error,
        hz = me.hz,
        id = me.id,
        stats = me.stats,
        size = stats.sample.length,
        pm = support.java ? '+/-' : '\xb1',
        result = me.name || (isNaN(id) ? id : '<Test #' + id + '>');

    if (error) {
      result += ': ' + join(error);
    } else {
      result += ' x ' + formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) + ' ops/sec ' + pm +
        stats.rme.toFixed(2) + '% (' + size + ' run' + (size == 1 ? '' : 's') + ' sampled)';
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Clocks the time taken to execute a test per cycle (secs).
   *
   * @private
   * @param {Object} bench The benchmark instance.
   * @returns {Number} The time taken.
   */
  function clock() {
    var applet,
        options = Benchmark.options,
        template = { 'begin': 's$=new n$', 'end': 'r$=(new n$-s$)/1e3', 'uid': uid },
        timers = [{ 'ns': timer.ns, 'res': max(0.0015, getRes('ms')), 'unit': 'ms' }];

    // lazy define for hi-res timers
    clock = function(clone) {
      var deferred;
      if (clone instanceof Deferred) {
        deferred = clone;
        clone = deferred.benchmark;
      }

      var bench = clone._original,
          fn = bench.fn,
          fnArg = deferred ? getFirstArgument(fn) || 'deferred' : '',
          stringable = isStringable(fn);

      var source = {
        'setup': getSource(bench.setup, preprocess('m$.setup()')),
        'fn': getSource(fn, preprocess('m$.fn(' + fnArg + ')')),
        'fnArg': fnArg,
        'teardown': getSource(bench.teardown, preprocess('m$.teardown()'))
      };

      var count = bench.count = clone.count,
          decompilable = support.decompilation || stringable,
          id = bench.id,
          isEmpty = !(source.fn || stringable),
          name = bench.name || (typeof id == 'number' ? '<Test #' + id + '>' : id),
          ns = timer.ns,
          result = 0;

      // init `minTime` if needed
      clone.minTime = bench.minTime || (bench.minTime = bench.options.minTime = options.minTime);

      // repair nanosecond timer
      // (some Chrome builds erase the `ns` variable after millions of executions)
      if (applet) {
        try {
          ns.nanoTime();
        } catch(e) {
          // use non-element to avoid issues with libs that augment them
          ns = timer.ns = new applet.Packages.nano;
        }
      }

      // Compile in setup/teardown functions and the test loop.
      // Create a new compiled test, instead of using the cached `bench.compiled`,
      // to avoid potential engine optimizations enabled over the life of the test.
      var compiled = bench.compiled = createFunction(preprocess('t$'), interpolate(
        preprocess(deferred
          ? 'var d$=this,#{fnArg}=d$,m$=d$.benchmark._original,f$=m$.fn,su$=m$.setup,td$=m$.teardown;' +
            // when `deferred.cycles` is `0` then...
            'if(!d$.cycles){' +
            // set `deferred.fn`
            'd$.fn=function(){var #{fnArg}=d$;if(typeof f$=="function"){try{#{fn}\n}catch(e$){f$(d$)}}else{#{fn}\n}};' +
            // set `deferred.teardown`
            'd$.teardown=function(){d$.cycles=0;if(typeof td$=="function"){try{#{teardown}\n}catch(e$){td$()}}else{#{teardown}\n}};' +
            // execute the benchmark's `setup`
            'if(typeof su$=="function"){try{#{setup}\n}catch(e$){su$()}}else{#{setup}\n};' +
            // start timer
            't$.start(d$);' +
            // execute `deferred.fn` and return a dummy object
            '}d$.fn();return{}'

          : 'var r$,s$,m$=this,f$=m$.fn,i$=m$.count,n$=t$.ns;#{setup}\n#{begin};' +
            'while(i$--){#{fn}\n}#{end};#{teardown}\nreturn{elapsed:r$,uid:"#{uid}"}'),
        source
      ));

      try {
        if (isEmpty) {
          // Firefox may remove dead code from Function#toString results
          // http://bugzil.la/536085
          throw new Error('The test "' + name + '" is empty. This may be the result of dead code removal.');
        }
        else if (!deferred) {
          // pretest to determine if compiled code is exits early, usually by a
          // rogue `return` statement, by checking for a return object with the uid
          bench.count = 1;
          compiled = (compiled.call(bench, timer) || {}).uid == uid && compiled;
          bench.count = count;
        }
      } catch(e) {
        compiled = null;
        clone.error = e || new Error(String(e));
        bench.count = count;
      }
      // fallback when a test exits early or errors during pretest
      if (decompilable && !compiled && !deferred && !isEmpty) {
        compiled = createFunction(preprocess('t$'), interpolate(
          preprocess(
            (clone.error && !stringable
              ? 'var r$,s$,m$=this,f$=m$.fn,i$=m$.count'
              : 'function f$(){#{fn}\n}var r$,s$,m$=this,i$=m$.count'
            ) +
            ',n$=t$.ns;#{setup}\n#{begin};m$.f$=f$;while(i$--){m$.f$()}#{end};' +
            'delete m$.f$;#{teardown}\nreturn{elapsed:r$}'
          ),
          source
        ));

        try {
          // pretest one more time to check for errors
          bench.count = 1;
          compiled.call(bench, timer);
          bench.compiled = compiled;
          bench.count = count;
          delete clone.error;
        }
        catch(e) {
          bench.count = count;
          if (clone.error) {
            compiled = null;
          } else {
            bench.compiled = compiled;
            clone.error = e || new Error(String(e));
          }
        }
      }
      // assign `compiled` to `clone` before calling in case a deferred benchmark
      // immediately calls `deferred.resolve()`
      clone.compiled = compiled;
      // if no errors run the full test loop
      if (!clone.error) {
        result = compiled.call(deferred || bench, timer).elapsed;
      }
      return result;
    };

    /*------------------------------------------------------------------------*/

    /**
     * Gets the current timer's minimum resolution (secs).
     */
    function getRes(unit) {
      var measured,
          begin,
          count = 30,
          divisor = 1e3,
          ns = timer.ns,
          sample = [];

      // get average smallest measurable time
      while (count--) {
        if (unit == 'us') {
          divisor = 1e6;
          if (ns.stop) {
            ns.start();
            while (!(measured = ns.microseconds())) { }
          } else if (ns[perfName]) {
            divisor = 1e3;
            measured = Function('n', 'var r,s=n.' + perfName + '();while(!(r=n.' + perfName + '()-s)){};return r')(ns);
          } else {
            begin = ns();
            while (!(measured = ns() - begin)) { }
          }
        }
        else if (unit == 'ns') {
          divisor = 1e9;
          if (ns.nanoTime) {
            begin = ns.nanoTime();
            while (!(measured = ns.nanoTime() - begin)) { }
          } else {
            begin = (begin = ns())[0] + (begin[1] / divisor);
            while (!(measured = ((measured = ns())[0] + (measured[1] / divisor)) - begin)) { }
            divisor = 1;
          }
        }
        else {
          begin = new ns;
          while (!(measured = new ns - begin)) { }
        }
        // check for broken timers (nanoTime may have issues)
        // http://alivebutsleepy.srnet.cz/unreliable-system-nanotime/
        if (measured > 0) {
          sample.push(measured);
        } else {
          sample.push(Infinity);
          break;
        }
      }
      // convert to seconds
      return getMean(sample) / divisor;
    }

    /**
     * Replaces all occurrences of `$` with a unique number and
     * template tokens with content.
     */
    function preprocess(code) {
      return interpolate(code, template).replace(/\$/g, /\d+/.exec(uid));
    }

    /*------------------------------------------------------------------------*/

    // detect nanosecond support from a Java applet
    each(doc && doc.applets || [], function(element) {
      return !(timer.ns = applet = 'nanoTime' in element && element);
    });

    // check type in case Safari returns an object instead of a number
    try {
      if (typeof timer.ns.nanoTime() == 'number') {
        timers.push({ 'ns': timer.ns, 'res': getRes('ns'), 'unit': 'ns' });
      }
    } catch(e) { }

    // detect Chrome's microsecond timer:
    // enable benchmarking via the --enable-benchmarking command
    // line switch in at least Chrome 7 to use chrome.Interval
    try {
      if ((timer.ns = new (window.chrome || window.chromium).Interval)) {
        timers.push({ 'ns': timer.ns, 'res': getRes('us'), 'unit': 'us' });
      }
    } catch(e) { }

    // detect `performance.now` microsecond resolution timer
    if ((timer.ns = perfName && perfObject)) {
      timers.push({ 'ns': timer.ns, 'res': getRes('us'), 'unit': 'us' });
    }

    // detect Node's nanosecond resolution timer available in Node >= 0.8
    if (processObject && typeof (timer.ns = processObject.hrtime) == 'function') {
      timers.push({ 'ns': timer.ns, 'res': getRes('ns'), 'unit': 'ns' });
    }

    // detect Wade Simmons' Node microtime module
    if (microtimeObject && typeof (timer.ns = microtimeObject.now) == 'function') {
      timers.push({ 'ns': timer.ns,  'res': getRes('us'), 'unit': 'us' });
    }

    // pick timer with highest resolution
    timer = reduce(timers, function(timer, other) {
      return other.res < timer.res ? other : timer;
    });

    // remove unused applet
    if (timer.unit != 'ns' && applet) {
      applet = destroyElement(applet);
    }
    // error if there are no working timers
    if (timer.res == Infinity) {
      throw new Error('Benchmark.js was unable to find a working timer.');
    }
    // use API of chosen timer
    if (timer.unit == 'ns') {
      if (timer.ns.nanoTime) {
        extend(template, {
          'begin': 's$=n$.nanoTime()',
          'end': 'r$=(n$.nanoTime()-s$)/1e9'
        });
      } else {
        extend(template, {
          'begin': 's$=n$()',
          'end': 'r$=n$(s$);r$=r$[0]+(r$[1]/1e9)'
        });
      }
    }
    else if (timer.unit == 'us') {
      if (timer.ns.stop) {
        extend(template, {
          'begin': 's$=n$.start()',
          'end': 'r$=n$.microseconds()/1e6'
        });
      } else if (perfName) {
        extend(template, {
          'begin': 's$=n$.' + perfName + '()',
          'end': 'r$=(n$.' + perfName + '()-s$)/1e3'
        });
      } else {
        extend(template, {
          'begin': 's$=n$()',
          'end': 'r$=(n$()-s$)/1e6'
        });
      }
    }

    // define `timer` methods
    timer.start = createFunction(preprocess('o$'),
      preprocess('var n$=this.ns,#{begin};o$.elapsed=0;o$.timeStamp=s$'));

    timer.stop = createFunction(preprocess('o$'),
      preprocess('var n$=this.ns,s$=o$.timeStamp,#{end};o$.elapsed=r$'));

    // resolve time span required to achieve a percent uncertainty of at most 1%
    // http://spiff.rit.edu/classes/phys273/uncert/uncert.html
    options.minTime || (options.minTime = max(timer.res / 2 / 0.01, 0.05));
    return clock.apply(null, arguments);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Computes stats on benchmark results.
   *
   * @private
   * @param {Object} bench The benchmark instance.
   * @param {Object} options The options object.
   */
  function compute(bench, options) {
    options || (options = {});

    var async = options.async,
        elapsed = 0,
        initCount = bench.initCount,
        minSamples = bench.minSamples,
        queue = [],
        sample = bench.stats.sample;

    /**
     * Adds a clone to the queue.
     */
    function enqueue() {
      queue.push(bench.clone({
        '_original': bench,
        'events': {
          'abort': [update],
          'cycle': [update],
          'error': [update],
          'start': [update]
        }
      }));
    }

    /**
     * Updates the clone/original benchmarks to keep their data in sync.
     */
    function update(event) {
      var clone = this,
          type = event.type;

      if (bench.running) {
        if (type == 'start') {
          // Note: `clone.minTime` prop is inited in `clock()`
          clone.count = bench.initCount;
        }
        else {
          if (type == 'error') {
            bench.error = clone.error;
          }
          if (type == 'abort') {
            bench.abort();
            bench.emit('cycle');
          } else {
            event.currentTarget = event.target = bench;
            bench.emit(event);
          }
        }
      } else if (bench.aborted) {
        // clear abort listeners to avoid triggering bench's abort/cycle again
        clone.events.abort.length = 0;
        clone.abort();
      }
    }

    /**
     * Determines if more clones should be queued or if cycling should stop.
     */
    function evaluate(event) {
      var critical,
          df,
          mean,
          moe,
          rme,
          sd,
          sem,
          variance,
          clone = event.target,
          done = bench.aborted,
          now = +new Date,
          size = sample.push(clone.times.period),
          maxedOut = size >= minSamples && (elapsed += now - clone.times.timeStamp) / 1e3 > bench.maxTime,
          times = bench.times,
          varOf = function(sum, x) { return sum + pow(x - mean, 2); };

      // exit early for aborted or unclockable tests
      if (done || clone.hz == Infinity) {
        maxedOut = !(size = sample.length = queue.length = 0);
      }

      if (!done) {
        // sample mean (estimate of the population mean)
        mean = getMean(sample);
        // sample variance (estimate of the population variance)
        variance = reduce(sample, varOf, 0) / (size - 1) || 0;
        // sample standard deviation (estimate of the population standard deviation)
        sd = sqrt(variance);
        // standard error of the mean (a.k.a. the standard deviation of the sampling distribution of the sample mean)
        sem = sd / sqrt(size);
        // degrees of freedom
        df = size - 1;
        // critical value
        critical = tTable[Math.round(df) || 1] || tTable.infinity;
        // margin of error
        moe = sem * critical;
        // relative margin of error
        rme = (moe / mean) * 100 || 0;

        extend(bench.stats, {
          'deviation': sd,
          'mean': mean,
          'moe': moe,
          'rme': rme,
          'sem': sem,
          'variance': variance
        });

        // Abort the cycle loop when the minimum sample size has been collected
        // and the elapsed time exceeds the maximum time allowed per benchmark.
        // We don't count cycle delays toward the max time because delays may be
        // increased by browsers that clamp timeouts for inactive tabs.
        // https://developer.mozilla.org/en/window.setTimeout#Inactive_tabs
        if (maxedOut) {
          // reset the `initCount` in case the benchmark is rerun
          bench.initCount = initCount;
          bench.running = false;
          done = true;
          times.elapsed = (now - times.timeStamp) / 1e3;
        }
        if (bench.hz != Infinity) {
          bench.hz = 1 / mean;
          times.cycle = mean * bench.count;
          times.period = mean;
        }
      }
      // if time permits, increase sample size to reduce the margin of error
      if (queue.length < 2 && !maxedOut) {
        enqueue();
      }
      // abort the invoke cycle when done
      event.aborted = done;
    }

    // init queue and begin
    enqueue();
    invoke(queue, {
      'name': 'run',
      'args': { 'async': async },
      'queued': true,
      'onCycle': evaluate,
      'onComplete': function() { bench.emit('complete'); }
    });
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Cycles a benchmark until a run `count` can be established.
   *
   * @private
   * @param {Object} clone The cloned benchmark instance.
   * @param {Object} options The options object.
   */
  function cycle(clone, options) {
    options || (options = {});

    var deferred;
    if (clone instanceof Deferred) {
      deferred = clone;
      clone = clone.benchmark;
    }

    var clocked,
        cycles,
        divisor,
        event,
        minTime,
        period,
        async = options.async,
        bench = clone._original,
        count = clone.count,
        times = clone.times;

    // continue, if not aborted between cycles
    if (clone.running) {
      // `minTime` is set to `Benchmark.options.minTime` in `clock()`
      cycles = ++clone.cycles;
      clocked = deferred ? deferred.elapsed : clock(clone);
      minTime = clone.minTime;

      if (cycles > bench.cycles) {
        bench.cycles = cycles;
      }
      if (clone.error) {
        event = Event('error');
        event.message = clone.error;
        clone.emit(event);
        if (!event.cancelled) {
          clone.abort();
        }
      }
    }

    // continue, if not errored
    if (clone.running) {
      // time taken to complete last test cycle
      bench.times.cycle = times.cycle = clocked;
      // seconds per operation
      period = bench.times.period = times.period = clocked / count;
      // ops per second
      bench.hz = clone.hz = 1 / period;
      // avoid working our way up to this next time
      bench.initCount = clone.initCount = count;
      // do we need to do another cycle?
      clone.running = clocked < minTime;

      if (clone.running) {
        // tests may clock at `0` when `initCount` is a small number,
        // to avoid that we set its count to something a bit higher
        if (!clocked && (divisor = divisors[clone.cycles]) != null) {
          count = floor(4e6 / divisor);
        }
        // calculate how many more iterations it will take to achive the `minTime`
        if (count <= clone.count) {
          count += Math.ceil((minTime - clocked) / period);
        }
        clone.running = count != Infinity;
      }
    }
    // should we exit early?
    event = Event('cycle');
    clone.emit(event);
    if (event.aborted) {
      clone.abort();
    }
    // figure out what to do next
    if (clone.running) {
      // start a new cycle
      clone.count = count;
      if (deferred) {
        clone.compiled.call(deferred, timer);
      } else if (async) {
        delay(clone, function() { cycle(clone, options); });
      } else {
        cycle(clone);
      }
    }
    else {
      // fix TraceMonkey bug associated with clock fallbacks
      // http://bugzil.la/509069
      if (support.browser) {
        runScript(uid + '=1;delete ' + uid);
      }
      // done
      clone.emit('complete');
    }
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Runs the benchmark.
   *
   * @memberOf Benchmark
   * @param {Object} [options={}] Options object.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // basic usage
   * bench.run();
   *
   * // or with options
   * bench.run({ 'async': true });
   */
  function run(options) {
    var me = this,
        event = Event('start');

    // set `running` to `false` so `reset()` won't call `abort()`
    me.running = false;
    me.reset();
    me.running = true;

    me.count = me.initCount;
    me.times.timeStamp = +new Date;
    me.emit(event);

    if (!event.cancelled) {
      options = { 'async': ((options = options && options.async) == null ? me.async : options) && support.timeout };

      // for clones created within `compute()`
      if (me._original) {
        if (me.defer) {
          Deferred(me);
        } else {
          cycle(me, options);
        }
      }
      // for original benchmarks
      else {
        compute(me, options);
      }
    }
    return me;
  }

  /*--------------------------------------------------------------------------*/

  // Firefox 1 erroneously defines variable and argument names of functions on
  // the function itself as non-configurable properties with `undefined` values.
  // The bugginess continues as the `Benchmark` constructor has an argument
  // named `options` and Firefox 1 will not assign a value to `Benchmark.options`,
  // making it non-writable in the process, unless it is the first property
  // assigned by for-in loop of `extend()`.
  extend(Benchmark, {

    /**
     * The default options copied by benchmark instances.
     *
     * @static
     * @memberOf Benchmark
     * @type Object
     */
    'options': {

      /**
       * A flag to indicate that benchmark cycles will execute asynchronously
       * by default.
       *
       * @memberOf Benchmark.options
       * @type Boolean
       */
      'async': false,

      /**
       * A flag to indicate that the benchmark clock is deferred.
       *
       * @memberOf Benchmark.options
       * @type Boolean
       */
      'defer': false,

      /**
       * The delay between test cycles (secs).
       * @memberOf Benchmark.options
       * @type Number
       */
      'delay': 0.005,

      /**
       * Displayed by Benchmark#toString when a `name` is not available
       * (auto-generated if absent).
       *
       * @memberOf Benchmark.options
       * @type String
       */
      'id': undefined,

      /**
       * The default number of times to execute a test on a benchmark's first cycle.
       *
       * @memberOf Benchmark.options
       * @type Number
       */
      'initCount': 1,

      /**
       * The maximum time a benchmark is allowed to run before finishing (secs).
       * Note: Cycle delays aren't counted toward the maximum time.
       *
       * @memberOf Benchmark.options
       * @type Number
       */
      'maxTime': 5,

      /**
       * The minimum sample size required to perform statistical analysis.
       *
       * @memberOf Benchmark.options
       * @type Number
       */
      'minSamples': 5,

      /**
       * The time needed to reduce the percent uncertainty of measurement to 1% (secs).
       *
       * @memberOf Benchmark.options
       * @type Number
       */
      'minTime': 0,

      /**
       * The name of the benchmark.
       *
       * @memberOf Benchmark.options
       * @type String
       */
      'name': undefined,

      /**
       * An event listener called when the benchmark is aborted.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onAbort': undefined,

      /**
       * An event listener called when the benchmark completes running.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onComplete': undefined,

      /**
       * An event listener called after each run cycle.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onCycle': undefined,

      /**
       * An event listener called when a test errors.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onError': undefined,

      /**
       * An event listener called when the benchmark is reset.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onReset': undefined,

      /**
       * An event listener called when the benchmark starts running.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onStart': undefined
    },

    /**
     * Platform object with properties describing things like browser name,
     * version, and operating system.
     *
     * @static
     * @memberOf Benchmark
     * @type Object
     */
    'platform': req('platform') || window.platform || {

      /**
       * The platform description.
       *
       * @memberOf Benchmark.platform
       * @type String
       */
      'description': window.navigator && navigator.userAgent || null,

      /**
       * The name of the browser layout engine.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'layout': null,

      /**
       * The name of the product hosting the browser.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'product': null,

      /**
       * The name of the browser/environment.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'name': null,

      /**
       * The name of the product's manufacturer.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'manufacturer': null,

      /**
       * The name of the operating system.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'os': null,

      /**
       * The alpha/beta release indicator.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'prerelease': null,

      /**
       * The browser/environment version.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'version': null,

      /**
       * Return platform description when the platform object is coerced to a string.
       *
       * @memberOf Benchmark.platform
       * @type Function
       * @returns {String} The platform description.
       */
      'toString': function() {
        return this.description || '';
      }
    },

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf Benchmark
     * @type String
     */
    'version': '1.0.0',

    // an object of environment/feature detection flags
    'support': support,

    // clone objects
    'deepClone': deepClone,

    // iteration utility
    'each': each,

    // augment objects
    'extend': extend,

    // generic Array#filter
    'filter': filter,

    // generic Array#forEach
    'forEach': forEach,

    // generic own property iteration utility
    'forOwn': forOwn,

    // converts a number to a comma-separated string
    'formatNumber': formatNumber,

    // generic Object#hasOwnProperty
    // (trigger hasKey's lazy define before assigning it to Benchmark)
    'hasKey': (hasKey(Benchmark, ''), hasKey),

    // generic Array#indexOf
    'indexOf': indexOf,

    // template utility
    'interpolate': interpolate,

    // invokes a method on each item in an array
    'invoke': invoke,

    // generic Array#join for arrays and objects
    'join': join,

    // generic Array#map
    'map': map,

    // retrieves a property value from each item in an array
    'pluck': pluck,

    // generic Array#reduce
    'reduce': reduce
  });

  /*--------------------------------------------------------------------------*/

  extend(Benchmark.prototype, {

    /**
     * The number of times a test was executed.
     *
     * @memberOf Benchmark
     * @type Number
     */
    'count': 0,

    /**
     * The number of cycles performed while benchmarking.
     *
     * @memberOf Benchmark
     * @type Number
     */
    'cycles': 0,

    /**
     * The number of executions per second.
     *
     * @memberOf Benchmark
     * @type Number
     */
    'hz': 0,

    /**
     * The compiled test function.
     *
     * @memberOf Benchmark
     * @type Function|String
     */
    'compiled': undefined,

    /**
     * The error object if the test failed.
     *
     * @memberOf Benchmark
     * @type Object
     */
    'error': undefined,

    /**
     * The test to benchmark.
     *
     * @memberOf Benchmark
     * @type Function|String
     */
    'fn': undefined,

    /**
     * A flag to indicate if the benchmark is aborted.
     *
     * @memberOf Benchmark
     * @type Boolean
     */
    'aborted': false,

    /**
     * A flag to indicate if the benchmark is running.
     *
     * @memberOf Benchmark
     * @type Boolean
     */
    'running': false,

    /**
     * Compiled into the test and executed immediately **before** the test loop.
     *
     * @memberOf Benchmark
     * @type Function|String
     * @example
     *
     * // basic usage
     * var bench = Benchmark({
     *   'setup': function() {
     *     var c = this.count,
     *         element = document.getElementById('container');
     *     while (c--) {
     *       element.appendChild(document.createElement('div'));
     *     }
     *   },
     *   'fn': function() {
     *     element.removeChild(element.lastChild);
     *   }
     * });
     *
     * // compiles to something like:
     * var c = this.count,
     *     element = document.getElementById('container');
     * while (c--) {
     *   element.appendChild(document.createElement('div'));
     * }
     * var start = new Date;
     * while (count--) {
     *   element.removeChild(element.lastChild);
     * }
     * var end = new Date - start;
     *
     * // or using strings
     * var bench = Benchmark({
     *   'setup': '\
     *     var a = 0;\n\
     *     (function() {\n\
     *       (function() {\n\
     *         (function() {',
     *   'fn': 'a += 1;',
     *   'teardown': '\
     *          }())\n\
     *        }())\n\
     *      }())'
     * });
     *
     * // compiles to something like:
     * var a = 0;
     * (function() {
     *   (function() {
     *     (function() {
     *       var start = new Date;
     *       while (count--) {
     *         a += 1;
     *       }
     *       var end = new Date - start;
     *     }())
     *   }())
     * }())
     */
    'setup': noop,

    /**
     * Compiled into the test and executed immediately **after** the test loop.
     *
     * @memberOf Benchmark
     * @type Function|String
     */
    'teardown': noop,

    /**
     * An object of stats including mean, margin or error, and standard deviation.
     *
     * @memberOf Benchmark
     * @type Object
     */
    'stats': {

      /**
       * The margin of error.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'moe': 0,

      /**
       * The relative margin of error (expressed as a percentage of the mean).
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'rme': 0,

      /**
       * The standard error of the mean.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'sem': 0,

      /**
       * The sample standard deviation.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'deviation': 0,

      /**
       * The sample arithmetic mean.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'mean': 0,

      /**
       * The array of sampled periods.
       *
       * @memberOf Benchmark#stats
       * @type Array
       */
      'sample': [],

      /**
       * The sample variance.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'variance': 0
    },

    /**
     * An object of timing data including cycle, elapsed, period, start, and stop.
     *
     * @memberOf Benchmark
     * @type Object
     */
    'times': {

      /**
       * The time taken to complete the last cycle (secs).
       *
       * @memberOf Benchmark#times
       * @type Number
       */
      'cycle': 0,

      /**
       * The time taken to complete the benchmark (secs).
       *
       * @memberOf Benchmark#times
       * @type Number
       */
      'elapsed': 0,

      /**
       * The time taken to execute the test once (secs).
       *
       * @memberOf Benchmark#times
       * @type Number
       */
      'period': 0,

      /**
       * A timestamp of when the benchmark started (ms).
       *
       * @memberOf Benchmark#times
       * @type Number
       */
      'timeStamp': 0
    },

    // aborts benchmark (does not record times)
    'abort': abort,

    // creates a new benchmark using the same test and options
    'clone': clone,

    // compares benchmark's hertz with another
    'compare': compare,

    // executes listeners
    'emit': emit,

    // get listeners
    'listeners': listeners,

    // unregister listeners
    'off': off,

    // register listeners
    'on': on,

    // reset benchmark properties
    'reset': reset,

    // runs the benchmark
    'run': run,

    // pretty print benchmark info
    'toString': toStringBench
  });

  /*--------------------------------------------------------------------------*/

  extend(Deferred.prototype, {

    /**
     * The deferred benchmark instance.
     *
     * @memberOf Benchmark.Deferred
     * @type Object
     */
    'benchmark': null,

    /**
     * The number of deferred cycles performed while benchmarking.
     *
     * @memberOf Benchmark.Deferred
     * @type Number
     */
    'cycles': 0,

    /**
     * The time taken to complete the deferred benchmark (secs).
     *
     * @memberOf Benchmark.Deferred
     * @type Number
     */
    'elapsed': 0,

    /**
     * A timestamp of when the deferred benchmark started (ms).
     *
     * @memberOf Benchmark.Deferred
     * @type Number
     */
    'timeStamp': 0,

    // cycles/completes the deferred benchmark
    'resolve': resolve
  });

  /*--------------------------------------------------------------------------*/

  extend(Event.prototype, {

    /**
     * A flag to indicate if the emitters listener iteration is aborted.
     *
     * @memberOf Benchmark.Event
     * @type Boolean
     */
    'aborted': false,

    /**
     * A flag to indicate if the default action is cancelled.
     *
     * @memberOf Benchmark.Event
     * @type Boolean
     */
    'cancelled': false,

    /**
     * The object whose listeners are currently being processed.
     *
     * @memberOf Benchmark.Event
     * @type Object
     */
    'currentTarget': undefined,

    /**
     * The return value of the last executed listener.
     *
     * @memberOf Benchmark.Event
     * @type Mixed
     */
    'result': undefined,

    /**
     * The object to which the event was originally emitted.
     *
     * @memberOf Benchmark.Event
     * @type Object
     */
    'target': undefined,

    /**
     * A timestamp of when the event was created (ms).
     *
     * @memberOf Benchmark.Event
     * @type Number
     */
    'timeStamp': 0,

    /**
     * The event type.
     *
     * @memberOf Benchmark.Event
     * @type String
     */
    'type': ''
  });

  /*--------------------------------------------------------------------------*/

  /**
   * The default options copied by suite instances.
   *
   * @static
   * @memberOf Benchmark.Suite
   * @type Object
   */
  Suite.options = {

    /**
     * The name of the suite.
     *
     * @memberOf Benchmark.Suite.options
     * @type String
     */
    'name': undefined
  };

  /*--------------------------------------------------------------------------*/

  extend(Suite.prototype, {

    /**
     * The number of benchmarks in the suite.
     *
     * @memberOf Benchmark.Suite
     * @type Number
     */
    'length': 0,

    /**
     * A flag to indicate if the suite is aborted.
     *
     * @memberOf Benchmark.Suite
     * @type Boolean
     */
    'aborted': false,

    /**
     * A flag to indicate if the suite is running.
     *
     * @memberOf Benchmark.Suite
     * @type Boolean
     */
    'running': false,

    /**
     * An `Array#forEach` like method.
     * Callbacks may terminate the loop by explicitly returning `false`.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @returns {Object} The suite iterated over.
     */
    'forEach': methodize(forEach),

    /**
     * An `Array#indexOf` like method.
     *
     * @memberOf Benchmark.Suite
     * @param {Mixed} value The value to search for.
     * @returns {Number} The index of the matched value or `-1`.
     */
    'indexOf': methodize(indexOf),

    /**
     * Invokes a method on all benchmarks in the suite.
     *
     * @memberOf Benchmark.Suite
     * @param {String|Object} name The name of the method to invoke OR options object.
     * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the method with.
     * @returns {Array} A new array of values returned from each method invoked.
     */
    'invoke': methodize(invoke),

    /**
     * Converts the suite of benchmarks to a string.
     *
     * @memberOf Benchmark.Suite
     * @param {String} [separator=','] A string to separate each element of the array.
     * @returns {String} The string.
     */
    'join': [].join,

    /**
     * An `Array#map` like method.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @returns {Array} A new array of values returned by the callback.
     */
    'map': methodize(map),

    /**
     * Retrieves the value of a specified property from all benchmarks in the suite.
     *
     * @memberOf Benchmark.Suite
     * @param {String} property The property to pluck.
     * @returns {Array} A new array of property values.
     */
    'pluck': methodize(pluck),

    /**
     * Removes the last benchmark from the suite and returns it.
     *
     * @memberOf Benchmark.Suite
     * @returns {Mixed} The removed benchmark.
     */
    'pop': [].pop,

    /**
     * Appends benchmarks to the suite.
     *
     * @memberOf Benchmark.Suite
     * @returns {Number} The suite's new length.
     */
    'push': [].push,

    /**
     * Sorts the benchmarks of the suite.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} [compareFn=null] A function that defines the sort order.
     * @returns {Object} The sorted suite.
     */
    'sort': [].sort,

    /**
     * An `Array#reduce` like method.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @param {Mixed} accumulator Initial value of the accumulator.
     * @returns {Mixed} The accumulator.
     */
    'reduce': methodize(reduce),

    // aborts all benchmarks in the suite
    'abort': abortSuite,

    // adds a benchmark to the suite
    'add': add,

    // creates a new suite with cloned benchmarks
    'clone': cloneSuite,

    // executes listeners of a specified type
    'emit': emit,

    // creates a new suite of filtered benchmarks
    'filter': filterSuite,

    // get listeners
    'listeners': listeners,

    // unregister listeners
    'off': off,

   // register listeners
    'on': on,

    // resets all benchmarks in the suite
    'reset': resetSuite,

    // runs all benchmarks in the suite
    'run': runSuite,

    // array methods
    'concat': concat,

    'reverse': reverse,

    'shift': shift,

    'slice': slice,

    'splice': splice,

    'unshift': unshift
  });

  /*--------------------------------------------------------------------------*/

  // expose Deferred, Event and Suite
  extend(Benchmark, {
    'Deferred': Deferred,
    'Event': Event,
    'Suite': Suite
  });

  // expose Benchmark
  // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // define as an anonymous module so, through path mapping, it can be aliased
    define(function() {
      return Benchmark;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports) {
    // in Node.js or RingoJS v0.8.0+
    if (typeof module == 'object' && module && module.exports == freeExports) {
      (module.exports = Benchmark).Benchmark = Benchmark;
    }
    // in Narwhal or RingoJS v0.7.0-
    else {
      freeExports.Benchmark = Benchmark;
    }
  }
  // in a browser or Rhino
  else {
    // use square bracket notation so Closure Compiler won't munge `Benchmark`
    // http://code.google.com/closure/compiler/docs/api-tutorial3.html#export
    window['Benchmark'] = Benchmark;
  }

  // trigger clock's lazy define early to avoid a security error
  if (support.air) {
    clock({ '_original': { 'fn': noop, 'count': 1, 'options': {} } });
  }
}(this));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */
function universalModule() {
  var $Object = Object;

function createClass(ctor, methods, staticMethods, superClass) {
  var proto;
  if (superClass) {
    var superProto = superClass.prototype;
    proto = $Object.create(superProto);
  } else {
    proto = ctor.prototype;
  }
  $Object.keys(methods).forEach(function (key) {
    proto[key] = methods[key];
  });
  $Object.keys(staticMethods).forEach(function (key) {
    ctor[key] = staticMethods[key];
  });
  proto.constructor = ctor;
  ctor.prototype = proto;
  return ctor;
}

function superCall(self, proto, name, args) {
  return $Object.getPrototypeOf(proto)[name].apply(self, args);
}

function defaultSuperCall(self, proto, args) {
  superCall(self, proto, 'constructor', args);
}

var $traceurRuntime = {};
$traceurRuntime.createClass = createClass;
$traceurRuntime.superCall = superCall;
$traceurRuntime.defaultSuperCall = defaultSuperCall;
"use strict";
var DELETE = 'delete';
var SHIFT = 5;
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var NOT_SET = {};
var CHANGE_LENGTH = {value: false};
var DID_ALTER = {value: false};
function MakeRef(ref) {
  ref.value = false;
  return ref;
}
function SetRef(ref) {
  ref && (ref.value = true);
}
function OwnerID() {}
function arrCopy(arr, offset) {
  offset = offset || 0;
  var len = Math.max(0, arr.length - offset);
  var newArr = new Array(len);
  for (var ii = 0; ii < len; ii++) {
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
}
function invariant(condition, error) {
  if (!condition)
    throw new Error(error);
}
function hash(o) {
  if (!o) {
    return 0;
  }
  if (o === true) {
    return 1;
  }
  var type = typeof o;
  if (type === 'number') {
    if ((o | 0) === o) {
      return o & HASH_MAX_VAL;
    }
    o = '' + o;
    type = 'string';
  }
  if (type === 'string') {
    return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
  }
  if (o.hashCode) {
    return hash(typeof o.hashCode === 'function' ? o.hashCode() : o.hashCode);
  }
  return hashJSObj(o);
}
function cachedHashString(string) {
  var hash = stringHashCache[string];
  if (hash == null) {
    hash = hashString(string);
    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
      STRING_HASH_CACHE_SIZE = 0;
      stringHashCache = {};
    }
    STRING_HASH_CACHE_SIZE++;
    stringHashCache[string] = hash;
  }
  return hash;
}
function hashString(string) {
  var hash = 0;
  for (var ii = 0; ii < string.length; ii++) {
    hash = (31 * hash + string.charCodeAt(ii)) & HASH_MAX_VAL;
  }
  return hash;
}
function hashJSObj(obj) {
  var hash = obj[UID_HASH_KEY];
  if (hash)
    return hash;
  if (!canDefineProperty) {
    hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
    if (hash)
      return hash;
    hash = getIENodeHash(obj);
    if (hash)
      return hash;
  }
  if (!canDefineProperty || Object.isExtensible(obj)) {
    hash = ++objHashUID & HASH_MAX_VAL;
    if (canDefineProperty) {
      Object.defineProperty(obj, UID_HASH_KEY, {
        'enumerable': false,
        'configurable': false,
        'writable': false,
        'value': hash
      });
    } else if (propertyIsEnumerable && obj.propertyIsEnumerable === propertyIsEnumerable) {
      obj.propertyIsEnumerable = function() {
        return propertyIsEnumerable.apply(this, arguments);
      };
      obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
    } else if (obj.nodeType) {
      obj[UID_HASH_KEY] = hash;
    } else {
      throw new Error('Unable to set a non-enumerable property on object.');
    }
    return hash;
  } else {
    throw new Error('Non-extensible objects are not allowed as keys.');
  }
}
var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
var canDefineProperty = (function() {
  try {
    Object.defineProperty({}, 'x', {});
    return true;
  } catch (e) {
    return false;
  }
}());
function getIENodeHash(node) {
  if (node && node.nodeType > 0) {
    switch (node.nodeType) {
      case 1:
        return node.uniqueID;
      case 9:
        return node.documentElement && node.documentElement.uniqueID;
    }
  }
}
var HASH_MAX_VAL = 0x7FFFFFFF;
var objHashUID = 0;
var UID_HASH_KEY = '__immutablehash__';
if (typeof Symbol !== 'undefined') {
  UID_HASH_KEY = Symbol(UID_HASH_KEY);
}
var STRING_HASH_CACHE_MIN_STRLEN = 16;
var STRING_HASH_CACHE_MAX_SIZE = 255;
var STRING_HASH_CACHE_SIZE = 0;
var stringHashCache = {};
var ITERATE_KEYS = 0;
var ITERATE_VALUES = 1;
var ITERATE_ENTRIES = 2;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
var ITERATOR_SYMBOL = typeof Symbol !== 'undefined' ? Symbol.iterator : FAUX_ITERATOR_SYMBOL;
var Iterator = function Iterator(next) {
  this.next = next;
};
($traceurRuntime.createClass)(Iterator, {toString: function() {
    return '[Iterator]';
  }}, {});
var IteratorPrototype = Iterator.prototype;
IteratorPrototype.inspect = IteratorPrototype.toSource = function() {
  return this.toString();
};
IteratorPrototype[ITERATOR_SYMBOL] = function() {
  return this;
};
function iteratorValue(type, k, v, iteratorResult) {
  var value = type === 0 ? k : type === 1 ? v : [k, v];
  iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
    value: value,
    done: false
  });
  return iteratorResult;
}
function iteratorDone() {
  return {
    value: undefined,
    done: true
  };
}
function isIterable(maybeIterable) {
  return !!_iteratorFn(maybeIterable);
}
function isIterator(maybeIterator) {
  return maybeIterator && typeof maybeIterator.next === 'function';
}
function getIterator(iterable) {
  var iteratorFn = _iteratorFn(iterable);
  if (typeof iteratorFn === 'function') {
    return iteratorFn.call(iterable);
  }
}
function _iteratorFn(iterable) {
  return iterable && (iterable[ITERATOR_SYMBOL] || iterable[FAUX_ITERATOR_SYMBOL]);
}
var Sequence = function Sequence(value) {
  return $Sequence.from(arguments.length === 1 ? value : Array.prototype.slice.call(arguments));
};
var $Sequence = Sequence;
($traceurRuntime.createClass)(Sequence, {
  toArray: function() {
    assertNotInfinite(this.length);
    var array = new Array(this.length || 0);
    this.valueSeq().__iterate((function(v, i) {
      array[i] = v;
    }));
    return array;
  },
  toJS: function() {
    return this.map((function(value) {
      return value instanceof $Sequence ? value.toJS() : value;
    })).__toJS();
  },
  toMap: function() {
    assertNotInfinite(this.length);
    return Map.from(this);
  },
  toObject: function() {
    assertNotInfinite(this.length);
    var object = {};
    this.__iterate((function(v, k) {
      object[k] = v;
    }));
    return object;
  },
  toOrderedMap: function() {
    assertNotInfinite(this.length);
    return OrderedMap.from(this);
  },
  toSet: function() {
    assertNotInfinite(this.length);
    return Set.from(this);
  },
  toVector: function() {
    assertNotInfinite(this.length);
    return Vector.from(this);
  },
  toString: function() {
    return this.__toString('Seq {', '}');
  },
  __toString: function(head, tail) {
    if (this.length === 0) {
      return head + tail;
    }
    return head + ' ' + this.map(this.__toStringMapper).join(', ') + ' ' + tail;
  },
  __toStringMapper: function(v, k) {
    return k + ': ' + quoteString(v);
  },
  concat: function() {
    for (var values = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      values[$__2] = arguments[$__2];
    return concatFactory(this, values, true);
  },
  contains: function(searchValue) {
    return this.find((function(value) {
      return is(value, searchValue);
    }), null, NOT_SET) !== NOT_SET;
  },
  entries: function() {
    return this.__iterator(ITERATE_ENTRIES);
  },
  every: function(predicate, context) {
    var returnValue = true;
    this.__iterate((function(v, k, c) {
      if (!predicate.call(context, v, k, c)) {
        returnValue = false;
        return false;
      }
    }));
    return returnValue;
  },
  filter: function(predicate, context) {
    return filterFactory(this, predicate, context, true);
  },
  find: function(predicate, context, notSetValue) {
    var foundValue = notSetValue;
    this.__iterate((function(v, k, c) {
      if (predicate.call(context, v, k, c)) {
        foundValue = v;
        return false;
      }
    }));
    return foundValue;
  },
  forEach: function(sideEffect, context) {
    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
  },
  join: function(separator) {
    separator = separator !== undefined ? '' + separator : ',';
    var joined = '';
    var isFirst = true;
    this.__iterate((function(v) {
      isFirst ? (isFirst = false) : (joined += separator);
      joined += v != null ? v : '';
    }));
    return joined;
  },
  keys: function() {
    return this.__iterator(ITERATE_KEYS);
  },
  map: function(mapper, context) {
    return mapFactory(this, mapper, context);
  },
  reduce: function(reducer, initialReduction, context) {
    var reduction;
    var useFirst;
    if (arguments.length < 2) {
      useFirst = true;
    } else {
      reduction = initialReduction;
    }
    this.__iterate((function(v, k, c) {
      if (useFirst) {
        useFirst = false;
        reduction = v;
      } else {
        reduction = reducer.call(context, reduction, v, k, c);
      }
    }));
    return reduction;
  },
  reduceRight: function(reducer, initialReduction, context) {
    var reversed = this.toKeyedSeq().reverse();
    return reversed.reduce.apply(reversed, arguments);
  },
  reverse: function() {
    return reverseFactory(this);
  },
  slice: function(begin, end) {
    if (wholeSlice(begin, end, this.length)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.length);
    var resolvedEnd = resolveEnd(end, this.length);
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return this.cacheResult().slice(begin, end);
    }
    var skipped = resolvedBegin === 0 ? this : this.skip(resolvedBegin);
    return resolvedEnd == null || resolvedEnd === this.length ? skipped : skipped.take(resolvedEnd - resolvedBegin);
  },
  some: function(predicate, context) {
    return !this.every(not(predicate), context);
  },
  sort: function(comparator) {
    return this.sortBy(valueMapper, comparator);
  },
  values: function() {
    return this.__iterator(ITERATE_VALUES);
  },
  butLast: function() {
    return this.slice(0, -1);
  },
  count: function(predicate, context) {
    if (!predicate) {
      if (this.length == null) {
        this.length = this.__iterate(returnTrue);
      }
      return this.length;
    }
    return this.filter(predicate, context).count();
  },
  countBy: function(grouper, context) {
    var $__0 = this;
    var groupMap = {};
    var groups = [];
    this.__iterate((function(v, k) {
      var g = grouper.call(context, v, k, $__0);
      var h = hash(g);
      if (!groupMap.hasOwnProperty(h)) {
        groupMap[h] = groups.length;
        groups.push([g, 1]);
      } else {
        groups[groupMap[h]][1]++;
      }
    }));
    return $Sequence(groups).fromEntrySeq();
  },
  equals: function(other) {
    if (this === other) {
      return true;
    }
    if (!(other instanceof $Sequence)) {
      return false;
    }
    if (this.length != null && other.length != null) {
      if (this.length !== other.length) {
        return false;
      }
      if (this.length === 0 && other.length === 0) {
        return true;
      }
    }
    if (this.__hash != null && other.__hash != null && this.__hash !== other.__hash) {
      return false;
    }
    return this.__deepEquals(other);
  },
  __deepEquals: function(other) {
    var entries = this.entries();
    return other.every((function(v, k) {
      var entry = entries.next().value;
      return entry && is(entry[0], k) && is(entry[1], v);
    })) && entries.next().done;
  },
  entrySeq: function() {
    var sequence = this;
    if (sequence._cache) {
      return $Sequence(sequence._cache);
    }
    var entriesSequence = sequence.toKeyedSeq().map(entryMapper).valueSeq();
    entriesSequence.fromEntries = (function() {
      return sequence;
    });
    return entriesSequence;
  },
  findKey: function(predicate, context) {
    var foundKey;
    this.__iterate((function(v, k, c) {
      if (predicate.call(context, v, k, c)) {
        foundKey = k;
        return false;
      }
    }));
    return foundKey;
  },
  findLast: function(predicate, context, notSetValue) {
    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
  },
  findLastKey: function(predicate, context) {
    return this.toKeyedSeq().reverse().findKey(predicate, context);
  },
  first: function() {
    return this.find(returnTrue);
  },
  flatMap: function(mapper, context) {
    return this.map(mapper, context).flatten();
  },
  flatten: function() {
    return flattenFactory(this, true);
  },
  flip: function() {
    return flipFactory(this);
  },
  get: function(searchKey, notSetValue) {
    return this.find((function(_, key) {
      return is(key, searchKey);
    }), null, notSetValue);
  },
  getIn: function(searchKeyPath, notSetValue) {
    var nested = this;
    if (searchKeyPath) {
      for (var ii = 0; ii < searchKeyPath.length; ii++) {
        nested = nested && nested.get ? nested.get(searchKeyPath[ii], NOT_SET) : NOT_SET;
        if (nested === NOT_SET) {
          return notSetValue;
        }
      }
    }
    return nested;
  },
  groupBy: function(grouper, context) {
    return groupByFactory(this, grouper, context, true);
  },
  has: function(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  },
  keySeq: function() {
    return this.flip().valueSeq();
  },
  last: function() {
    return this.findLast(returnTrue);
  },
  mapEntries: function(mapper, context) {
    var $__0 = this;
    return this.entrySeq().map((function(entry, index) {
      return mapper.call(context, entry, index, $__0);
    })).fromEntrySeq();
  },
  mapKeys: function(mapper, context) {
    var $__0 = this;
    return this.flip().map((function(k, v) {
      return mapper.call(context, k, v, $__0);
    })).flip();
  },
  rest: function() {
    return this.slice(1);
  },
  skip: function(amount) {
    return skipFactory(this, amount, true);
  },
  skipLast: function(amount) {
    return this.reverse().skip(amount).reverse();
  },
  skipWhile: function(predicate, context) {
    return skipWhileFactory(this, predicate, context, true);
  },
  skipUntil: function(predicate, context) {
    return this.skipWhile(not(predicate), context);
  },
  sortBy: function(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    return $Sequence(this.entrySeq().entrySeq().toArray().sort((function(a, b) {
      return comparator(mapper(a[1][1], a[1][0], seq), mapper(b[1][1], b[1][0], seq)) || a[0] - b[0];
    }))).fromEntrySeq().valueSeq().fromEntrySeq();
  },
  take: function(amount) {
    return takeFactory(this, amount);
  },
  takeLast: function(amount) {
    return this.reverse().take(amount).reverse();
  },
  takeWhile: function(predicate, context) {
    return takeWhileFactory(this, predicate, context);
  },
  takeUntil: function(predicate, context) {
    return this.takeWhile(not(predicate), context);
  },
  toKeyedSeq: function() {
    return this;
  },
  valueSeq: function() {
    return new ValuesSequence(this);
  },
  cacheResult: function() {
    if (!this._cache && this.__iterateUncached) {
      assertNotInfinite(this.length);
      this._cache = this.entrySeq().toArray();
      if (this.length == null) {
        this.length = this._cache.length;
      }
    }
    return this;
  },
  hashCode: function() {
    return this.__hash || (this.__hash = this.length === Infinity ? 0 : this.reduce((function(h, v, k) {
      return (h + (hash(v) ^ (v === k ? 0 : hash(k)))) & HASH_MAX_VAL;
    }), 0));
  },
  __makeSequence: function() {
    return Object.create(SequencePrototype);
  },
  __iterate: function(fn, reverse) {
    return iterate(this, fn, reverse, true);
  },
  __iterator: function(type, reverse) {
    return iterator(this, type, reverse, true);
  }
}, {from: function(value) {
    if (value instanceof $Sequence) {
      return value;
    }
    if (!Array.isArray(value)) {
      if (isIterator(value)) {
        return new IteratorSequence(value);
      }
      if (isIterable(value)) {
        return new IterableSequence(value);
      }
      if (value && value.constructor === Object) {
        return new ObjectSequence(value);
      }
      value = [value];
    }
    return new ArraySequence(value);
  }});
var SequencePrototype = Sequence.prototype;
SequencePrototype[ITERATOR_SYMBOL] = SequencePrototype.entries;
SequencePrototype.toJSON = SequencePrototype.toJS;
SequencePrototype.__toJS = SequencePrototype.toObject;
SequencePrototype.inspect = SequencePrototype.toSource = function() {
  return this.toString();
};
SequencePrototype.chain = SequencePrototype.flatMap;
var IndexedSequence = function IndexedSequence() {
  $traceurRuntime.defaultSuperCall(this, $IndexedSequence.prototype, arguments);
};
var $IndexedSequence = IndexedSequence;
($traceurRuntime.createClass)(IndexedSequence, {
  toString: function() {
    return this.__toString('Seq [', ']');
  },
  concat: function() {
    for (var values = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      values[$__3] = arguments[$__3];
    return concatFactory(this, values, false);
  },
  filter: function(predicate, context) {
    return filterFactory(this, predicate, context, false);
  },
  findIndex: function(predicate, context) {
    var key = this.findKey(predicate, context);
    return key == null ? -1 : key;
  },
  indexOf: function(searchValue) {
    return this.findIndex((function(value) {
      return is(value, searchValue);
    }));
  },
  lastIndexOf: function(searchValue) {
    return this.toKeyedSeq().reverse().indexOf(searchValue);
  },
  splice: function(index, removeNum) {
    var numArgs = arguments.length;
    removeNum = Math.max(removeNum | 0, 0);
    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
      return this;
    }
    index = resolveBegin(index, this.length);
    var spliced = this.slice(0, index);
    return numArgs === 1 ? spliced : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum));
  },
  findLastIndex: function(predicate, context) {
    return this.toKeyedSeq().reverse().findIndex(predicate, context);
  },
  first: function() {
    return this.get(0);
  },
  flatten: function() {
    return flattenFactory(this, false);
  },
  flip: function() {
    return flipFactory(this.toKeyedSeq());
  },
  fromEntrySeq: function() {
    return new FromEntriesSequence(this);
  },
  get: function(index, notSetValue) {
    index = wrapIndex(this, index);
    return (index < 0 || (this.length === Infinity || (this.length != null && index > this.length))) ? notSetValue : this.find((function(_, key) {
      return key === index;
    }), null, notSetValue);
  },
  groupBy: function(grouper, context) {
    return groupByFactory(this, grouper, context, false);
  },
  has: function(index) {
    index = wrapIndex(this, index);
    return index >= 0 && (this.length != null ? this.length === Infinity || index < this.length : this.indexOf(index) !== -1);
  },
  interpose: function(separator) {
    return interposeFactory(this, separator);
  },
  last: function() {
    return this.get(this.length ? this.length - 1 : 0);
  },
  skip: function(amount) {
    var seq = this;
    var skipSeq = skipFactory(seq, amount, false);
    if (skipSeq !== seq) {
      skipSeq.get = function(index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 ? seq.get(index + amount, notSetValue) : notSetValue;
      };
    }
    return skipSeq;
  },
  skipWhile: function(predicate, context) {
    return skipWhileFactory(this, predicate, context, false);
  },
  sortBy: function(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    return Sequence(this.entrySeq().toArray().sort((function(a, b) {
      return comparator(mapper(a[1], a[0], seq), mapper(b[1], b[0], seq)) || a[0] - b[0];
    }))).fromEntrySeq().valueSeq();
  },
  take: function(amount) {
    var seq = this;
    var takeSeq = takeFactory(seq, amount);
    if (takeSeq !== seq) {
      takeSeq.get = function(index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 && index < amount ? seq.get(index, notSetValue) : notSetValue;
      };
    }
    return takeSeq;
  },
  toKeyedSeq: function() {
    return new KeyedIndexedSequence(this);
  },
  valueSeq: function() {
    return this;
  },
  __makeSequence: function() {
    return Object.create(IndexedSequencePrototype);
  },
  __iterate: function(fn, reverse) {
    return iterate(this, fn, reverse, false);
  },
  __iterator: function(type, reverse) {
    return iterator(this, type, reverse, false);
  }
}, {}, Sequence);
var IndexedSequencePrototype = IndexedSequence.prototype;
IndexedSequencePrototype[ITERATOR_SYMBOL] = IndexedSequencePrototype.values;
IndexedSequencePrototype.__toJS = IndexedSequencePrototype.toArray;
IndexedSequencePrototype.__toStringMapper = quoteString;
var IteratorSequence = function IteratorSequence(iterator) {
  this._iterator = iterator;
  this._iteratorCache = [];
};
($traceurRuntime.createClass)(IteratorSequence, {
  __iterateUncached: function(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterator = this._iterator;
    var cache = this._iteratorCache;
    var iterations = 0;
    while (iterations < cache.length) {
      if (fn(cache[iterations], iterations++, this) === false) {
        return iterations;
      }
    }
    var step;
    while (!(step = iterator.next()).done) {
      var val = step.value;
      cache[iterations] = val;
      if (fn(val, iterations++, this) === false) {
        break;
      }
    }
    return iterations;
  },
  __iteratorUncached: function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = this._iterator;
    var cache = this._iteratorCache;
    var iterations = 0;
    return new Iterator((function() {
      if (iterations >= cache.length) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        cache[iterations] = step.value;
      }
      return iteratorValue(type, iterations, cache[iterations++]);
    }));
  }
}, {}, IndexedSequence);
var IterableSequence = function IterableSequence(iterable) {
  this._iterable = iterable;
  this.length = iterable.length || iterable.size;
};
($traceurRuntime.createClass)(IterableSequence, {
  __iterateUncached: function(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterable = this._iterable;
    var iterator = getIterator(iterable);
    var iterations = 0;
    if (isIterator(iterator)) {
      var step;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
    }
    return iterations;
  },
  __iteratorUncached: function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterable = this._iterable;
    var iterator = getIterator(iterable);
    if (!isIterator(iterator)) {
      return new Iterator((function() {
        return iteratorDone();
      }));
    }
    var iterations = 0;
    return new Iterator((function() {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, iterations++, step.value);
    }));
  }
}, {}, IndexedSequence);
var ObjectSequence = function ObjectSequence(object) {
  var keys = Object.keys(object);
  this._object = object;
  this._keys = keys;
  this.length = keys.length;
};
($traceurRuntime.createClass)(ObjectSequence, {
  toObject: function() {
    return this._object;
  },
  get: function(key, notSetValue) {
    if (notSetValue !== undefined && !this.has(key)) {
      return notSetValue;
    }
    return this._object[key];
  },
  has: function(key) {
    return this._object.hasOwnProperty(key);
  },
  __iterate: function(fn, reverse) {
    var object = this._object;
    var keys = this._keys;
    var maxIndex = keys.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      var key = keys[reverse ? maxIndex - ii : ii];
      if (fn(object[key], key, this) === false) {
        return ii + 1;
      }
    }
    return ii;
  },
  __iterator: function(type, reverse) {
    var object = this._object;
    var keys = this._keys;
    var maxIndex = keys.length - 1;
    var ii = 0;
    return new Iterator((function() {
      var key = keys[reverse ? maxIndex - ii : ii];
      return ii++ > maxIndex ? iteratorDone() : iteratorValue(type, key, object[key]);
    }));
  }
}, {}, Sequence);
var ArraySequence = function ArraySequence(array) {
  this._array = array;
  this.length = array.length;
};
($traceurRuntime.createClass)(ArraySequence, {
  toArray: function() {
    return this._array;
  },
  get: function(index, notSetValue) {
    return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
  },
  __iterate: function(fn, reverse) {
    var array = this._array;
    var maxIndex = array.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
        return ii + 1;
      }
    }
    return ii;
  },
  __iterator: function(type, reverse) {
    var array = this._array;
    var maxIndex = array.length - 1;
    var ii = 0;
    return new Iterator((function() {
      return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++]);
    }));
  }
}, {}, IndexedSequence);
function ensureLength(indexedSeq) {
  if (indexedSeq.length == null) {
    indexedSeq.cacheResult();
  }
  invariant(indexedSeq.length < Infinity, 'Cannot reverse infinite range.');
  return indexedSeq.length;
}
function wholeSlice(begin, end, length) {
  return (begin === 0 || (length != null && begin <= -length)) && (end == null || (length != null && end >= length));
}
function resolveBegin(begin, length) {
  return resolveIndex(begin, length, 0);
}
function resolveEnd(end, length) {
  return resolveIndex(end, length, length);
}
function resolveIndex(index, length, defaultIndex) {
  return index == null ? defaultIndex : index < 0 ? Math.max(0, length + index) : length ? Math.min(length, index) : index;
}
function valueMapper(v) {
  return v;
}
function entryMapper(v, k) {
  return [k, v];
}
function returnTrue() {
  return true;
}
function not(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  };
}
function quoteString(value) {
  return typeof value === 'string' ? JSON.stringify(value) : value;
}
function defaultComparator(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}
function wrapIndex(seq, index) {
  if (index < 0) {
    if (seq.length == null) {
      seq.cacheResult();
    }
    return seq.length + index;
  }
  return index;
}
function assertNotInfinite(length) {
  invariant(length !== Infinity, 'Cannot perform this action with an infinite sequence.');
}
function iterate(sequence, fn, reverse, useKeys) {
  var cache = sequence._cache;
  if (cache) {
    var maxIndex = cache.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      var entry = cache[reverse ? maxIndex - ii : ii];
      if (fn(entry[1], useKeys ? entry[0] : ii, sequence) === false) {
        return ii + 1;
      }
    }
    return ii;
  }
  return sequence.__iterateUncached(fn, reverse);
}
function iterator(sequence, type, reverse, useKeys) {
  var cache = sequence._cache;
  if (cache) {
    var maxIndex = cache.length - 1;
    var ii = 0;
    return new Iterator((function() {
      var entry = cache[reverse ? maxIndex - ii : ii];
      return ii++ > maxIndex ? iteratorDone() : iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
    }));
  }
  return sequence.__iteratorUncached(type, reverse);
}
var ValuesSequence = function ValuesSequence(seq) {
  this._seq = seq;
  this.length = seq.length;
};
($traceurRuntime.createClass)(ValuesSequence, {
  get: function(key, notSetValue) {
    return this._seq.get(key, notSetValue);
  },
  has: function(key) {
    return this._seq.has(key);
  },
  cacheResult: function() {
    this._seq.cacheResult();
    this.length = this._seq.length;
    return this;
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    var iterations = 0;
    return this._seq.__iterate((function(v) {
      return fn(v, iterations++, $__0);
    }), reverse);
  },
  __iterator: function(type, reverse) {
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    var iterations = 0;
    return new Iterator((function() {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, iterations++, step.value, step);
    }));
  }
}, {}, IndexedSequence);
var KeyedIndexedSequence = function KeyedIndexedSequence(indexedSeq) {
  this._seq = indexedSeq;
  this.length = indexedSeq.length;
};
($traceurRuntime.createClass)(KeyedIndexedSequence, {
  get: function(key, notSetValue) {
    return this._seq.get(key, notSetValue);
  },
  has: function(key) {
    return this._seq.has(key);
  },
  valueSeq: function() {
    return this._seq;
  },
  reverse: function() {
    var $__0 = this;
    var reversedSequence = reverseFactory(this);
    reversedSequence.valueSeq = (function() {
      return $__0._seq.reverse();
    });
    return reversedSequence;
  },
  map: function(mapper, context) {
    var $__0 = this;
    var mappedSequence = mapFactory(this, mapper, context);
    mappedSequence.valueSeq = (function() {
      return $__0._seq.map(mapper, context);
    });
    return mappedSequence;
  },
  cacheResult: function() {
    this._seq.cacheResult();
    this.length = this._seq.length;
    return this;
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    var ii = reverse ? ensureLength(this) : 0;
    return this._seq.__iterate((function(v) {
      return fn(v, reverse ? --ii : ii++, $__0);
    }), reverse);
  },
  __iterator: function(type, reverse) {
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    var ii = reverse ? ensureLength(this) : 0;
    return new Iterator((function() {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, reverse ? --ii : ii++, step.value, step);
    }));
  }
}, {}, Sequence);
var FromEntriesSequence = function FromEntriesSequence(entriesSeq) {
  this._seq = entriesSeq;
  this.length = entriesSeq.length;
};
($traceurRuntime.createClass)(FromEntriesSequence, {
  entrySeq: function() {
    return this._seq;
  },
  cacheResult: function() {
    this._seq.cacheResult();
    this.length = this._seq.length;
    return this;
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    return this._seq.__iterate((function(entry) {
      return entry && fn(entry[1], entry[0], $__0);
    }), reverse);
  },
  __iterator: function(type, reverse) {
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    return new Iterator((function() {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        if (entry) {
          return type === ITERATE_ENTRIES ? step : iteratorValue(type, entry[0], entry[1], step);
        }
      }
    }));
  }
}, {}, Sequence);
function flipFactory(sequence) {
  var flipSequence = sequence.__makeSequence();
  flipSequence.length = sequence.length;
  flipSequence.flip = (function() {
    return sequence;
  });
  flipSequence.reverse = function() {
    var reversedSequence = sequence.reverse.apply(this);
    reversedSequence.flip = (function() {
      return sequence.reverse();
    });
    return reversedSequence;
  };
  flipSequence.has = (function(key) {
    return sequence.contains(key);
  });
  flipSequence.contains = (function(key) {
    return sequence.has(key);
  });
  flipSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    return sequence.__iterate((function(v, k) {
      return fn(k, v, $__0) !== false;
    }), reverse);
  };
  flipSequence.__iteratorUncached = function(type, reverse) {
    if (type === ITERATE_ENTRIES) {
      var iterator = sequence.__iterator(type, reverse);
      return new Iterator((function() {
        var step = iterator.next();
        if (!step.done) {
          var k = step.value[0];
          step.value[0] = step.value[1];
          step.value[1] = k;
        }
        return step;
      }));
    }
    return sequence.__iterator(type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES, reverse);
  };
  return flipSequence;
}
function mapFactory(sequence, mapper, context) {
  var mappedSequence = sequence.__makeSequence();
  mappedSequence.length = sequence.length;
  mappedSequence.has = (function(key) {
    return sequence.has(key);
  });
  mappedSequence.get = (function(key, notSetValue) {
    var v = sequence.get(key, NOT_SET);
    return v === NOT_SET ? notSetValue : mapper.call(context, v, key, sequence);
  });
  mappedSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    return sequence.__iterate((function(v, k, c) {
      return fn(mapper.call(context, v, k, c), k, $__0) !== false;
    }), reverse);
  };
  mappedSequence.__iteratorUncached = function(type, reverse) {
    var iterator = sequence.__iterator(ITERATE_ENTRIES, reverse);
    return new Iterator((function() {
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var key = entry[0];
      return iteratorValue(type, key, mapper.call(context, entry[1], key, sequence), step);
    }));
  };
  return mappedSequence;
}
function reverseFactory(sequence) {
  var reversedSequence = sequence.__makeSequence();
  reversedSequence.length = sequence.length;
  reversedSequence.reverse = (function() {
    return sequence;
  });
  reversedSequence.flip = function() {
    var flipSequence = sequence.flip.apply(this);
    flipSequence.reverse = (function() {
      return sequence.flip();
    });
    return flipSequence;
  };
  reversedSequence.get = (function(key, notSetValue) {
    return sequence.get(key, notSetValue);
  });
  reversedSequence.has = (function(key) {
    return sequence.has(key);
  });
  reversedSequence.contains = (function(value) {
    return sequence.contains(value);
  });
  reversedSequence.cacheResult = function() {
    sequence.cacheResult();
    this.length = sequence.length;
    return this;
  };
  reversedSequence.__iterate = function(fn, reverse) {
    var $__0 = this;
    return sequence.__iterate((function(v, k) {
      return fn(v, k, $__0);
    }), !reverse);
  };
  reversedSequence.__iterator = (function(type, reverse) {
    return sequence.__iterator(type, !reverse);
  });
  return reversedSequence;
}
function filterFactory(sequence, predicate, context, useKeys) {
  var filterSequence = sequence.__makeSequence();
  filterSequence.has = (function(key) {
    var v = sequence.get(key, NOT_SET);
    return v !== NOT_SET && !!predicate.call(context, v, key, sequence);
  });
  filterSequence.get = (function(key, notSetValue) {
    var v = sequence.get(key, NOT_SET);
    return v !== NOT_SET && predicate.call(context, v, key, sequence) ? v : notSetValue;
  });
  filterSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    var iterations = 0;
    sequence.__iterate((function(v, k, c) {
      if (predicate.call(context, v, k, c)) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, $__0);
      }
    }), reverse);
    return iterations;
  };
  filterSequence.__iteratorUncached = function(type, reverse) {
    var iterator = sequence.__iterator(ITERATE_ENTRIES, reverse);
    var iterations = 0;
    return new Iterator((function() {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        var value = entry[1];
        if (predicate.call(context, value, key, sequence)) {
          return iteratorValue(type, useKeys ? key : iterations++, value, step);
        }
      }
    }));
  };
  return filterSequence;
}
function groupByFactory(seq, grouper, context, useKeys) {
  var groupMap = {};
  var groups = [];
  seq.__iterate((function(v, k) {
    var g = grouper.call(context, v, k, seq);
    var h = hash(g);
    var e = useKeys ? [k, v] : v;
    if (!groupMap.hasOwnProperty(h)) {
      groupMap[h] = groups.length;
      groups.push([g, [e]]);
    } else {
      groups[groupMap[h]][1].push(e);
    }
  }));
  return Sequence(groups).fromEntrySeq().map(useKeys ? (function(group) {
    return Sequence(group).fromEntrySeq();
  }) : (function(group) {
    return Sequence(group);
  }));
}
function takeFactory(sequence, amount) {
  if (amount > sequence.length) {
    return sequence;
  }
  if (amount < 0) {
    amount = 0;
  }
  var takeSequence = sequence.__makeSequence();
  takeSequence.length = sequence.length && Math.min(sequence.length, amount);
  takeSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    if (amount === 0) {
      return 0;
    }
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    sequence.__iterate((function(v, k) {
      return ++iterations && fn(v, k, $__0) !== false && iterations < amount;
    }));
    return iterations;
  };
  takeSequence.__iteratorUncached = function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = amount && sequence.__iterator(type, reverse);
    var iterations = 0;
    return new Iterator((function() {
      if (iterations++ > amount) {
        return iteratorDone();
      }
      return iterator.next();
    }));
  };
  return takeSequence;
}
function takeWhileFactory(sequence, predicate, context) {
  var takeSequence = sequence.__makeSequence();
  takeSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    sequence.__iterate((function(v, k, c) {
      return predicate.call(context, v, k, c) && ++iterations && fn(v, k, $__0);
    }));
    return iterations;
  };
  takeSequence.__iteratorUncached = function(type, reverse) {
    var $__0 = this;
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = sequence.__iterator(ITERATE_ENTRIES, reverse);
    var iterating = true;
    return new Iterator((function() {
      if (!iterating) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var k = entry[0];
      var v = entry[1];
      if (!predicate.call(context, v, k, $__0)) {
        iterating = false;
        return iteratorDone();
      }
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    }));
  };
  return takeSequence;
}
function skipFactory(sequence, amount, useKeys) {
  if (amount <= 0) {
    return sequence;
  }
  var skipSequence = sequence.__makeSequence();
  skipSequence.length = sequence.length && Math.max(0, sequence.length - amount);
  skipSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var skipped = 0;
    var isSkipping = true;
    var iterations = 0;
    sequence.__iterate((function(v, k) {
      if (!(isSkipping && (isSkipping = skipped++ < amount))) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, $__0);
      }
    }));
    return iterations;
  };
  skipSequence.__iteratorUncached = function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = amount && sequence.__iterator(type, reverse);
    var skipped = 0;
    var iterations = 0;
    return new Iterator((function() {
      while (skipped < amount) {
        skipped++;
        iterator.next();
      }
      var step = iterator.next();
      if (useKeys || type === ITERATE_VALUES) {
        return step;
      } else if (type === ITERATE_KEYS) {
        return iteratorValue(type, iterations++, null, step);
      } else {
        return iteratorValue(type, iterations++, step.value[1], step);
      }
    }));
  };
  return skipSequence;
}
function skipWhileFactory(sequence, predicate, context, useKeys) {
  var skipSequence = sequence.__makeSequence();
  skipSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var isSkipping = true;
    var iterations = 0;
    sequence.__iterate((function(v, k, c) {
      if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, $__0);
      }
    }));
    return iterations;
  };
  skipSequence.__iteratorUncached = function(type, reverse) {
    var $__0 = this;
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = sequence.__iterator(ITERATE_ENTRIES, reverse);
    var skipping = true;
    var iterations = 0;
    return new Iterator((function() {
      var step,
          k,
          v;
      do {
        step = iterator.next();
        if (step.done) {
          if (useKeys || type === ITERATE_VALUES) {
            return step;
          } else if (type === ITERATE_KEYS) {
            return iteratorValue(type, iterations++, null, step);
          } else {
            return iteratorValue(type, iterations++, step.value[1], step);
          }
        }
        var entry = step.value;
        k = entry[0];
        v = entry[1];
        skipping && (skipping = predicate.call(context, v, k, $__0));
      } while (skipping);
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    }));
  };
  return skipSequence;
}
function concatFactory(sequence, values, useKeys) {
  var sequences = [sequence].concat(values);
  var concatSequence = Sequence(sequences);
  if (useKeys) {
    concatSequence = concatSequence.toKeyedSeq();
  }
  concatSequence = concatSequence.flatten();
  concatSequence.length = sequences.reduce((function(sum, seq) {
    if (sum !== undefined) {
      var len = Sequence(seq).length;
      if (len != null) {
        return sum + len;
      }
    }
  }), 0);
  return concatSequence;
}
function flattenFactory(sequence, useKeys) {
  var flatSequence = sequence.__makeSequence();
  flatSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    var iterations = 0;
    sequence.__iterate((function(seq) {
      var stopped = false;
      Sequence(seq).__iterate((function(v, k) {
        if (fn(v, useKeys ? k : iterations++, $__0) === false) {
          stopped = true;
          return false;
        }
      }), reverse);
      return !stopped;
    }), reverse);
    return iterations;
  };
  flatSequence.__iteratorUncached = function(type, reverse) {
    var sequenceIterator = sequence.__iterator(ITERATE_VALUES, reverse);
    var iterator;
    var iterations = 0;
    return new Iterator((function() {
      while (true) {
        if (iterator) {
          var step = iterator.next();
          if (!step.done) {
            if (useKeys || type === ITERATE_VALUES) {
              return step;
            } else if (type === ITERATE_KEYS) {
              return iteratorValue(type, iterations++, null, step);
            } else {
              return iteratorValue(type, iterations++, step.value[1], step);
            }
          }
        }
        var sequenceStep = sequenceIterator.next();
        if (sequenceStep.done) {
          return sequenceStep;
        }
        iterator = Sequence(sequenceStep.value).__iterator(type, reverse);
      }
    }));
  };
  return flatSequence;
}
function interposeFactory(sequence, separator) {
  var interposedSequence = sequence.__makeSequence();
  interposedSequence.length = sequence.length && sequence.length * 2 - 1;
  interposedSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    var iterations = 0;
    sequence.__iterate((function(v, k) {
      return (!iterations || fn(separator, iterations++, $__0) !== false) && fn(v, iterations++, $__0) !== false;
    }), reverse);
    return iterations;
  };
  interposedSequence.__iteratorUncached = function(type, reverse) {
    var iterator = sequence.__iterator(ITERATE_VALUES, reverse);
    var iterations = 0;
    var step;
    return new Iterator((function() {
      if (!step || iterations % 2) {
        step = iterator.next();
        if (step.done) {
          return step;
        }
      }
      return iterations % 2 ? iteratorValue(type, iterations++, separator) : iteratorValue(type, iterations++, step.value, step);
    }));
  };
  return interposedSequence;
}
var Cursor = function Cursor(rootData, keyPath, onChange, value) {
  value = value ? value : rootData.getIn(keyPath);
  this.length = value instanceof Sequence ? value.length : null;
  this._rootData = rootData;
  this._keyPath = keyPath;
  this._onChange = onChange;
};
($traceurRuntime.createClass)(Cursor, {
  deref: function(notSetValue) {
    return this._rootData.getIn(this._keyPath, notSetValue);
  },
  get: function(key, notSetValue) {
    if (Array.isArray(key) && key.length === 0) {
      return this;
    }
    var value = this._rootData.getIn(this._keyPath.concat(key), NOT_SET);
    return value === NOT_SET ? notSetValue : wrappedValue(this, key, value);
  },
  set: function(key, value) {
    return updateCursor(this, (function(m) {
      return m.set(key, value);
    }), key);
  },
  remove: function(key) {
    return updateCursor(this, (function(m) {
      return m.remove(key);
    }), key);
  },
  clear: function() {
    return updateCursor(this, (function(m) {
      return m.clear();
    }));
  },
  update: function(keyOrFn, notSetValue, updater) {
    return arguments.length === 1 ? updateCursor(this, keyOrFn) : updateCursor(this, (function(map) {
      return map.update(keyOrFn, notSetValue, updater);
    }), keyOrFn);
  },
  withMutations: function(fn) {
    return updateCursor(this, (function(m) {
      return (m || Map.empty()).withMutations(fn);
    }));
  },
  cursor: function(subKey) {
    return Array.isArray(subKey) && subKey.length === 0 ? this : subCursor(this, subKey);
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    var deref = this.deref();
    return deref && deref.__iterate ? deref.__iterate((function(v, k) {
      return fn(wrappedValue($__0, k, v), k, $__0);
    }), reverse) : 0;
  },
  __iterator: function(type, reverse) {
    var $__0 = this;
    var deref = this.deref();
    var iterator = deref && deref.__iterator && deref.__iterator(ITERATE_ENTRIES, reverse);
    return new Iterator((function() {
      if (!iterator) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var k = entry[0];
      var v = entry[1];
      return iteratorValue(type, k, wrappedValue($__0, k, v), step);
    }));
  }
}, {}, Sequence);
Cursor.prototype[DELETE] = Cursor.prototype.remove;
Cursor.prototype.getIn = Cursor.prototype.get;
function wrappedValue(cursor, key, value) {
  return value instanceof Sequence ? subCursor(cursor, key, value) : value;
}
function subCursor(cursor, key, value) {
  return new Cursor(cursor._rootData, cursor._keyPath.concat(key), cursor._onChange, value);
}
function updateCursor(cursor, changeFn, changeKey) {
  var newRootData = cursor._rootData.updateIn(cursor._keyPath, changeKey ? Map.empty() : undefined, changeFn);
  var keyPath = cursor._keyPath || [];
  cursor._onChange && cursor._onChange.call(undefined, newRootData, cursor._rootData, changeKey ? keyPath.concat(changeKey) : keyPath);
  return new Cursor(newRootData, cursor._keyPath, cursor._onChange);
}
function is(first, second) {
  if (first instanceof Cursor) {
    first = first.deref();
  }
  if (second instanceof Cursor) {
    second = second.deref();
  }
  if (first === second) {
    return first !== 0 || second !== 0 || 1 / first === 1 / second;
  }
  if (first !== first) {
    return second !== second;
  }
  if (first instanceof Sequence) {
    return first.equals(second);
  }
  return false;
}
var Map = function Map(sequence) {
  var map = $Map.empty();
  return sequence ? sequence.constructor === $Map ? sequence : map.merge(sequence) : map;
};
var $Map = Map;
($traceurRuntime.createClass)(Map, {
  toString: function() {
    return this.__toString('Map {', '}');
  },
  get: function(k, notSetValue) {
    return this._root ? this._root.get(0, hash(k), k, notSetValue) : notSetValue;
  },
  set: function(k, v) {
    return updateMap(this, k, v);
  },
  remove: function(k) {
    return updateMap(this, k, NOT_SET);
  },
  update: function(k, notSetValue, updater) {
    return arguments.length === 1 ? this.updateIn([], null, k) : this.updateIn([k], notSetValue, updater);
  },
  updateIn: function(keyPath, notSetValue, updater) {
    var $__14;
    if (!updater) {
      ($__14 = [notSetValue, updater], updater = $__14[0], notSetValue = $__14[1], $__14);
    }
    return updateInDeepMap(this, keyPath, notSetValue, updater, 0);
  },
  clear: function() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = 0;
      this._root = null;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return $Map.empty();
  },
  merge: function() {
    return mergeIntoMapWith(this, null, arguments);
  },
  mergeWith: function(merger) {
    for (var seqs = [],
        $__4 = 1; $__4 < arguments.length; $__4++)
      seqs[$__4 - 1] = arguments[$__4];
    return mergeIntoMapWith(this, merger, seqs);
  },
  mergeDeep: function() {
    return mergeIntoMapWith(this, deepMerger(null), arguments);
  },
  mergeDeepWith: function(merger) {
    for (var seqs = [],
        $__5 = 1; $__5 < arguments.length; $__5++)
      seqs[$__5 - 1] = arguments[$__5];
    return mergeIntoMapWith(this, deepMerger(merger), seqs);
  },
  cursor: function(keyPath, onChange) {
    if (!onChange && typeof keyPath === 'function') {
      onChange = keyPath;
      keyPath = [];
    } else if (arguments.length === 0) {
      keyPath = [];
    } else if (!Array.isArray(keyPath)) {
      keyPath = [keyPath];
    }
    return new Cursor(this, keyPath, onChange);
  },
  withMutations: function(fn) {
    var mutable = this.asMutable();
    fn(mutable);
    return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
  },
  asMutable: function() {
    return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
  },
  asImmutable: function() {
    return this.__ensureOwner();
  },
  wasAltered: function() {
    return this.__altered;
  },
  __iterator: function(type, reverse) {
    return new MapIterator(this, type, reverse);
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    var iterations = 0;
    this._root && this._root.iterate((function(entry) {
      iterations++;
      return fn(entry[1], entry[0], $__0);
    }), reverse);
    return iterations;
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeMap(this.length, this._root, ownerID, this.__hash);
  }
}, {empty: function() {
    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
  }}, Sequence);
var MapPrototype = Map.prototype;
MapPrototype[DELETE] = MapPrototype.remove;
Map.from = Map;
var BitmapIndexedNode = function BitmapIndexedNode(ownerID, bitmap, nodes) {
  this.ownerID = ownerID;
  this.bitmap = bitmap;
  this.nodes = nodes;
};
var $BitmapIndexedNode = BitmapIndexedNode;
($traceurRuntime.createClass)(BitmapIndexedNode, {
  get: function(shift, hash, key, notSetValue) {
    var bit = (1 << ((shift === 0 ? hash : hash >>> shift) & MASK));
    var bitmap = this.bitmap;
    return (bitmap & bit) === 0 ? notSetValue : this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, hash, key, notSetValue);
  },
  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
    var hashFrag = (shift === 0 ? hash : hash >>> shift) & MASK;
    var bit = 1 << hashFrag;
    var bitmap = this.bitmap;
    var exists = (bitmap & bit) !== 0;
    if (!exists && value === NOT_SET) {
      return this;
    }
    var idx = popCount(bitmap & (bit - 1));
    var nodes = this.nodes;
    var node = exists ? nodes[idx] : null;
    var newNode = updateNode(node, ownerID, shift + SHIFT, hash, key, value, didChangeLength, didAlter);
    if (newNode === node) {
      return this;
    }
    if (!exists && newNode && nodes.length >= MAX_BITMAP_SIZE) {
      return expandNodes(ownerID, nodes, bitmap, hashFrag, newNode);
    }
    if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
      return nodes[idx ^ 1];
    }
    if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
      return newNode;
    }
    var isEditable = ownerID && ownerID === this.ownerID;
    var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
    var newNodes = exists ? newNode ? setIn(nodes, idx, newNode, isEditable) : spliceOut(nodes, idx, isEditable) : spliceIn(nodes, idx, newNode, isEditable);
    if (isEditable) {
      this.bitmap = newBitmap;
      this.nodes = newNodes;
      return this;
    }
    return new $BitmapIndexedNode(ownerID, newBitmap, newNodes);
  },
  iterate: function(fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0,
        maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      if (nodes[reverse ? maxIndex - ii : ii].iterate(fn, reverse) === false) {
        return false;
      }
    }
  }
}, {});
var ArrayNode = function ArrayNode(ownerID, count, nodes) {
  this.ownerID = ownerID;
  this.count = count;
  this.nodes = nodes;
};
var $ArrayNode = ArrayNode;
($traceurRuntime.createClass)(ArrayNode, {
  get: function(shift, hash, key, notSetValue) {
    var idx = (shift === 0 ? hash : hash >>> shift) & MASK;
    var node = this.nodes[idx];
    return node ? node.get(shift + SHIFT, hash, key, notSetValue) : notSetValue;
  },
  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
    var idx = (shift === 0 ? hash : hash >>> shift) & MASK;
    var removed = value === NOT_SET;
    var nodes = this.nodes;
    var node = nodes[idx];
    if (removed && !node) {
      return this;
    }
    var newNode = updateNode(node, ownerID, shift + SHIFT, hash, key, value, didChangeLength, didAlter);
    if (newNode === node) {
      return this;
    }
    var newCount = this.count;
    if (!node) {
      newCount++;
    } else if (!newNode) {
      newCount--;
      if (newCount < MIN_ARRAY_SIZE) {
        return packNodes(ownerID, nodes, newCount, idx);
      }
    }
    var isEditable = ownerID && ownerID === this.ownerID;
    var newNodes = setIn(nodes, idx, newNode, isEditable);
    if (isEditable) {
      this.count = newCount;
      this.nodes = newNodes;
      return this;
    }
    return new $ArrayNode(ownerID, newCount, newNodes);
  },
  iterate: function(fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0,
        maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  }
}, {});
var HashCollisionNode = function HashCollisionNode(ownerID, hash, entries) {
  this.ownerID = ownerID;
  this.hash = hash;
  this.entries = entries;
};
var $HashCollisionNode = HashCollisionNode;
($traceurRuntime.createClass)(HashCollisionNode, {
  get: function(shift, hash, key, notSetValue) {
    var entries = this.entries;
    for (var ii = 0,
        len = entries.length; ii < len; ii++) {
      if (is(key, entries[ii][0])) {
        return entries[ii][1];
      }
    }
    return notSetValue;
  },
  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
    var removed = value === NOT_SET;
    if (hash !== this.hash) {
      if (removed) {
        return this;
      }
      SetRef(didAlter);
      SetRef(didChangeLength);
      return mergeIntoNode(this, ownerID, shift, hash, [key, value]);
    }
    var entries = this.entries;
    var idx = 0;
    for (var len = entries.length; idx < len; idx++) {
      if (is(key, entries[idx][0])) {
        break;
      }
    }
    var exists = idx < len;
    if (removed && !exists) {
      return this;
    }
    SetRef(didAlter);
    (removed || !exists) && SetRef(didChangeLength);
    if (removed && len === 2) {
      return new ValueNode(ownerID, this.hash, entries[idx ^ 1]);
    }
    var isEditable = ownerID && ownerID === this.ownerID;
    var newEntries = isEditable ? entries : arrCopy(entries);
    if (exists) {
      if (removed) {
        idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
      } else {
        newEntries[idx] = [key, value];
      }
    } else {
      newEntries.push([key, value]);
    }
    if (isEditable) {
      this.entries = newEntries;
      return this;
    }
    return new $HashCollisionNode(ownerID, this.hash, newEntries);
  },
  iterate: function(fn, reverse) {
    var entries = this.entries;
    for (var ii = 0,
        maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  }
}, {});
var ValueNode = function ValueNode(ownerID, hash, entry) {
  this.ownerID = ownerID;
  this.hash = hash;
  this.entry = entry;
};
var $ValueNode = ValueNode;
($traceurRuntime.createClass)(ValueNode, {
  get: function(shift, hash, key, notSetValue) {
    return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
  },
  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
    var removed = value === NOT_SET;
    var keyMatch = is(key, this.entry[0]);
    if (keyMatch ? value === this.entry[1] : removed) {
      return this;
    }
    SetRef(didAlter);
    if (removed) {
      SetRef(didChangeLength);
      return null;
    }
    if (keyMatch) {
      if (ownerID && ownerID === this.ownerID) {
        this.entry[1] = value;
        return this;
      }
      return new $ValueNode(ownerID, hash, [key, value]);
    }
    SetRef(didChangeLength);
    return mergeIntoNode(this, ownerID, shift, hash, [key, value]);
  },
  iterate: function(fn) {
    return fn(this.entry);
  }
}, {});
var MapIterator = function MapIterator(map, type, reverse) {
  this._type = type;
  this._reverse = reverse;
  this._stack = map._root && mapIteratorFrame(map._root);
};
($traceurRuntime.createClass)(MapIterator, {next: function() {
    var type = this._type;
    var stack = this._stack;
    while (stack) {
      var node = stack.node;
      var index = stack.index++;
      var maxIndex;
      if (node.entry) {
        if (index === 0) {
          return mapIteratorValue(type, node.entry);
        }
      } else if (node.entries) {
        maxIndex = node.entries.length - 1;
        if (index <= maxIndex) {
          return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
        }
      } else {
        maxIndex = node.nodes.length - 1;
        if (index <= maxIndex) {
          var subNode = node.nodes[this._reverse ? maxIndex - index : index];
          if (subNode) {
            if (subNode.entry) {
              return mapIteratorValue(type, subNode.entry);
            }
            stack = this._stack = mapIteratorFrame(subNode, stack);
          }
          continue;
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  }}, {}, Iterator);
function mapIteratorValue(type, entry) {
  return iteratorValue(type, entry[0], entry[1]);
}
function mapIteratorFrame(node, prev) {
  return {
    node: node,
    index: 0,
    __prev: prev
  };
}
function makeMap(length, root, ownerID, hash) {
  var map = Object.create(MapPrototype);
  map.length = length;
  map._root = root;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}
function updateMap(map, k, v) {
  var didChangeLength = MakeRef(CHANGE_LENGTH);
  var didAlter = MakeRef(DID_ALTER);
  var newRoot = updateNode(map._root, map.__ownerID, 0, hash(k), k, v, didChangeLength, didAlter);
  if (!didAlter.value) {
    return map;
  }
  var newLength = map.length + (didChangeLength.value ? v === NOT_SET ? -1 : 1 : 0);
  if (map.__ownerID) {
    map.length = newLength;
    map._root = newRoot;
    map.__hash = undefined;
    map.__altered = true;
    return map;
  }
  return newRoot ? makeMap(newLength, newRoot) : Map.empty();
}
function updateNode(node, ownerID, shift, hash, key, value, didChangeLength, didAlter) {
  if (!node) {
    if (value === NOT_SET) {
      return node;
    }
    SetRef(didAlter);
    SetRef(didChangeLength);
    return new ValueNode(ownerID, hash, [key, value]);
  }
  return node.update(ownerID, shift, hash, key, value, didChangeLength, didAlter);
}
function isLeafNode(node) {
  return node.constructor === ValueNode || node.constructor === HashCollisionNode;
}
function mergeIntoNode(node, ownerID, shift, hash, entry) {
  if (node.hash === hash) {
    return new HashCollisionNode(ownerID, hash, [node.entry, entry]);
  }
  var idx1 = (shift === 0 ? node.hash : node.hash >>> shift) & MASK;
  var idx2 = (shift === 0 ? hash : hash >>> shift) & MASK;
  var newNode;
  var nodes = idx1 === idx2 ? [mergeIntoNode(node, ownerID, shift + SHIFT, hash, entry)] : ((newNode = new ValueNode(ownerID, hash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);
  return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
}
function packNodes(ownerID, nodes, count, excluding) {
  var bitmap = 0;
  var packedII = 0;
  var packedNodes = new Array(count);
  for (var ii = 0,
      bit = 1,
      len = nodes.length; ii < len; ii++, bit <<= 1) {
    var node = nodes[ii];
    if (node != null && ii !== excluding) {
      bitmap |= bit;
      packedNodes[packedII++] = node;
    }
  }
  return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
}
function expandNodes(ownerID, nodes, bitmap, including, node) {
  var count = 0;
  var expandedNodes = new Array(SIZE);
  for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
    expandedNodes[ii] = bitmap & 1 ? nodes[count++] : null;
  }
  expandedNodes[including] = node;
  return new ArrayNode(ownerID, count + 1, expandedNodes);
}
function mergeIntoMapWith(map, merger, iterables) {
  var seqs = [];
  for (var ii = 0; ii < iterables.length; ii++) {
    var seq = iterables[ii];
    if (!(seq instanceof Sequence)) {
      seq = Sequence(seq);
      if (seq instanceof IndexedSequence) {
        seq = seq.fromEntrySeq();
      }
    }
    seq && seqs.push(seq);
  }
  return mergeIntoCollectionWith(map, merger, seqs);
}
function deepMerger(merger) {
  return (function(existing, value) {
    return existing && existing.mergeDeepWith ? existing.mergeDeepWith(merger, value) : merger ? merger(existing, value) : value;
  });
}
function mergeIntoCollectionWith(collection, merger, seqs) {
  if (seqs.length === 0) {
    return collection;
  }
  return collection.withMutations((function(collection) {
    var mergeIntoMap = merger ? (function(value, key) {
      var existing = collection.get(key, NOT_SET);
      collection.set(key, existing === NOT_SET ? value : merger(existing, value));
    }) : (function(value, key) {
      collection.set(key, value);
    });
    for (var ii = 0; ii < seqs.length; ii++) {
      seqs[ii].forEach(mergeIntoMap);
    }
  }));
}
function updateInDeepMap(collection, keyPath, notSetValue, updater, pathOffset) {
  var pathLen = keyPath.length;
  if (pathOffset === pathLen) {
    return updater(collection);
  }
  invariant(collection.set, 'updateIn with invalid keyPath');
  var notSet = pathOffset === pathLen - 1 ? notSetValue : Map.empty();
  var key = keyPath[pathOffset];
  var existing = collection.get(key, notSet);
  var value = updateInDeepMap(existing, keyPath, notSetValue, updater, pathOffset + 1);
  return value === existing ? collection : collection.set(key, value);
}
function popCount(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x = x + (x >> 8);
  x = x + (x >> 16);
  return x & 0x7f;
}
function setIn(array, idx, val, canEdit) {
  var newArray = canEdit ? array : arrCopy(array);
  newArray[idx] = val;
  return newArray;
}
function spliceIn(array, idx, val, canEdit) {
  var newLen = array.length + 1;
  if (canEdit && idx + 1 === newLen) {
    array[idx] = val;
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      newArray[ii] = val;
      after = -1;
    } else {
      newArray[ii] = array[ii + after];
    }
  }
  return newArray;
}
function spliceOut(array, idx, canEdit) {
  var newLen = array.length - 1;
  if (canEdit && idx === newLen) {
    array.pop();
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      after = 1;
    }
    newArray[ii] = array[ii + after];
  }
  return newArray;
}
var MAX_BITMAP_SIZE = SIZE / 2;
var MIN_ARRAY_SIZE = SIZE / 4;
var EMPTY_MAP;
var Vector = function Vector() {
  for (var values = [],
      $__6 = 0; $__6 < arguments.length; $__6++)
    values[$__6] = arguments[$__6];
  return $Vector.from(values);
};
var $Vector = Vector;
($traceurRuntime.createClass)(Vector, {
  toString: function() {
    return this.__toString('Vector [', ']');
  },
  get: function(index, notSetValue) {
    index = wrapIndex(this, index);
    if (index < 0 || index >= this.length) {
      return notSetValue;
    }
    index += this._origin;
    var node = vectorNodeFor(this, index);
    return node && node.array[index & MASK];
  },
  set: function(index, value) {
    return updateVector(this, index, value);
  },
  remove: function(index) {
    return updateVector(this, index, NOT_SET);
  },
  clear: function() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = this._origin = this._size = 0;
      this._level = SHIFT;
      this._root = this._tail = null;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return $Vector.empty();
  },
  push: function() {
    var values = arguments;
    var oldLength = this.length;
    return this.withMutations((function(vect) {
      setVectorBounds(vect, 0, oldLength + values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(oldLength + ii, values[ii]);
      }
    }));
  },
  pop: function() {
    return setVectorBounds(this, 0, -1);
  },
  unshift: function() {
    var values = arguments;
    return this.withMutations((function(vect) {
      setVectorBounds(vect, -values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(ii, values[ii]);
      }
    }));
  },
  shift: function() {
    return setVectorBounds(this, 1);
  },
  merge: function() {
    return mergeIntoVectorWith(this, null, arguments);
  },
  mergeWith: function(merger) {
    for (var seqs = [],
        $__7 = 1; $__7 < arguments.length; $__7++)
      seqs[$__7 - 1] = arguments[$__7];
    return mergeIntoVectorWith(this, merger, seqs);
  },
  mergeDeep: function() {
    return mergeIntoVectorWith(this, deepMerger(null), arguments);
  },
  mergeDeepWith: function(merger) {
    for (var seqs = [],
        $__8 = 1; $__8 < arguments.length; $__8++)
      seqs[$__8 - 1] = arguments[$__8];
    return mergeIntoVectorWith(this, deepMerger(merger), seqs);
  },
  setLength: function(length) {
    return setVectorBounds(this, 0, length);
  },
  slice: function(begin, end) {
    var sliceSequence = $traceurRuntime.superCall(this, $Vector.prototype, "slice", [begin, end]);
    if (sliceSequence !== this) {
      var vector = this;
      var length = vector.length;
      sliceSequence.toVector = (function() {
        return setVectorBounds(vector, begin < 0 ? Math.max(0, length + begin) : length ? Math.min(length, begin) : begin, end == null ? length : end < 0 ? Math.max(0, length + end) : length ? Math.min(length, end) : end);
      });
    }
    return sliceSequence;
  },
  __iterator: function(type, reverse) {
    return new VectorIterator(this, type, reverse);
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    var iterations = 0;
    var eachFn = (function(v) {
      return fn(v, iterations++, $__0);
    });
    var tailOffset = getTailOffset(this._size);
    if (reverse) {
      iterateVNode(this._tail, 0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse) && iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse);
    } else {
      iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse) && iterateVNode(this._tail, 0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse);
    }
    return iterations;
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      return this;
    }
    return makeVector(this._origin, this._size, this._level, this._root, this._tail, ownerID, this.__hash);
  }
}, {
  empty: function() {
    return EMPTY_VECT || (EMPTY_VECT = makeVector(0, 0, SHIFT));
  },
  from: function(sequence) {
    if (!sequence || sequence.length === 0) {
      return $Vector.empty();
    }
    if (sequence.constructor === $Vector) {
      return sequence;
    }
    var isArray = Array.isArray(sequence);
    if (sequence.length > 0 && sequence.length < SIZE) {
      return makeVector(0, sequence.length, SHIFT, null, new VNode(isArray ? arrCopy(sequence) : Sequence(sequence).toArray()));
    }
    if (!isArray) {
      sequence = Sequence(sequence).valueSeq();
    }
    return $Vector.empty().merge(sequence);
  }
}, IndexedSequence);
var VectorPrototype = Vector.prototype;
VectorPrototype[DELETE] = VectorPrototype.remove;
VectorPrototype.update = MapPrototype.update;
VectorPrototype.updateIn = MapPrototype.updateIn;
VectorPrototype.cursor = MapPrototype.cursor;
VectorPrototype.withMutations = MapPrototype.withMutations;
VectorPrototype.asMutable = MapPrototype.asMutable;
VectorPrototype.asImmutable = MapPrototype.asImmutable;
VectorPrototype.wasAltered = MapPrototype.wasAltered;
var VNode = function VNode(array, ownerID) {
  this.array = array;
  this.ownerID = ownerID;
};
var $VNode = VNode;
($traceurRuntime.createClass)(VNode, {
  removeBefore: function(ownerID, level, index) {
    if (index === level ? 1 << level : 0 || this.array.length === 0) {
      return this;
    }
    var originIndex = (index >>> level) & MASK;
    if (originIndex >= this.array.length) {
      return new $VNode([], ownerID);
    }
    var removingFirst = originIndex === 0;
    var newChild;
    if (level > 0) {
      var oldChild = this.array[originIndex];
      newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
      if (newChild === oldChild && removingFirst) {
        return this;
      }
    }
    if (removingFirst && !newChild) {
      return this;
    }
    var editable = editableVNode(this, ownerID);
    if (!removingFirst) {
      for (var ii = 0; ii < originIndex; ii++) {
        editable.array[ii] = undefined;
      }
    }
    if (newChild) {
      editable.array[originIndex] = newChild;
    }
    return editable;
  },
  removeAfter: function(ownerID, level, index) {
    if (index === level ? 1 << level : 0 || this.array.length === 0) {
      return this;
    }
    var sizeIndex = ((index - 1) >>> level) & MASK;
    if (sizeIndex >= this.array.length) {
      return this;
    }
    var removingLast = sizeIndex === this.array.length - 1;
    var newChild;
    if (level > 0) {
      var oldChild = this.array[sizeIndex];
      newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
      if (newChild === oldChild && removingLast) {
        return this;
      }
    }
    if (removingLast && !newChild) {
      return this;
    }
    var editable = editableVNode(this, ownerID);
    if (!removingLast) {
      editable.array.pop();
    }
    if (newChild) {
      editable.array[sizeIndex] = newChild;
    }
    return editable;
  }
}, {});
function iterateVNode(node, level, offset, max, fn, reverse) {
  var ii;
  var array = node && node.array;
  if (level === 0) {
    var from = offset < 0 ? -offset : 0;
    var to = max - offset;
    if (to > SIZE) {
      to = SIZE;
    }
    for (ii = from; ii < to; ii++) {
      if (fn(array && array[reverse ? from + to - 1 - ii : ii]) === false) {
        return false;
      }
    }
  } else {
    var step = 1 << level;
    var newLevel = level - SHIFT;
    for (ii = 0; ii <= MASK; ii++) {
      var levelIndex = reverse ? MASK - ii : ii;
      var newOffset = offset + (levelIndex << level);
      if (newOffset < max && newOffset + step > 0) {
        var nextNode = array && array[levelIndex];
        if (!iterateVNode(nextNode, newLevel, newOffset, max, fn, reverse)) {
          return false;
        }
      }
    }
  }
  return true;
}
var VectorIterator = function VectorIterator(vector, type, reverse) {
  this._type = type;
  this._reverse = !!reverse;
  this._maxIndex = vector.length - 1;
  var tailOffset = getTailOffset(vector._size);
  var rootStack = vectIteratorFrame(vector._root && vector._root.array, vector._level, -vector._origin, tailOffset - vector._origin - 1);
  var tailStack = vectIteratorFrame(vector._tail && vector._tail.array, 0, tailOffset - vector._origin, vector._size - vector._origin - 1);
  this._stack = reverse ? tailStack : rootStack;
  this._stack.__prev = reverse ? rootStack : tailStack;
};
($traceurRuntime.createClass)(VectorIterator, {next: function() {
    var stack = this._stack;
    while (stack) {
      var array = stack.array;
      var rawIndex = stack.index++;
      if (this._reverse) {
        rawIndex = MASK - rawIndex;
        if (rawIndex > stack.rawMax) {
          rawIndex = stack.rawMax;
          stack.index = SIZE - rawIndex;
        }
      }
      if (rawIndex >= 0 && rawIndex < SIZE && rawIndex <= stack.rawMax) {
        var value = array && array[rawIndex];
        if (stack.level === 0) {
          var type = this._type;
          var index;
          if (type !== 1) {
            index = stack.offset + (rawIndex << stack.level);
            if (this._reverse) {
              index = this._maxIndex - index;
            }
          }
          return iteratorValue(type, index, value);
        } else {
          this._stack = stack = vectIteratorFrame(value && value.array, stack.level - SHIFT, stack.offset + (rawIndex << stack.level), stack.max, stack);
        }
        continue;
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  }}, {}, Iterator);
function vectIteratorFrame(array, level, offset, max, prevFrame) {
  return {
    array: array,
    level: level,
    offset: offset,
    max: max,
    rawMax: ((max - offset) >> level),
    index: 0,
    __prev: prevFrame
  };
}
function makeVector(origin, size, level, root, tail, ownerID, hash) {
  var vect = Object.create(VectorPrototype);
  vect.length = size - origin;
  vect._origin = origin;
  vect._size = size;
  vect._level = level;
  vect._root = root;
  vect._tail = tail;
  vect.__ownerID = ownerID;
  vect.__hash = hash;
  vect.__altered = false;
  return vect;
}
function updateVector(vector, index, value) {
  index = wrapIndex(vector, index);
  if (index >= vector.length || index < 0) {
    return value === NOT_SET ? vector : vector.withMutations((function(vect) {
      index < 0 ? setVectorBounds(vect, index).set(0, value) : setVectorBounds(vect, 0, index + 1).set(index, value);
    }));
  }
  index += vector._origin;
  var newTail = vector._tail;
  var newRoot = vector._root;
  var didAlter = MakeRef(DID_ALTER);
  if (index >= getTailOffset(vector._size)) {
    newTail = updateVNode(newTail, vector.__ownerID, 0, index, value, didAlter);
  } else {
    newRoot = updateVNode(newRoot, vector.__ownerID, vector._level, index, value, didAlter);
  }
  if (!didAlter.value) {
    return vector;
  }
  if (vector.__ownerID) {
    vector._root = newRoot;
    vector._tail = newTail;
    vector.__hash = undefined;
    vector.__altered = true;
    return vector;
  }
  return makeVector(vector._origin, vector._size, vector._level, newRoot, newTail);
}
function updateVNode(node, ownerID, level, index, value, didAlter) {
  var removed = value === NOT_SET;
  var newNode;
  var idx = (index >>> level) & MASK;
  var nodeHas = node && idx < node.array.length;
  if (removed && !nodeHas) {
    return node;
  }
  if (level > 0) {
    var lowerNode = node && node.array[idx];
    var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
    if (newLowerNode === lowerNode) {
      return node;
    }
    newNode = editableVNode(node, ownerID);
    newNode.array[idx] = newLowerNode;
    return newNode;
  }
  if (!removed && nodeHas && node.array[idx] === value) {
    return node;
  }
  SetRef(didAlter);
  newNode = editableVNode(node, ownerID);
  if (removed && idx === newNode.array.length - 1) {
    newNode.array.pop();
  } else {
    newNode.array[idx] = removed ? undefined : value;
  }
  return newNode;
}
function editableVNode(node, ownerID) {
  if (ownerID && node && ownerID === node.ownerID) {
    return node;
  }
  return new VNode(node ? node.array.slice() : [], ownerID);
}
function vectorNodeFor(vector, rawIndex) {
  if (rawIndex >= getTailOffset(vector._size)) {
    return vector._tail;
  }
  if (rawIndex < 1 << (vector._level + SHIFT)) {
    var node = vector._root;
    var level = vector._level;
    while (node && level > 0) {
      node = node.array[(rawIndex >>> level) & MASK];
      level -= SHIFT;
    }
    return node;
  }
}
function setVectorBounds(vector, begin, end) {
  var owner = vector.__ownerID || new OwnerID();
  var oldOrigin = vector._origin;
  var oldSize = vector._size;
  var newOrigin = oldOrigin + begin;
  var newSize = end == null ? oldSize : end < 0 ? oldSize + end : oldOrigin + end;
  if (newOrigin === oldOrigin && newSize === oldSize) {
    return vector;
  }
  if (newOrigin >= newSize) {
    return vector.clear();
  }
  var newLevel = vector._level;
  var newRoot = vector._root;
  var offsetShift = 0;
  while (newOrigin + offsetShift < 0) {
    newRoot = new VNode(newRoot && newRoot.array.length ? [null, newRoot] : [], owner);
    newLevel += SHIFT;
    offsetShift += 1 << newLevel;
  }
  if (offsetShift) {
    newOrigin += offsetShift;
    oldOrigin += offsetShift;
    newSize += offsetShift;
    oldSize += offsetShift;
  }
  var oldTailOffset = getTailOffset(oldSize);
  var newTailOffset = getTailOffset(newSize);
  while (newTailOffset >= 1 << (newLevel + SHIFT)) {
    newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
    newLevel += SHIFT;
  }
  var oldTail = vector._tail;
  var newTail = newTailOffset < oldTailOffset ? vectorNodeFor(vector, newSize - 1) : newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;
  if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldSize && oldTail.array.length) {
    newRoot = editableVNode(newRoot, owner);
    var node = newRoot;
    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
      var idx = (oldTailOffset >>> level) & MASK;
      node = node.array[idx] = editableVNode(node.array[idx], owner);
    }
    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
  }
  if (newSize < oldSize) {
    newTail = newTail && newTail.removeAfter(owner, 0, newSize);
  }
  if (newOrigin >= newTailOffset) {
    newOrigin -= newTailOffset;
    newSize -= newTailOffset;
    newLevel = SHIFT;
    newRoot = null;
    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);
  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
    var beginIndex,
        endIndex;
    offsetShift = 0;
    do {
      beginIndex = ((newOrigin) >>> newLevel) & MASK;
      endIndex = ((newTailOffset - 1) >>> newLevel) & MASK;
      if (beginIndex === endIndex) {
        if (beginIndex) {
          offsetShift += (1 << newLevel) * beginIndex;
        }
        newLevel -= SHIFT;
        newRoot = newRoot && newRoot.array[beginIndex];
      }
    } while (newRoot && beginIndex === endIndex);
    if (newRoot && newOrigin > oldOrigin) {
      newRoot = newRoot && newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
    }
    if (newRoot && newTailOffset < oldTailOffset) {
      newRoot = newRoot && newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
    }
    if (offsetShift) {
      newOrigin -= offsetShift;
      newSize -= offsetShift;
    }
  }
  if (vector.__ownerID) {
    vector.length = newSize - newOrigin;
    vector._origin = newOrigin;
    vector._size = newSize;
    vector._level = newLevel;
    vector._root = newRoot;
    vector._tail = newTail;
    vector.__hash = undefined;
    vector.__altered = true;
    return vector;
  }
  return makeVector(newOrigin, newSize, newLevel, newRoot, newTail);
}
function mergeIntoVectorWith(vector, merger, iterables) {
  var seqs = [];
  for (var ii = 0; ii < iterables.length; ii++) {
    var seq = iterables[ii];
    seq && seqs.push(Sequence(seq));
  }
  var maxLength = Math.max.apply(null, seqs.map((function(s) {
    return s.length || 0;
  })));
  if (maxLength > vector.length) {
    vector = vector.setLength(maxLength);
  }
  return mergeIntoCollectionWith(vector, merger, seqs);
}
function getTailOffset(size) {
  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
}
var EMPTY_VECT;
var Stack = function Stack() {
  for (var values = [],
      $__9 = 0; $__9 < arguments.length; $__9++)
    values[$__9] = arguments[$__9];
  return $Stack.from(values);
};
var $Stack = Stack;
($traceurRuntime.createClass)(Stack, {
  toString: function() {
    return this.__toString('Stack [', ']');
  },
  get: function(index, notSetValue) {
    var head = this._head;
    while (head && index--) {
      head = head.next;
    }
    return head ? head.value : notSetValue;
  },
  peek: function() {
    return this._head && this._head.value;
  },
  unshift: function() {
    if (arguments.length === 0) {
      return this;
    }
    var newLength = this.length + arguments.length;
    var head = this._head;
    for (var ii = arguments.length - 1; ii >= 0; ii--) {
      head = {
        value: arguments[ii],
        next: head
      };
    }
    if (this.__ownerID) {
      this.length = newLength;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newLength, head);
  },
  unshiftAll: function(seq) {
    seq = Sequence(seq);
    if (seq.length === 0) {
      return this;
    }
    var newLength = this.length;
    var head = this._head;
    seq.reverse().forEach((function(value) {
      newLength++;
      head = {
        value: value,
        next: head
      };
    }));
    if (this.__ownerID) {
      this.length = newLength;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newLength, head);
  },
  shift: function() {
    return this.slice(1);
  },
  clear: function() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = 0;
      this._head = undefined;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return $Stack.empty();
  },
  slice: function(begin, end) {
    if (wholeSlice(begin, end, this.length)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.length);
    var resolvedEnd = resolveEnd(end, this.length);
    if (resolvedEnd !== this.length) {
      return $traceurRuntime.superCall(this, $Stack.prototype, "slice", [begin, end]);
    }
    var newLength = this.length - resolvedBegin;
    var head = this._head;
    while (resolvedBegin--) {
      head = head.next;
    }
    if (this.__ownerID) {
      this.length = newLength;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newLength, head);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeStack(this.length, this._head, ownerID, this.__hash);
  },
  __iterateUncached: function(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    var node = this._head;
    while (node) {
      if (fn(node.value, iterations++, this) === false) {
        break;
      }
      node = node.next;
    }
    return iterations;
  },
  __iteratorUncached: function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterations = 0;
    var node = this._head;
    return new Iterator((function() {
      if (node) {
        var value = node.value;
        node = node.next;
        return iteratorValue(type, iterations++, value);
      }
      return iteratorDone();
    }));
  }
}, {
  empty: function() {
    return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
  },
  from: function(sequence) {
    var stack = $Stack.empty();
    return sequence ? sequence.constructor === $Stack ? sequence : stack.unshiftAll(sequence) : stack;
  }
}, IndexedSequence);
var StackPrototype = Stack.prototype;
StackPrototype.push = StackPrototype.unshift;
StackPrototype.pop = StackPrototype.shift;
StackPrototype.withMutations = MapPrototype.withMutations;
StackPrototype.asMutable = MapPrototype.asMutable;
StackPrototype.asImmutable = MapPrototype.asImmutable;
StackPrototype.wasAltered = MapPrototype.wasAltered;
function makeStack(length, head, ownerID, hash) {
  var map = Object.create(StackPrototype);
  map.length = length;
  map._head = head;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}
var EMPTY_STACK;
var Set = function Set() {
  for (var values = [],
      $__10 = 0; $__10 < arguments.length; $__10++)
    values[$__10] = arguments[$__10];
  return $Set.from(values);
};
var $Set = Set;
($traceurRuntime.createClass)(Set, {
  toString: function() {
    return this.__toString('Set {', '}');
  },
  has: function(value) {
    return this._map.has(value);
  },
  get: function(value, notSetValue) {
    return this.has(value) ? value : notSetValue;
  },
  add: function(value) {
    var newMap = this._map.set(value, null);
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : makeSet(newMap);
  },
  remove: function(value) {
    var newMap = this._map.remove(value);
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : newMap.length === 0 ? $Set.empty() : makeSet(newMap);
  },
  clear: function() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = 0;
      this._map.clear();
      return this;
    }
    return $Set.empty();
  },
  union: function() {
    var seqs = arguments;
    if (seqs.length === 0) {
      return this;
    }
    return this.withMutations((function(set) {
      for (var ii = 0; ii < seqs.length; ii++) {
        Sequence(seqs[ii]).forEach((function(value) {
          return set.add(value);
        }));
      }
    }));
  },
  intersect: function() {
    for (var seqs = [],
        $__11 = 0; $__11 < arguments.length; $__11++)
      seqs[$__11] = arguments[$__11];
    if (seqs.length === 0) {
      return this;
    }
    seqs = seqs.map((function(seq) {
      return Sequence(seq);
    }));
    var originalSet = this;
    return this.withMutations((function(set) {
      originalSet.forEach((function(value) {
        if (!seqs.every((function(seq) {
          return seq.contains(value);
        }))) {
          set.remove(value);
        }
      }));
    }));
  },
  subtract: function() {
    for (var seqs = [],
        $__12 = 0; $__12 < arguments.length; $__12++)
      seqs[$__12] = arguments[$__12];
    if (seqs.length === 0) {
      return this;
    }
    seqs = seqs.map((function(seq) {
      return Sequence(seq);
    }));
    var originalSet = this;
    return this.withMutations((function(set) {
      originalSet.forEach((function(value) {
        if (seqs.some((function(seq) {
          return seq.contains(value);
        }))) {
          set.remove(value);
        }
      }));
    }));
  },
  isSubset: function(seq) {
    seq = Sequence(seq);
    return this.every((function(value) {
      return seq.contains(value);
    }));
  },
  isSuperset: function(seq) {
    var set = this;
    seq = Sequence(seq);
    return seq.every((function(value) {
      return set.contains(value);
    }));
  },
  wasAltered: function() {
    return this._map.wasAltered();
  },
  hashCode: function() {
    return this._map.hashCode();
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    return this._map.__iterate((function(_, k) {
      return fn(k, k, $__0);
    }), reverse);
  },
  __iterator: function(type, reverse) {
    return this._map.map((function(_, k) {
      return k;
    })).__iterator(type, reverse);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return makeSet(newMap, ownerID);
  }
}, {
  empty: function() {
    return EMPTY_SET || (EMPTY_SET = makeSet(Map.empty()));
  },
  from: function(sequence) {
    var set = $Set.empty();
    return sequence ? sequence.constructor === $Set ? sequence : set.union(sequence) : set;
  },
  fromKeys: function(sequence) {
    return $Set.from(Sequence(sequence).flip());
  }
}, Sequence);
var SetPrototype = Set.prototype;
SetPrototype[DELETE] = SetPrototype.remove;
SetPrototype[ITERATOR_SYMBOL] = SetPrototype.values;
SetPrototype.contains = SetPrototype.has;
SetPrototype.mergeDeep = SetPrototype.merge = SetPrototype.union;
SetPrototype.mergeDeepWith = SetPrototype.mergeWith = function(merger) {
  for (var seqs = [],
      $__13 = 1; $__13 < arguments.length; $__13++)
    seqs[$__13 - 1] = arguments[$__13];
  return this.merge.apply(this, seqs);
};
SetPrototype.withMutations = MapPrototype.withMutations;
SetPrototype.asMutable = MapPrototype.asMutable;
SetPrototype.asImmutable = MapPrototype.asImmutable;
SetPrototype.__toJS = IndexedSequencePrototype.__toJS;
SetPrototype.__toStringMapper = IndexedSequencePrototype.__toStringMapper;
function makeSet(map, ownerID) {
  var set = Object.create(SetPrototype);
  set.length = map ? map.length : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}
var EMPTY_SET;
var OrderedMap = function OrderedMap(sequence) {
  var map = $OrderedMap.empty();
  return sequence ? sequence.constructor === $OrderedMap ? sequence : map.merge(sequence) : map;
};
var $OrderedMap = OrderedMap;
($traceurRuntime.createClass)(OrderedMap, {
  toString: function() {
    return this.__toString('OrderedMap {', '}');
  },
  get: function(k, notSetValue) {
    var index = this._map.get(k);
    return index != null ? this._vector.get(index)[1] : notSetValue;
  },
  clear: function() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = 0;
      this._map.clear();
      this._vector.clear();
      return this;
    }
    return $OrderedMap.empty();
  },
  set: function(k, v) {
    return updateOrderedMap(this, k, v);
  },
  remove: function(k) {
    return updateOrderedMap(this, k, NOT_SET);
  },
  wasAltered: function() {
    return this._map.wasAltered() || this._vector.wasAltered();
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    return this._vector.__iterate((function(entry) {
      return entry && fn(entry[1], entry[0], $__0);
    }), reverse);
  },
  __iterator: function(type, reverse) {
    return this._vector.fromEntrySeq().__iterator(type, reverse);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    var newVector = this._vector.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return makeOrderedMap(newMap, newVector, ownerID, this.__hash);
  }
}, {empty: function() {
    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(Map.empty(), Vector.empty()));
  }}, Map);
OrderedMap.from = OrderedMap;
OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;
function makeOrderedMap(map, vector, ownerID, hash) {
  var omap = Object.create(OrderedMap.prototype);
  omap.length = map ? map.length : 0;
  omap._map = map;
  omap._vector = vector;
  omap.__ownerID = ownerID;
  omap.__hash = hash;
  return omap;
}
function updateOrderedMap(omap, k, v) {
  var map = omap._map;
  var vector = omap._vector;
  var i = map.get(k);
  var has = i !== undefined;
  var removed = v === NOT_SET;
  if ((!has && removed) || (has && v === vector.get(i)[1])) {
    return omap;
  }
  if (!has) {
    i = vector.length;
  }
  var newMap = removed ? map.remove(k) : has ? map : map.set(k, i);
  var newVector = removed ? vector.remove(i) : vector.set(i, [k, v]);
  if (omap.__ownerID) {
    omap.length = newMap.length;
    omap._map = newMap;
    omap._vector = newVector;
    omap.__hash = undefined;
    return omap;
  }
  return makeOrderedMap(newMap, newVector);
}
var EMPTY_ORDERED_MAP;
var Record = function Record(defaultValues, name) {
  var RecordType = function(values) {
    if (!(this instanceof RecordType)) {
      return new RecordType(values);
    }
    this._map = Map(values);
  };
  var keys = Object.keys(defaultValues);
  var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
  RecordTypePrototype.constructor = RecordType;
  name && (RecordTypePrototype._name = name);
  RecordTypePrototype._defaultValues = defaultValues;
  RecordTypePrototype._keys = keys;
  RecordTypePrototype.length = keys.length;
  try {
    Sequence(defaultValues).forEach((function(_, key) {
      Object.defineProperty(RecordType.prototype, key, {
        get: function() {
          return this.get(key);
        },
        set: function(value) {
          invariant(this.__ownerID, 'Cannot set on an immutable record.');
          this.set(key, value);
        }
      });
    }));
  } catch (error) {}
  return RecordType;
};
var $Record = Record;
($traceurRuntime.createClass)(Record, {
  toString: function() {
    return this.__toString(this._name + ' {', '}');
  },
  has: function(k) {
    return this._defaultValues.hasOwnProperty(k);
  },
  get: function(k, notSetValue) {
    if (notSetValue !== undefined && !this.has(k)) {
      return notSetValue;
    }
    return this._map.get(k, this._defaultValues[k]);
  },
  clear: function() {
    if (this.__ownerID) {
      this._map.clear();
      return this;
    }
    var Record = Object.getPrototypeOf(this).constructor;
    return $Record._empty || ($Record._empty = makeRecord(this, Map.empty()));
  },
  set: function(k, v) {
    if (!this.has(k)) {
      throw new Error('Cannot set unknown key "' + k + '" on ' + this._name);
    }
    var newMap = this._map.set(k, v);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return makeRecord(this, newMap);
  },
  remove: function(k) {
    if (k == null || !this.has(k)) {
      return this;
    }
    var newMap = this._map.remove(k);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return makeRecord(this, newMap);
  },
  keys: function() {
    return this._map.keys();
  },
  values: function() {
    return this._map.values();
  },
  entries: function() {
    return this._map.entries();
  },
  wasAltered: function() {
    return this._map.wasAltered();
  },
  __iterator: function(type, reverse) {
    return this._map.__iterator(type, reverse);
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    return Sequence(this._defaultValues).map((function(_, k) {
      return $__0.get(k);
    })).__iterate(fn, reverse);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map && this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return makeRecord(this, newMap, ownerID);
  }
}, {}, Sequence);
var RecordPrototype = Record.prototype;
RecordPrototype._name = 'Record';
RecordPrototype[DELETE] = RecordPrototype.remove;
RecordPrototype.merge = MapPrototype.merge;
RecordPrototype.mergeWith = MapPrototype.mergeWith;
RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
RecordPrototype.update = MapPrototype.update;
RecordPrototype.updateIn = MapPrototype.updateIn;
RecordPrototype.cursor = MapPrototype.cursor;
RecordPrototype.withMutations = MapPrototype.withMutations;
RecordPrototype.asMutable = MapPrototype.asMutable;
RecordPrototype.asImmutable = MapPrototype.asImmutable;
function makeRecord(likeRecord, map, ownerID) {
  var record = Object.create(Object.getPrototypeOf(likeRecord));
  record._map = map;
  record.__ownerID = ownerID;
  return record;
}
var Range = function Range(start, end, step) {
  if (!(this instanceof $Range)) {
    return new $Range(start, end, step);
  }
  invariant(step !== 0, 'Cannot step a Range by 0');
  start = start || 0;
  if (end == null) {
    end = Infinity;
  }
  if (start === end && __EMPTY_RANGE) {
    return __EMPTY_RANGE;
  }
  step = step == null ? 1 : Math.abs(step);
  if (end < start) {
    step = -step;
  }
  this._start = start;
  this._end = end;
  this._step = step;
  this.length = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
};
var $Range = Range;
($traceurRuntime.createClass)(Range, {
  toString: function() {
    if (this.length === 0) {
      return 'Range []';
    }
    return 'Range [ ' + this._start + '...' + this._end + (this._step > 1 ? ' by ' + this._step : '') + ' ]';
  },
  get: function(index, notSetValue) {
    return this.has(index) ? this._start + wrapIndex(this, index) * this._step : notSetValue;
  },
  contains: function(searchValue) {
    var possibleIndex = (searchValue - this._start) / this._step;
    return possibleIndex >= 0 && possibleIndex < this.length && possibleIndex === Math.floor(possibleIndex);
  },
  slice: function(begin, end) {
    if (wholeSlice(begin, end, this.length)) {
      return this;
    }
    begin = resolveBegin(begin, this.length);
    end = resolveEnd(end, this.length);
    if (end <= begin) {
      return __EMPTY_RANGE;
    }
    return new $Range(this.get(begin, this._end), this.get(end, this._end), this._step);
  },
  indexOf: function(searchValue) {
    var offsetValue = searchValue - this._start;
    if (offsetValue % this._step === 0) {
      var index = offsetValue / this._step;
      if (index >= 0 && index < this.length) {
        return index;
      }
    }
    return -1;
  },
  lastIndexOf: function(searchValue) {
    return this.indexOf(searchValue);
  },
  take: function(amount) {
    return this.slice(0, Math.max(0, amount));
  },
  skip: function(amount) {
    return this.slice(Math.max(0, amount));
  },
  __iterate: function(fn, reverse) {
    var maxIndex = this.length - 1;
    var step = this._step;
    var value = reverse ? this._start + maxIndex * step : this._start;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(value, ii, this) === false) {
        return ii + 1;
      }
      value += reverse ? -step : step;
    }
    return ii;
  },
  __iterator: function(type, reverse) {
    var maxIndex = this.length - 1;
    var step = this._step;
    var value = reverse ? this._start + maxIndex * step : this._start;
    var ii = 0;
    return new Iterator((function() {
      var v = value;
      value += reverse ? -step : step;
      return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
    }));
  },
  __deepEquals: function(other) {
    return other instanceof $Range ? this._start === other._start && this._end === other._end && this._step === other._step : $traceurRuntime.superCall(this, $Range.prototype, "__deepEquals", [other]);
  }
}, {}, IndexedSequence);
var RangePrototype = Range.prototype;
RangePrototype.__toJS = RangePrototype.toArray;
RangePrototype.first = VectorPrototype.first;
RangePrototype.last = VectorPrototype.last;
var __EMPTY_RANGE = Range(0, 0);
var Repeat = function Repeat(value, times) {
  if (times === 0 && EMPTY_REPEAT) {
    return EMPTY_REPEAT;
  }
  if (!(this instanceof $Repeat)) {
    return new $Repeat(value, times);
  }
  this._value = value;
  this.length = times == null ? Infinity : Math.max(0, times);
};
var $Repeat = Repeat;
($traceurRuntime.createClass)(Repeat, {
  toString: function() {
    if (this.length === 0) {
      return 'Repeat []';
    }
    return 'Repeat [ ' + this._value + ' ' + this.length + ' times ]';
  },
  get: function(index, notSetValue) {
    return this.has(index) ? this._value : notSetValue;
  },
  contains: function(searchValue) {
    return is(this._value, searchValue);
  },
  slice: function(begin, end) {
    var length = this.length;
    begin = begin < 0 ? Math.max(0, length + begin) : Math.min(length, begin);
    end = end == null ? length : end > 0 ? Math.min(length, end) : Math.max(0, length + end);
    return end > begin ? new $Repeat(this._value, end - begin) : EMPTY_REPEAT;
  },
  reverse: function() {
    return this;
  },
  indexOf: function(searchValue) {
    if (is(this._value, searchValue)) {
      return 0;
    }
    return -1;
  },
  lastIndexOf: function(searchValue) {
    if (is(this._value, searchValue)) {
      return this.length;
    }
    return -1;
  },
  __iterate: function(fn, reverse) {
    for (var ii = 0; ii < this.length; ii++) {
      if (fn(this._value, ii, this) === false) {
        return ii + 1;
      }
    }
    return ii;
  },
  __iterator: function(type, reverse) {
    var $__0 = this;
    var ii = 0;
    return new Iterator((function() {
      return ii < $__0.length ? iteratorValue(type, ii++, $__0._value) : iteratorDone();
    }));
  },
  __deepEquals: function(other) {
    return other instanceof $Repeat ? is(this._value, other._value) : $traceurRuntime.superCall(this, $Repeat.prototype, "__deepEquals", [other]);
  }
}, {}, IndexedSequence);
var RepeatPrototype = Repeat.prototype;
RepeatPrototype.last = RepeatPrototype.first;
RepeatPrototype.has = RangePrototype.has;
RepeatPrototype.take = RangePrototype.take;
RepeatPrototype.skip = RangePrototype.skip;
RepeatPrototype.__toJS = RangePrototype.__toJS;
var EMPTY_REPEAT = new Repeat(undefined, 0);
function fromJS(json, converter) {
  if (converter) {
    return _fromJSWith(converter, json, '', {'': json});
  }
  return _fromJSDefault(json);
}
function _fromJSWith(converter, json, key, parentJSON) {
  if (json && (Array.isArray(json) || json.constructor === Object)) {
    return converter.call(parentJSON, key, Sequence(json).map((function(v, k) {
      return _fromJSWith(converter, v, k, json);
    })));
  }
  return json;
}
function _fromJSDefault(json) {
  if (json) {
    if (Array.isArray(json)) {
      return Sequence(json).map(_fromJSDefault).toVector();
    }
    if (json.constructor === Object) {
      return Sequence(json).map(_fromJSDefault).toMap();
    }
  }
  return json;
}
var Immutable = {
  Sequence: Sequence,
  Map: Map,
  Vector: Vector,
  Stack: Stack,
  Set: Set,
  OrderedMap: OrderedMap,
  Record: Record,
  Range: Range,
  Repeat: Repeat,
  is: is,
  fromJS: fromJS
};

  return Immutable;
}
typeof exports === 'object' ? module.exports = universalModule() :
  typeof define === 'function' && define.amd ? define(universalModule) :
    Immutable = universalModule();

},{}],5:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule AutoFocusMixin
 * @typechecks static-only
 */

"use strict";

var focusNode = require("./focusNode");

var AutoFocusMixin = {
  componentDidMount: function() {
    if (this.props.autoFocus) {
      focusNode(this.getDOMNode());
    }
  }
};

module.exports = AutoFocusMixin;

},{"./focusNode":110}],6:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule BeforeInputEventPlugin
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var SyntheticInputEvent = require("./SyntheticInputEvent");

var keyOf = require("./keyOf");

var canUseTextInputEvent = (
  ExecutionEnvironment.canUseDOM &&
  'TextEvent' in window &&
  !('documentMode' in document || isPresto())
);

/**
 * Opera <= 12 includes TextEvent in window, but does not fire
 * text input events. Rely on keypress instead.
 */
function isPresto() {
  var opera = window.opera;
  return (
    typeof opera === 'object' &&
    typeof opera.version === 'function' &&
    parseInt(opera.version(), 10) <= 12
  );
}

var SPACEBAR_CODE = 32;
var SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);

var topLevelTypes = EventConstants.topLevelTypes;

// Events and their corresponding property names.
var eventTypes = {
  beforeInput: {
    phasedRegistrationNames: {
      bubbled: keyOf({onBeforeInput: null}),
      captured: keyOf({onBeforeInputCapture: null})
    },
    dependencies: [
      topLevelTypes.topCompositionEnd,
      topLevelTypes.topKeyPress,
      topLevelTypes.topTextInput,
      topLevelTypes.topPaste
    ]
  }
};

// Track characters inserted via keypress and composition events.
var fallbackChars = null;

/**
 * Return whether a native keypress event is assumed to be a command.
 * This is required because Firefox fires `keypress` events for key commands
 * (cut, copy, select-all, etc.) even though no character is inserted.
 */
function isKeypressCommand(nativeEvent) {
  return (
    (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) &&
    // ctrlKey && altKey is equivalent to AltGr, and is not a command.
    !(nativeEvent.ctrlKey && nativeEvent.altKey)
  );
}

/**
 * Create an `onBeforeInput` event to match
 * http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105/#events-inputevents.
 *
 * This event plugin is based on the native `textInput` event
 * available in Chrome, Safari, Opera, and IE. This event fires after
 * `onKeyPress` and `onCompositionEnd`, but before `onInput`.
 *
 * `beforeInput` is spec'd but not implemented in any browsers, and
 * the `input` event does not provide any useful information about what has
 * actually been added, contrary to the spec. Thus, `textInput` is the best
 * available event to identify the characters that have actually been inserted
 * into the target node.
 */
var BeforeInputEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    var chars;

    if (canUseTextInputEvent) {
      switch (topLevelType) {
        case topLevelTypes.topKeyPress:
          /**
           * If native `textInput` events are available, our goal is to make
           * use of them. However, there is a special case: the spacebar key.
           * In Webkit, preventing default on a spacebar `textInput` event
           * cancels character insertion, but it *also* causes the browser
           * to fall back to its default spacebar behavior of scrolling the
           * page.
           *
           * Tracking at:
           * https://code.google.com/p/chromium/issues/detail?id=355103
           *
           * To avoid this issue, use the keypress event as if no `textInput`
           * event is available.
           */
          var which = nativeEvent.which;
          if (which !== SPACEBAR_CODE) {
            return;
          }

          chars = String.fromCharCode(which);
          break;

        case topLevelTypes.topTextInput:
          // Record the characters to be added to the DOM.
          chars = nativeEvent.data;

          // If it's a spacebar character, assume that we have already handled
          // it at the keypress level and bail immediately.
          if (chars === SPACEBAR_CHAR) {
            return;
          }

          // Otherwise, carry on.
          break;

        default:
          // For other native event types, do nothing.
          return;
      }
    } else {
      switch (topLevelType) {
        case topLevelTypes.topPaste:
          // If a paste event occurs after a keypress, throw out the input
          // chars. Paste events should not lead to BeforeInput events.
          fallbackChars = null;
          break;
        case topLevelTypes.topKeyPress:
          /**
           * As of v27, Firefox may fire keypress events even when no character
           * will be inserted. A few possibilities:
           *
           * - `which` is `0`. Arrow keys, Esc key, etc.
           *
           * - `which` is the pressed key code, but no char is available.
           *   Ex: 'AltGr + d` in Polish. There is no modified character for
           *   this key combination and no character is inserted into the
           *   document, but FF fires the keypress for char code `100` anyway.
           *   No `input` event will occur.
           *
           * - `which` is the pressed key code, but a command combination is
           *   being used. Ex: `Cmd+C`. No character is inserted, and no
           *   `input` event will occur.
           */
          if (nativeEvent.which && !isKeypressCommand(nativeEvent)) {
            fallbackChars = String.fromCharCode(nativeEvent.which);
          }
          break;
        case topLevelTypes.topCompositionEnd:
          fallbackChars = nativeEvent.data;
          break;
      }

      // If no changes have occurred to the fallback string, no relevant
      // event has fired and we're done.
      if (fallbackChars === null) {
        return;
      }

      chars = fallbackChars;
    }

    // If no characters are being inserted, no BeforeInput event should
    // be fired.
    if (!chars) {
      return;
    }

    var event = SyntheticInputEvent.getPooled(
      eventTypes.beforeInput,
      topLevelTargetID,
      nativeEvent
    );

    event.data = chars;
    fallbackChars = null;
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  }
};

module.exports = BeforeInputEventPlugin;

},{"./EventConstants":19,"./EventPropagators":24,"./ExecutionEnvironment":25,"./SyntheticInputEvent":90,"./keyOf":131}],7:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CSSProperty
 */

"use strict";

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
var isUnitlessNumber = {
  columnCount: true,
  fillOpacity: true,
  flex: true,
  flexGrow: true,
  flexShrink: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  widows: true,
  zIndex: true,
  zoom: true
};

/**
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */
function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 */
var prefixes = ['Webkit', 'ms', 'Moz', 'O'];

// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
Object.keys(isUnitlessNumber).forEach(function(prop) {
  prefixes.forEach(function(prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
  });
});

/**
 * Most style properties can be unset by doing .style[prop] = '' but IE8
 * doesn't like doing that with shorthand properties so for the properties that
 * IE8 breaks on, which are listed here, we instead unset each of the
 * individual properties. See http://bugs.jquery.com/ticket/12385.
 * The 4-value 'clock' properties like margin, padding, border-width seem to
 * behave without any problems. Curiously, list-style works too without any
 * special prodding.
 */
var shorthandPropertyExpansions = {
  background: {
    backgroundImage: true,
    backgroundPosition: true,
    backgroundRepeat: true,
    backgroundColor: true
  },
  border: {
    borderWidth: true,
    borderStyle: true,
    borderColor: true
  },
  borderBottom: {
    borderBottomWidth: true,
    borderBottomStyle: true,
    borderBottomColor: true
  },
  borderLeft: {
    borderLeftWidth: true,
    borderLeftStyle: true,
    borderLeftColor: true
  },
  borderRight: {
    borderRightWidth: true,
    borderRightStyle: true,
    borderRightColor: true
  },
  borderTop: {
    borderTopWidth: true,
    borderTopStyle: true,
    borderTopColor: true
  },
  font: {
    fontStyle: true,
    fontVariant: true,
    fontWeight: true,
    fontSize: true,
    lineHeight: true,
    fontFamily: true
  }
};

var CSSProperty = {
  isUnitlessNumber: isUnitlessNumber,
  shorthandPropertyExpansions: shorthandPropertyExpansions
};

module.exports = CSSProperty;

},{}],8:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CSSPropertyOperations
 * @typechecks static-only
 */

"use strict";

var CSSProperty = require("./CSSProperty");

var dangerousStyleValue = require("./dangerousStyleValue");
var hyphenateStyleName = require("./hyphenateStyleName");
var memoizeStringOnly = require("./memoizeStringOnly");

var processStyleName = memoizeStringOnly(function(styleName) {
  return hyphenateStyleName(styleName);
});

/**
 * Operations for dealing with CSS properties.
 */
var CSSPropertyOperations = {

  /**
   * Serializes a mapping of style properties for use as inline styles:
   *
   *   > createMarkupForStyles({width: '200px', height: 0})
   *   "width:200px;height:0;"
   *
   * Undefined values are ignored so that declarative programming is easier.
   * The result should be HTML-escaped before insertion into the DOM.
   *
   * @param {object} styles
   * @return {?string}
   */
  createMarkupForStyles: function(styles) {
    var serialized = '';
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      var styleValue = styles[styleName];
      if (styleValue != null) {
        serialized += processStyleName(styleName) + ':';
        serialized += dangerousStyleValue(styleName, styleValue) + ';';
      }
    }
    return serialized || null;
  },

  /**
   * Sets the value for multiple styles on a node.  If a value is specified as
   * '' (empty string), the corresponding style property will be unset.
   *
   * @param {DOMElement} node
   * @param {object} styles
   */
  setValueForStyles: function(node, styles) {
    var style = node.style;
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      var styleValue = dangerousStyleValue(styleName, styles[styleName]);
      if (styleValue) {
        style[styleName] = styleValue;
      } else {
        var expansion = CSSProperty.shorthandPropertyExpansions[styleName];
        if (expansion) {
          // Shorthand property that IE8 won't like unsetting, so unset each
          // component to placate it
          for (var individualStyleName in expansion) {
            style[individualStyleName] = '';
          }
        } else {
          style[styleName] = '';
        }
      }
    }
  }

};

module.exports = CSSPropertyOperations;

},{"./CSSProperty":7,"./dangerousStyleValue":105,"./hyphenateStyleName":122,"./memoizeStringOnly":133}],9:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CallbackQueue
 */

"use strict";

var PooledClass = require("./PooledClass");

var invariant = require("./invariant");
var mixInto = require("./mixInto");

/**
 * A specialized pseudo-event module to help keep track of components waiting to
 * be notified when their DOM representations are available for use.
 *
 * This implements `PooledClass`, so you should never need to instantiate this.
 * Instead, use `CallbackQueue.getPooled()`.
 *
 * @class ReactMountReady
 * @implements PooledClass
 * @internal
 */
function CallbackQueue() {
  this._callbacks = null;
  this._contexts = null;
}

mixInto(CallbackQueue, {

  /**
   * Enqueues a callback to be invoked when `notifyAll` is invoked.
   *
   * @param {function} callback Invoked when `notifyAll` is invoked.
   * @param {?object} context Context to call `callback` with.
   * @internal
   */
  enqueue: function(callback, context) {
    this._callbacks = this._callbacks || [];
    this._contexts = this._contexts || [];
    this._callbacks.push(callback);
    this._contexts.push(context);
  },

  /**
   * Invokes all enqueued callbacks and clears the queue. This is invoked after
   * the DOM representation of a component has been created or updated.
   *
   * @internal
   */
  notifyAll: function() {
    var callbacks = this._callbacks;
    var contexts = this._contexts;
    if (callbacks) {
      ("production" !== process.env.NODE_ENV ? invariant(
        callbacks.length === contexts.length,
        "Mismatched list of contexts in callback queue"
      ) : invariant(callbacks.length === contexts.length));
      this._callbacks = null;
      this._contexts = null;
      for (var i = 0, l = callbacks.length; i < l; i++) {
        callbacks[i].call(contexts[i]);
      }
      callbacks.length = 0;
      contexts.length = 0;
    }
  },

  /**
   * Resets the internal queue.
   *
   * @internal
   */
  reset: function() {
    this._callbacks = null;
    this._contexts = null;
  },

  /**
   * `PooledClass` looks for this.
   */
  destructor: function() {
    this.reset();
  }

});

PooledClass.addPoolingTo(CallbackQueue);

module.exports = CallbackQueue;

}).call(this,require('_process'))
},{"./PooledClass":30,"./invariant":124,"./mixInto":137,"_process":3}],10:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ChangeEventPlugin
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var ReactUpdates = require("./ReactUpdates");
var SyntheticEvent = require("./SyntheticEvent");

var isEventSupported = require("./isEventSupported");
var isTextInputElement = require("./isTextInputElement");
var keyOf = require("./keyOf");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  change: {
    phasedRegistrationNames: {
      bubbled: keyOf({onChange: null}),
      captured: keyOf({onChangeCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topChange,
      topLevelTypes.topClick,
      topLevelTypes.topFocus,
      topLevelTypes.topInput,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyUp,
      topLevelTypes.topSelectionChange
    ]
  }
};

/**
 * For IE shims
 */
var activeElement = null;
var activeElementID = null;
var activeElementValue = null;
var activeElementValueProp = null;

/**
 * SECTION: handle `change` event
 */
function shouldUseChangeEvent(elem) {
  return (
    elem.nodeName === 'SELECT' ||
    (elem.nodeName === 'INPUT' && elem.type === 'file')
  );
}

var doesChangeEventBubble = false;
if (ExecutionEnvironment.canUseDOM) {
  // See `handleChange` comment below
  doesChangeEventBubble = isEventSupported('change') && (
    !('documentMode' in document) || document.documentMode > 8
  );
}

function manualDispatchChangeEvent(nativeEvent) {
  var event = SyntheticEvent.getPooled(
    eventTypes.change,
    activeElementID,
    nativeEvent
  );
  EventPropagators.accumulateTwoPhaseDispatches(event);

  // If change and propertychange bubbled, we'd just bind to it like all the
  // other events and have it go through ReactBrowserEventEmitter. Since it
  // doesn't, we manually listen for the events and so we have to enqueue and
  // process the abstract event manually.
  //
  // Batching is necessary here in order to ensure that all event handlers run
  // before the next rerender (including event handlers attached to ancestor
  // elements instead of directly on the input). Without this, controlled
  // components don't work properly in conjunction with event bubbling because
  // the component is rerendered and the value reverted before all the event
  // handlers can run. See https://github.com/facebook/react/issues/708.
  ReactUpdates.batchedUpdates(runEventInBatch, event);
}

function runEventInBatch(event) {
  EventPluginHub.enqueueEvents(event);
  EventPluginHub.processEventQueue();
}

function startWatchingForChangeEventIE8(target, targetID) {
  activeElement = target;
  activeElementID = targetID;
  activeElement.attachEvent('onchange', manualDispatchChangeEvent);
}

function stopWatchingForChangeEventIE8() {
  if (!activeElement) {
    return;
  }
  activeElement.detachEvent('onchange', manualDispatchChangeEvent);
  activeElement = null;
  activeElementID = null;
}

function getTargetIDForChangeEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topChange) {
    return topLevelTargetID;
  }
}
function handleEventsForChangeEventIE8(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topFocus) {
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForChangeEventIE8();
    startWatchingForChangeEventIE8(topLevelTarget, topLevelTargetID);
  } else if (topLevelType === topLevelTypes.topBlur) {
    stopWatchingForChangeEventIE8();
  }
}


/**
 * SECTION: handle `input` event
 */
var isInputEventSupported = false;
if (ExecutionEnvironment.canUseDOM) {
  // IE9 claims to support the input event but fails to trigger it when
  // deleting text, so we ignore its input events
  isInputEventSupported = isEventSupported('input') && (
    !('documentMode' in document) || document.documentMode > 9
  );
}

/**
 * (For old IE.) Replacement getter/setter for the `value` property that gets
 * set on the active element.
 */
var newValueProp =  {
  get: function() {
    return activeElementValueProp.get.call(this);
  },
  set: function(val) {
    // Cast to a string so we can do equality checks.
    activeElementValue = '' + val;
    activeElementValueProp.set.call(this, val);
  }
};

/**
 * (For old IE.) Starts tracking propertychange events on the passed-in element
 * and override the value property so that we can distinguish user events from
 * value changes in JS.
 */
function startWatchingForValueChange(target, targetID) {
  activeElement = target;
  activeElementID = targetID;
  activeElementValue = target.value;
  activeElementValueProp = Object.getOwnPropertyDescriptor(
    target.constructor.prototype,
    'value'
  );

  Object.defineProperty(activeElement, 'value', newValueProp);
  activeElement.attachEvent('onpropertychange', handlePropertyChange);
}

/**
 * (For old IE.) Removes the event listeners from the currently-tracked element,
 * if any exists.
 */
function stopWatchingForValueChange() {
  if (!activeElement) {
    return;
  }

  // delete restores the original property definition
  delete activeElement.value;
  activeElement.detachEvent('onpropertychange', handlePropertyChange);

  activeElement = null;
  activeElementID = null;
  activeElementValue = null;
  activeElementValueProp = null;
}

/**
 * (For old IE.) Handles a propertychange event, sending a `change` event if
 * the value of the active element has changed.
 */
function handlePropertyChange(nativeEvent) {
  if (nativeEvent.propertyName !== 'value') {
    return;
  }
  var value = nativeEvent.srcElement.value;
  if (value === activeElementValue) {
    return;
  }
  activeElementValue = value;

  manualDispatchChangeEvent(nativeEvent);
}

/**
 * If a `change` event should be fired, returns the target's ID.
 */
function getTargetIDForInputEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topInput) {
    // In modern browsers (i.e., not IE8 or IE9), the input event is exactly
    // what we want so fall through here and trigger an abstract event
    return topLevelTargetID;
  }
}

// For IE8 and IE9.
function handleEventsForInputEventIE(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topFocus) {
    // In IE8, we can capture almost all .value changes by adding a
    // propertychange handler and looking for events with propertyName
    // equal to 'value'
    // In IE9, propertychange fires for most input events but is buggy and
    // doesn't fire when text is deleted, but conveniently, selectionchange
    // appears to fire in all of the remaining cases so we catch those and
    // forward the event if the value has changed
    // In either case, we don't want to call the event handler if the value
    // is changed from JS so we redefine a setter for `.value` that updates
    // our activeElementValue variable, allowing us to ignore those changes
    //
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForValueChange();
    startWatchingForValueChange(topLevelTarget, topLevelTargetID);
  } else if (topLevelType === topLevelTypes.topBlur) {
    stopWatchingForValueChange();
  }
}

// For IE8 and IE9.
function getTargetIDForInputEventIE(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topSelectionChange ||
      topLevelType === topLevelTypes.topKeyUp ||
      topLevelType === topLevelTypes.topKeyDown) {
    // On the selectionchange event, the target is just document which isn't
    // helpful for us so just check activeElement instead.
    //
    // 99% of the time, keydown and keyup aren't necessary. IE8 fails to fire
    // propertychange on the first input event after setting `value` from a
    // script and fires only keydown, keypress, keyup. Catching keyup usually
    // gets it and catching keydown lets us fire an event for the first
    // keystroke if user does a key repeat (it'll be a little delayed: right
    // before the second keystroke). Other input methods (e.g., paste) seem to
    // fire selectionchange normally.
    if (activeElement && activeElement.value !== activeElementValue) {
      activeElementValue = activeElement.value;
      return activeElementID;
    }
  }
}


/**
 * SECTION: handle `click` event
 */
function shouldUseClickEvent(elem) {
  // Use the `click` event to detect changes to checkbox and radio inputs.
  // This approach works across all browsers, whereas `change` does not fire
  // until `blur` in IE8.
  return (
    elem.nodeName === 'INPUT' &&
    (elem.type === 'checkbox' || elem.type === 'radio')
  );
}

function getTargetIDForClickEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topClick) {
    return topLevelTargetID;
  }
}

/**
 * This plugin creates an `onChange` event that normalizes change events
 * across form elements. This event fires at a time when it's possible to
 * change the element's value without seeing a flicker.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - select
 */
var ChangeEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    var getTargetIDFunc, handleEventFunc;
    if (shouldUseChangeEvent(topLevelTarget)) {
      if (doesChangeEventBubble) {
        getTargetIDFunc = getTargetIDForChangeEvent;
      } else {
        handleEventFunc = handleEventsForChangeEventIE8;
      }
    } else if (isTextInputElement(topLevelTarget)) {
      if (isInputEventSupported) {
        getTargetIDFunc = getTargetIDForInputEvent;
      } else {
        getTargetIDFunc = getTargetIDForInputEventIE;
        handleEventFunc = handleEventsForInputEventIE;
      }
    } else if (shouldUseClickEvent(topLevelTarget)) {
      getTargetIDFunc = getTargetIDForClickEvent;
    }

    if (getTargetIDFunc) {
      var targetID = getTargetIDFunc(
        topLevelType,
        topLevelTarget,
        topLevelTargetID
      );
      if (targetID) {
        var event = SyntheticEvent.getPooled(
          eventTypes.change,
          targetID,
          nativeEvent
        );
        EventPropagators.accumulateTwoPhaseDispatches(event);
        return event;
      }
    }

    if (handleEventFunc) {
      handleEventFunc(
        topLevelType,
        topLevelTarget,
        topLevelTargetID
      );
    }
  }

};

module.exports = ChangeEventPlugin;

},{"./EventConstants":19,"./EventPluginHub":21,"./EventPropagators":24,"./ExecutionEnvironment":25,"./ReactUpdates":80,"./SyntheticEvent":88,"./isEventSupported":125,"./isTextInputElement":127,"./keyOf":131}],11:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ClientReactRootIndex
 * @typechecks
 */

"use strict";

var nextReactRootIndex = 0;

var ClientReactRootIndex = {
  createReactRootIndex: function() {
    return nextReactRootIndex++;
  }
};

module.exports = ClientReactRootIndex;

},{}],12:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CompositionEventPlugin
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var ReactInputSelection = require("./ReactInputSelection");
var SyntheticCompositionEvent = require("./SyntheticCompositionEvent");

var getTextContentAccessor = require("./getTextContentAccessor");
var keyOf = require("./keyOf");

var END_KEYCODES = [9, 13, 27, 32]; // Tab, Return, Esc, Space
var START_KEYCODE = 229;

var useCompositionEvent = (
  ExecutionEnvironment.canUseDOM &&
  'CompositionEvent' in window
);

// In IE9+, we have access to composition events, but the data supplied
// by the native compositionend event may be incorrect. In Korean, for example,
// the compositionend event contains only one character regardless of
// how many characters have been composed since compositionstart.
// We therefore use the fallback data while still using the native
// events as triggers.
var useFallbackData = (
  !useCompositionEvent ||
  (
    'documentMode' in document &&
    document.documentMode > 8 &&
    document.documentMode <= 11
  )
);

var topLevelTypes = EventConstants.topLevelTypes;
var currentComposition = null;

// Events and their corresponding property names.
var eventTypes = {
  compositionEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionEnd: null}),
      captured: keyOf({onCompositionEndCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topCompositionEnd,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyPress,
      topLevelTypes.topKeyUp,
      topLevelTypes.topMouseDown
    ]
  },
  compositionStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionStart: null}),
      captured: keyOf({onCompositionStartCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topCompositionStart,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyPress,
      topLevelTypes.topKeyUp,
      topLevelTypes.topMouseDown
    ]
  },
  compositionUpdate: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionUpdate: null}),
      captured: keyOf({onCompositionUpdateCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topCompositionUpdate,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyPress,
      topLevelTypes.topKeyUp,
      topLevelTypes.topMouseDown
    ]
  }
};

/**
 * Translate native top level events into event types.
 *
 * @param {string} topLevelType
 * @return {object}
 */
function getCompositionEventType(topLevelType) {
  switch (topLevelType) {
    case topLevelTypes.topCompositionStart:
      return eventTypes.compositionStart;
    case topLevelTypes.topCompositionEnd:
      return eventTypes.compositionEnd;
    case topLevelTypes.topCompositionUpdate:
      return eventTypes.compositionUpdate;
  }
}

/**
 * Does our fallback best-guess model think this event signifies that
 * composition has begun?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackStart(topLevelType, nativeEvent) {
  return (
    topLevelType === topLevelTypes.topKeyDown &&
    nativeEvent.keyCode === START_KEYCODE
  );
}

/**
 * Does our fallback mode think that this event is the end of composition?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackEnd(topLevelType, nativeEvent) {
  switch (topLevelType) {
    case topLevelTypes.topKeyUp:
      // Command keys insert or clear IME input.
      return (END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1);
    case topLevelTypes.topKeyDown:
      // Expect IME keyCode on each keydown. If we get any other
      // code we must have exited earlier.
      return (nativeEvent.keyCode !== START_KEYCODE);
    case topLevelTypes.topKeyPress:
    case topLevelTypes.topMouseDown:
    case topLevelTypes.topBlur:
      // Events are not possible without cancelling IME.
      return true;
    default:
      return false;
  }
}

/**
 * Helper class stores information about selection and document state
 * so we can figure out what changed at a later date.
 *
 * @param {DOMEventTarget} root
 */
function FallbackCompositionState(root) {
  this.root = root;
  this.startSelection = ReactInputSelection.getSelection(root);
  this.startValue = this.getText();
}

/**
 * Get current text of input.
 *
 * @return {string}
 */
FallbackCompositionState.prototype.getText = function() {
  return this.root.value || this.root[getTextContentAccessor()];
};

/**
 * Text that has changed since the start of composition.
 *
 * @return {string}
 */
FallbackCompositionState.prototype.getData = function() {
  var endValue = this.getText();
  var prefixLength = this.startSelection.start;
  var suffixLength = this.startValue.length - this.startSelection.end;

  return endValue.substr(
    prefixLength,
    endValue.length - suffixLength - prefixLength
  );
};

/**
 * This plugin creates `onCompositionStart`, `onCompositionUpdate` and
 * `onCompositionEnd` events on inputs, textareas and contentEditable
 * nodes.
 */
var CompositionEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    var eventType;
    var data;

    if (useCompositionEvent) {
      eventType = getCompositionEventType(topLevelType);
    } else if (!currentComposition) {
      if (isFallbackStart(topLevelType, nativeEvent)) {
        eventType = eventTypes.compositionStart;
      }
    } else if (isFallbackEnd(topLevelType, nativeEvent)) {
      eventType = eventTypes.compositionEnd;
    }

    if (useFallbackData) {
      // The current composition is stored statically and must not be
      // overwritten while composition continues.
      if (!currentComposition && eventType === eventTypes.compositionStart) {
        currentComposition = new FallbackCompositionState(topLevelTarget);
      } else if (eventType === eventTypes.compositionEnd) {
        if (currentComposition) {
          data = currentComposition.getData();
          currentComposition = null;
        }
      }
    }

    if (eventType) {
      var event = SyntheticCompositionEvent.getPooled(
        eventType,
        topLevelTargetID,
        nativeEvent
      );
      if (data) {
        // Inject data generated from fallback path into the synthetic event.
        // This matches the property of native CompositionEventInterface.
        event.data = data;
      }
      EventPropagators.accumulateTwoPhaseDispatches(event);
      return event;
    }
  }
};

module.exports = CompositionEventPlugin;

},{"./EventConstants":19,"./EventPropagators":24,"./ExecutionEnvironment":25,"./ReactInputSelection":62,"./SyntheticCompositionEvent":86,"./getTextContentAccessor":119,"./keyOf":131}],13:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DOMChildrenOperations
 * @typechecks static-only
 */

"use strict";

var Danger = require("./Danger");
var ReactMultiChildUpdateTypes = require("./ReactMultiChildUpdateTypes");

var getTextContentAccessor = require("./getTextContentAccessor");
var invariant = require("./invariant");

/**
 * The DOM property to use when setting text content.
 *
 * @type {string}
 * @private
 */
var textContentAccessor = getTextContentAccessor();

/**
 * Inserts `childNode` as a child of `parentNode` at the `index`.
 *
 * @param {DOMElement} parentNode Parent node in which to insert.
 * @param {DOMElement} childNode Child node to insert.
 * @param {number} index Index at which to insert the child.
 * @internal
 */
function insertChildAt(parentNode, childNode, index) {
  // By exploiting arrays returning `undefined` for an undefined index, we can
  // rely exclusively on `insertBefore(node, null)` instead of also using
  // `appendChild(node)`. However, using `undefined` is not allowed by all
  // browsers so we must replace it with `null`.
  parentNode.insertBefore(
    childNode,
    parentNode.childNodes[index] || null
  );
}

var updateTextContent;
if (textContentAccessor === 'textContent') {
  /**
   * Sets the text content of `node` to `text`.
   *
   * @param {DOMElement} node Node to change
   * @param {string} text New text content
   */
  updateTextContent = function(node, text) {
    node.textContent = text;
  };
} else {
  /**
   * Sets the text content of `node` to `text`.
   *
   * @param {DOMElement} node Node to change
   * @param {string} text New text content
   */
  updateTextContent = function(node, text) {
    // In order to preserve newlines correctly, we can't use .innerText to set
    // the contents (see #1080), so we empty the element then append a text node
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    if (text) {
      var doc = node.ownerDocument || document;
      node.appendChild(doc.createTextNode(text));
    }
  };
}

/**
 * Operations for updating with DOM children.
 */
var DOMChildrenOperations = {

  dangerouslyReplaceNodeWithMarkup: Danger.dangerouslyReplaceNodeWithMarkup,

  updateTextContent: updateTextContent,

  /**
   * Updates a component's children by processing a series of updates. The
   * update configurations are each expected to have a `parentNode` property.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markupList List of markup strings.
   * @internal
   */
  processUpdates: function(updates, markupList) {
    var update;
    // Mapping from parent IDs to initial child orderings.
    var initialChildren = null;
    // List of children that will be moved or removed.
    var updatedChildren = null;

    for (var i = 0; update = updates[i]; i++) {
      if (update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING ||
          update.type === ReactMultiChildUpdateTypes.REMOVE_NODE) {
        var updatedIndex = update.fromIndex;
        var updatedChild = update.parentNode.childNodes[updatedIndex];
        var parentID = update.parentID;

        ("production" !== process.env.NODE_ENV ? invariant(
          updatedChild,
          'processUpdates(): Unable to find child %s of element. This ' +
          'probably means the DOM was unexpectedly mutated (e.g., by the ' +
          'browser), usually due to forgetting a <tbody> when using tables, ' +
          'nesting <p> or <a> tags, or using non-SVG elements in an <svg> '+
          'parent. Try inspecting the child nodes of the element with React ' +
          'ID `%s`.',
          updatedIndex,
          parentID
        ) : invariant(updatedChild));

        initialChildren = initialChildren || {};
        initialChildren[parentID] = initialChildren[parentID] || [];
        initialChildren[parentID][updatedIndex] = updatedChild;

        updatedChildren = updatedChildren || [];
        updatedChildren.push(updatedChild);
      }
    }

    var renderedMarkup = Danger.dangerouslyRenderMarkup(markupList);

    // Remove updated children first so that `toIndex` is consistent.
    if (updatedChildren) {
      for (var j = 0; j < updatedChildren.length; j++) {
        updatedChildren[j].parentNode.removeChild(updatedChildren[j]);
      }
    }

    for (var k = 0; update = updates[k]; k++) {
      switch (update.type) {
        case ReactMultiChildUpdateTypes.INSERT_MARKUP:
          insertChildAt(
            update.parentNode,
            renderedMarkup[update.markupIndex],
            update.toIndex
          );
          break;
        case ReactMultiChildUpdateTypes.MOVE_EXISTING:
          insertChildAt(
            update.parentNode,
            initialChildren[update.parentID][update.fromIndex],
            update.toIndex
          );
          break;
        case ReactMultiChildUpdateTypes.TEXT_CONTENT:
          updateTextContent(
            update.parentNode,
            update.textContent
          );
          break;
        case ReactMultiChildUpdateTypes.REMOVE_NODE:
          // Already removed by the for-loop above.
          break;
      }
    }
  }

};

module.exports = DOMChildrenOperations;

}).call(this,require('_process'))
},{"./Danger":16,"./ReactMultiChildUpdateTypes":67,"./getTextContentAccessor":119,"./invariant":124,"_process":3}],14:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DOMProperty
 * @typechecks static-only
 */

/*jslint bitwise: true */

"use strict";

var invariant = require("./invariant");

var DOMPropertyInjection = {
  /**
   * Mapping from normalized, camelcased property names to a configuration that
   * specifies how the associated DOM property should be accessed or rendered.
   */
  MUST_USE_ATTRIBUTE: 0x1,
  MUST_USE_PROPERTY: 0x2,
  HAS_SIDE_EFFECTS: 0x4,
  HAS_BOOLEAN_VALUE: 0x8,
  HAS_NUMERIC_VALUE: 0x10,
  HAS_POSITIVE_NUMERIC_VALUE: 0x20 | 0x10,
  HAS_OVERLOADED_BOOLEAN_VALUE: 0x40,

  /**
   * Inject some specialized knowledge about the DOM. This takes a config object
   * with the following properties:
   *
   * isCustomAttribute: function that given an attribute name will return true
   * if it can be inserted into the DOM verbatim. Useful for data-* or aria-*
   * attributes where it's impossible to enumerate all of the possible
   * attribute names,
   *
   * Properties: object mapping DOM property name to one of the
   * DOMPropertyInjection constants or null. If your attribute isn't in here,
   * it won't get written to the DOM.
   *
   * DOMAttributeNames: object mapping React attribute name to the DOM
   * attribute name. Attribute names not specified use the **lowercase**
   * normalized name.
   *
   * DOMPropertyNames: similar to DOMAttributeNames but for DOM properties.
   * Property names not specified use the normalized name.
   *
   * DOMMutationMethods: Properties that require special mutation methods. If
   * `value` is undefined, the mutation method should unset the property.
   *
   * @param {object} domPropertyConfig the config as described above.
   */
  injectDOMPropertyConfig: function(domPropertyConfig) {
    var Properties = domPropertyConfig.Properties || {};
    var DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
    var DOMPropertyNames = domPropertyConfig.DOMPropertyNames || {};
    var DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};

    if (domPropertyConfig.isCustomAttribute) {
      DOMProperty._isCustomAttributeFunctions.push(
        domPropertyConfig.isCustomAttribute
      );
    }

    for (var propName in Properties) {
      ("production" !== process.env.NODE_ENV ? invariant(
        !DOMProperty.isStandardName.hasOwnProperty(propName),
        'injectDOMPropertyConfig(...): You\'re trying to inject DOM property ' +
        '\'%s\' which has already been injected. You may be accidentally ' +
        'injecting the same DOM property config twice, or you may be ' +
        'injecting two configs that have conflicting property names.',
        propName
      ) : invariant(!DOMProperty.isStandardName.hasOwnProperty(propName)));

      DOMProperty.isStandardName[propName] = true;

      var lowerCased = propName.toLowerCase();
      DOMProperty.getPossibleStandardName[lowerCased] = propName;

      if (DOMAttributeNames.hasOwnProperty(propName)) {
        var attributeName = DOMAttributeNames[propName];
        DOMProperty.getPossibleStandardName[attributeName] = propName;
        DOMProperty.getAttributeName[propName] = attributeName;
      } else {
        DOMProperty.getAttributeName[propName] = lowerCased;
      }

      DOMProperty.getPropertyName[propName] =
        DOMPropertyNames.hasOwnProperty(propName) ?
          DOMPropertyNames[propName] :
          propName;

      if (DOMMutationMethods.hasOwnProperty(propName)) {
        DOMProperty.getMutationMethod[propName] = DOMMutationMethods[propName];
      } else {
        DOMProperty.getMutationMethod[propName] = null;
      }

      var propConfig = Properties[propName];
      DOMProperty.mustUseAttribute[propName] =
        propConfig & DOMPropertyInjection.MUST_USE_ATTRIBUTE;
      DOMProperty.mustUseProperty[propName] =
        propConfig & DOMPropertyInjection.MUST_USE_PROPERTY;
      DOMProperty.hasSideEffects[propName] =
        propConfig & DOMPropertyInjection.HAS_SIDE_EFFECTS;
      DOMProperty.hasBooleanValue[propName] =
        propConfig & DOMPropertyInjection.HAS_BOOLEAN_VALUE;
      DOMProperty.hasNumericValue[propName] =
        propConfig & DOMPropertyInjection.HAS_NUMERIC_VALUE;
      DOMProperty.hasPositiveNumericValue[propName] =
        propConfig & DOMPropertyInjection.HAS_POSITIVE_NUMERIC_VALUE;
      DOMProperty.hasOverloadedBooleanValue[propName] =
        propConfig & DOMPropertyInjection.HAS_OVERLOADED_BOOLEAN_VALUE;

      ("production" !== process.env.NODE_ENV ? invariant(
        !DOMProperty.mustUseAttribute[propName] ||
          !DOMProperty.mustUseProperty[propName],
        'DOMProperty: Cannot require using both attribute and property: %s',
        propName
      ) : invariant(!DOMProperty.mustUseAttribute[propName] ||
        !DOMProperty.mustUseProperty[propName]));
      ("production" !== process.env.NODE_ENV ? invariant(
        DOMProperty.mustUseProperty[propName] ||
          !DOMProperty.hasSideEffects[propName],
        'DOMProperty: Properties that have side effects must use property: %s',
        propName
      ) : invariant(DOMProperty.mustUseProperty[propName] ||
        !DOMProperty.hasSideEffects[propName]));
      ("production" !== process.env.NODE_ENV ? invariant(
        !!DOMProperty.hasBooleanValue[propName] +
          !!DOMProperty.hasNumericValue[propName] +
          !!DOMProperty.hasOverloadedBooleanValue[propName] <= 1,
        'DOMProperty: Value can be one of boolean, overloaded boolean, or ' +
        'numeric value, but not a combination: %s',
        propName
      ) : invariant(!!DOMProperty.hasBooleanValue[propName] +
        !!DOMProperty.hasNumericValue[propName] +
        !!DOMProperty.hasOverloadedBooleanValue[propName] <= 1));
    }
  }
};
var defaultValueCache = {};

/**
 * DOMProperty exports lookup objects that can be used like functions:
 *
 *   > DOMProperty.isValid['id']
 *   true
 *   > DOMProperty.isValid['foobar']
 *   undefined
 *
 * Although this may be confusing, it performs better in general.
 *
 * @see http://jsperf.com/key-exists
 * @see http://jsperf.com/key-missing
 */
var DOMProperty = {

  ID_ATTRIBUTE_NAME: 'data-reactid',

  /**
   * Checks whether a property name is a standard property.
   * @type {Object}
   */
  isStandardName: {},

  /**
   * Mapping from lowercase property names to the properly cased version, used
   * to warn in the case of missing properties.
   * @type {Object}
   */
  getPossibleStandardName: {},

  /**
   * Mapping from normalized names to attribute names that differ. Attribute
   * names are used when rendering markup or with `*Attribute()`.
   * @type {Object}
   */
  getAttributeName: {},

  /**
   * Mapping from normalized names to properties on DOM node instances.
   * (This includes properties that mutate due to external factors.)
   * @type {Object}
   */
  getPropertyName: {},

  /**
   * Mapping from normalized names to mutation methods. This will only exist if
   * mutation cannot be set simply by the property or `setAttribute()`.
   * @type {Object}
   */
  getMutationMethod: {},

  /**
   * Whether the property must be accessed and mutated as an object property.
   * @type {Object}
   */
  mustUseAttribute: {},

  /**
   * Whether the property must be accessed and mutated using `*Attribute()`.
   * (This includes anything that fails `<propName> in <element>`.)
   * @type {Object}
   */
  mustUseProperty: {},

  /**
   * Whether or not setting a value causes side effects such as triggering
   * resources to be loaded or text selection changes. We must ensure that
   * the value is only set if it has changed.
   * @type {Object}
   */
  hasSideEffects: {},

  /**
   * Whether the property should be removed when set to a falsey value.
   * @type {Object}
   */
  hasBooleanValue: {},

  /**
   * Whether the property must be numeric or parse as a
   * numeric and should be removed when set to a falsey value.
   * @type {Object}
   */
  hasNumericValue: {},

  /**
   * Whether the property must be positive numeric or parse as a positive
   * numeric and should be removed when set to a falsey value.
   * @type {Object}
   */
  hasPositiveNumericValue: {},

  /**
   * Whether the property can be used as a flag as well as with a value. Removed
   * when strictly equal to false; present without a value when strictly equal
   * to true; present with a value otherwise.
   * @type {Object}
   */
  hasOverloadedBooleanValue: {},

  /**
   * All of the isCustomAttribute() functions that have been injected.
   */
  _isCustomAttributeFunctions: [],

  /**
   * Checks whether a property name is a custom attribute.
   * @method
   */
  isCustomAttribute: function(attributeName) {
    for (var i = 0; i < DOMProperty._isCustomAttributeFunctions.length; i++) {
      var isCustomAttributeFn = DOMProperty._isCustomAttributeFunctions[i];
      if (isCustomAttributeFn(attributeName)) {
        return true;
      }
    }
    return false;
  },

  /**
   * Returns the default property value for a DOM property (i.e., not an
   * attribute). Most default values are '' or false, but not all. Worse yet,
   * some (in particular, `type`) vary depending on the type of element.
   *
   * TODO: Is it better to grab all the possible properties when creating an
   * element to avoid having to create the same element twice?
   */
  getDefaultValueForProperty: function(nodeName, prop) {
    var nodeDefaults = defaultValueCache[nodeName];
    var testElement;
    if (!nodeDefaults) {
      defaultValueCache[nodeName] = nodeDefaults = {};
    }
    if (!(prop in nodeDefaults)) {
      testElement = document.createElement(nodeName);
      nodeDefaults[prop] = testElement[prop];
    }
    return nodeDefaults[prop];
  },

  injection: DOMPropertyInjection
};

module.exports = DOMProperty;

}).call(this,require('_process'))
},{"./invariant":124,"_process":3}],15:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DOMPropertyOperations
 * @typechecks static-only
 */

"use strict";

var DOMProperty = require("./DOMProperty");

var escapeTextForBrowser = require("./escapeTextForBrowser");
var memoizeStringOnly = require("./memoizeStringOnly");
var warning = require("./warning");

function shouldIgnoreValue(name, value) {
  return value == null ||
    (DOMProperty.hasBooleanValue[name] && !value) ||
    (DOMProperty.hasNumericValue[name] && isNaN(value)) ||
    (DOMProperty.hasPositiveNumericValue[name] && (value < 1)) ||
    (DOMProperty.hasOverloadedBooleanValue[name] && value === false);
}

var processAttributeNameAndPrefix = memoizeStringOnly(function(name) {
  return escapeTextForBrowser(name) + '="';
});

if ("production" !== process.env.NODE_ENV) {
  var reactProps = {
    children: true,
    dangerouslySetInnerHTML: true,
    key: true,
    ref: true
  };
  var warnedProperties = {};

  var warnUnknownProperty = function(name) {
    if (reactProps.hasOwnProperty(name) && reactProps[name] ||
        warnedProperties.hasOwnProperty(name) && warnedProperties[name]) {
      return;
    }

    warnedProperties[name] = true;
    var lowerCasedName = name.toLowerCase();

    // data-* attributes should be lowercase; suggest the lowercase version
    var standardName = (
      DOMProperty.isCustomAttribute(lowerCasedName) ?
        lowerCasedName :
      DOMProperty.getPossibleStandardName.hasOwnProperty(lowerCasedName) ?
        DOMProperty.getPossibleStandardName[lowerCasedName] :
        null
    );

    // For now, only warn when we have a suggested correction. This prevents
    // logging too much when using transferPropsTo.
    ("production" !== process.env.NODE_ENV ? warning(
      standardName == null,
      'Unknown DOM property ' + name + '. Did you mean ' + standardName + '?'
    ) : null);

  };
}

/**
 * Operations for dealing with DOM properties.
 */
var DOMPropertyOperations = {

  /**
   * Creates markup for the ID property.
   *
   * @param {string} id Unescaped ID.
   * @return {string} Markup string.
   */
  createMarkupForID: function(id) {
    return processAttributeNameAndPrefix(DOMProperty.ID_ATTRIBUTE_NAME) +
      escapeTextForBrowser(id) + '"';
  },

  /**
   * Creates markup for a property.
   *
   * @param {string} name
   * @param {*} value
   * @return {?string} Markup string, or null if the property was invalid.
   */
  createMarkupForProperty: function(name, value) {
    if (DOMProperty.isStandardName.hasOwnProperty(name) &&
        DOMProperty.isStandardName[name]) {
      if (shouldIgnoreValue(name, value)) {
        return '';
      }
      var attributeName = DOMProperty.getAttributeName[name];
      if (DOMProperty.hasBooleanValue[name] ||
          (DOMProperty.hasOverloadedBooleanValue[name] && value === true)) {
        return escapeTextForBrowser(attributeName);
      }
      return processAttributeNameAndPrefix(attributeName) +
        escapeTextForBrowser(value) + '"';
    } else if (DOMProperty.isCustomAttribute(name)) {
      if (value == null) {
        return '';
      }
      return processAttributeNameAndPrefix(name) +
        escapeTextForBrowser(value) + '"';
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
    return null;
  },

  /**
   * Sets the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   * @param {*} value
   */
  setValueForProperty: function(node, name, value) {
    if (DOMProperty.isStandardName.hasOwnProperty(name) &&
        DOMProperty.isStandardName[name]) {
      var mutationMethod = DOMProperty.getMutationMethod[name];
      if (mutationMethod) {
        mutationMethod(node, value);
      } else if (shouldIgnoreValue(name, value)) {
        this.deleteValueForProperty(node, name);
      } else if (DOMProperty.mustUseAttribute[name]) {
        node.setAttribute(DOMProperty.getAttributeName[name], '' + value);
      } else {
        var propName = DOMProperty.getPropertyName[name];
        if (!DOMProperty.hasSideEffects[name] || node[propName] !== value) {
          node[propName] = value;
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      if (value == null) {
        node.removeAttribute(name);
      } else {
        node.setAttribute(name, '' + value);
      }
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
  },

  /**
   * Deletes the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   */
  deleteValueForProperty: function(node, name) {
    if (DOMProperty.isStandardName.hasOwnProperty(name) &&
        DOMProperty.isStandardName[name]) {
      var mutationMethod = DOMProperty.getMutationMethod[name];
      if (mutationMethod) {
        mutationMethod(node, undefined);
      } else if (DOMProperty.mustUseAttribute[name]) {
        node.removeAttribute(DOMProperty.getAttributeName[name]);
      } else {
        var propName = DOMProperty.getPropertyName[name];
        var defaultValue = DOMProperty.getDefaultValueForProperty(
          node.nodeName,
          propName
        );
        if (!DOMProperty.hasSideEffects[name] ||
            node[propName] !== defaultValue) {
          node[propName] = defaultValue;
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      node.removeAttribute(name);
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
  }

};

module.exports = DOMPropertyOperations;

}).call(this,require('_process'))
},{"./DOMProperty":14,"./escapeTextForBrowser":108,"./memoizeStringOnly":133,"./warning":147,"_process":3}],16:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule Danger
 * @typechecks static-only
 */

/*jslint evil: true, sub: true */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var createNodesFromMarkup = require("./createNodesFromMarkup");
var emptyFunction = require("./emptyFunction");
var getMarkupWrap = require("./getMarkupWrap");
var invariant = require("./invariant");

var OPEN_TAG_NAME_EXP = /^(<[^ \/>]+)/;
var RESULT_INDEX_ATTR = 'data-danger-index';

/**
 * Extracts the `nodeName` from a string of markup.
 *
 * NOTE: Extracting the `nodeName` does not require a regular expression match
 * because we make assumptions about React-generated markup (i.e. there are no
 * spaces surrounding the opening tag and there is at least one attribute).
 *
 * @param {string} markup String of markup.
 * @return {string} Node name of the supplied markup.
 * @see http://jsperf.com/extract-nodename
 */
function getNodeName(markup) {
  return markup.substring(1, markup.indexOf(' '));
}

var Danger = {

  /**
   * Renders markup into an array of nodes. The markup is expected to render
   * into a list of root nodes. Also, the length of `resultList` and
   * `markupList` should be the same.
   *
   * @param {array<string>} markupList List of markup strings to render.
   * @return {array<DOMElement>} List of rendered nodes.
   * @internal
   */
  dangerouslyRenderMarkup: function(markupList) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ExecutionEnvironment.canUseDOM,
      'dangerouslyRenderMarkup(...): Cannot render markup in a Worker ' +
      'thread. This is likely a bug in the framework. Please report ' +
      'immediately.'
    ) : invariant(ExecutionEnvironment.canUseDOM));
    var nodeName;
    var markupByNodeName = {};
    // Group markup by `nodeName` if a wrap is necessary, else by '*'.
    for (var i = 0; i < markupList.length; i++) {
      ("production" !== process.env.NODE_ENV ? invariant(
        markupList[i],
        'dangerouslyRenderMarkup(...): Missing markup.'
      ) : invariant(markupList[i]));
      nodeName = getNodeName(markupList[i]);
      nodeName = getMarkupWrap(nodeName) ? nodeName : '*';
      markupByNodeName[nodeName] = markupByNodeName[nodeName] || [];
      markupByNodeName[nodeName][i] = markupList[i];
    }
    var resultList = [];
    var resultListAssignmentCount = 0;
    for (nodeName in markupByNodeName) {
      if (!markupByNodeName.hasOwnProperty(nodeName)) {
        continue;
      }
      var markupListByNodeName = markupByNodeName[nodeName];

      // This for-in loop skips the holes of the sparse array. The order of
      // iteration should follow the order of assignment, which happens to match
      // numerical index order, but we don't rely on that.
      for (var resultIndex in markupListByNodeName) {
        if (markupListByNodeName.hasOwnProperty(resultIndex)) {
          var markup = markupListByNodeName[resultIndex];

          // Push the requested markup with an additional RESULT_INDEX_ATTR
          // attribute.  If the markup does not start with a < character, it
          // will be discarded below (with an appropriate console.error).
          markupListByNodeName[resultIndex] = markup.replace(
            OPEN_TAG_NAME_EXP,
            // This index will be parsed back out below.
            '$1 ' + RESULT_INDEX_ATTR + '="' + resultIndex + '" '
          );
        }
      }

      // Render each group of markup with similar wrapping `nodeName`.
      var renderNodes = createNodesFromMarkup(
        markupListByNodeName.join(''),
        emptyFunction // Do nothing special with <script> tags.
      );

      for (i = 0; i < renderNodes.length; ++i) {
        var renderNode = renderNodes[i];
        if (renderNode.hasAttribute &&
            renderNode.hasAttribute(RESULT_INDEX_ATTR)) {

          resultIndex = +renderNode.getAttribute(RESULT_INDEX_ATTR);
          renderNode.removeAttribute(RESULT_INDEX_ATTR);

          ("production" !== process.env.NODE_ENV ? invariant(
            !resultList.hasOwnProperty(resultIndex),
            'Danger: Assigning to an already-occupied result index.'
          ) : invariant(!resultList.hasOwnProperty(resultIndex)));

          resultList[resultIndex] = renderNode;

          // This should match resultList.length and markupList.length when
          // we're done.
          resultListAssignmentCount += 1;

        } else if ("production" !== process.env.NODE_ENV) {
          console.error(
            "Danger: Discarding unexpected node:",
            renderNode
          );
        }
      }
    }

    // Although resultList was populated out of order, it should now be a dense
    // array.
    ("production" !== process.env.NODE_ENV ? invariant(
      resultListAssignmentCount === resultList.length,
      'Danger: Did not assign to every index of resultList.'
    ) : invariant(resultListAssignmentCount === resultList.length));

    ("production" !== process.env.NODE_ENV ? invariant(
      resultList.length === markupList.length,
      'Danger: Expected markup to render %s nodes, but rendered %s.',
      markupList.length,
      resultList.length
    ) : invariant(resultList.length === markupList.length));

    return resultList;
  },

  /**
   * Replaces a node with a string of markup at its current position within its
   * parent. The markup must render into a single root node.
   *
   * @param {DOMElement} oldChild Child node to replace.
   * @param {string} markup Markup to render in place of the child node.
   * @internal
   */
  dangerouslyReplaceNodeWithMarkup: function(oldChild, markup) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ExecutionEnvironment.canUseDOM,
      'dangerouslyReplaceNodeWithMarkup(...): Cannot render markup in a ' +
      'worker thread. This is likely a bug in the framework. Please report ' +
      'immediately.'
    ) : invariant(ExecutionEnvironment.canUseDOM));
    ("production" !== process.env.NODE_ENV ? invariant(markup, 'dangerouslyReplaceNodeWithMarkup(...): Missing markup.') : invariant(markup));
    ("production" !== process.env.NODE_ENV ? invariant(
      oldChild.tagName.toLowerCase() !== 'html',
      'dangerouslyReplaceNodeWithMarkup(...): Cannot replace markup of the ' +
      '<html> node. This is because browser quirks make this unreliable ' +
      'and/or slow. If you want to render to the root you must use ' +
      'server rendering. See renderComponentToString().'
    ) : invariant(oldChild.tagName.toLowerCase() !== 'html'));

    var newChild = createNodesFromMarkup(markup, emptyFunction)[0];
    oldChild.parentNode.replaceChild(newChild, oldChild);
  }

};

module.exports = Danger;

}).call(this,require('_process'))
},{"./ExecutionEnvironment":25,"./createNodesFromMarkup":104,"./emptyFunction":106,"./getMarkupWrap":116,"./invariant":124,"_process":3}],17:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DefaultEventPluginOrder
 */

"use strict";

 var keyOf = require("./keyOf");

/**
 * Module that is injectable into `EventPluginHub`, that specifies a
 * deterministic ordering of `EventPlugin`s. A convenient way to reason about
 * plugins, without having to package every one of them. This is better than
 * having plugins be ordered in the same order that they are injected because
 * that ordering would be influenced by the packaging order.
 * `ResponderEventPlugin` must occur before `SimpleEventPlugin` so that
 * preventing default on events is convenient in `SimpleEventPlugin` handlers.
 */
var DefaultEventPluginOrder = [
  keyOf({ResponderEventPlugin: null}),
  keyOf({SimpleEventPlugin: null}),
  keyOf({TapEventPlugin: null}),
  keyOf({EnterLeaveEventPlugin: null}),
  keyOf({ChangeEventPlugin: null}),
  keyOf({SelectEventPlugin: null}),
  keyOf({CompositionEventPlugin: null}),
  keyOf({BeforeInputEventPlugin: null}),
  keyOf({AnalyticsEventPlugin: null}),
  keyOf({MobileSafariClickEventPlugin: null})
];

module.exports = DefaultEventPluginOrder;

},{"./keyOf":131}],18:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EnterLeaveEventPlugin
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var SyntheticMouseEvent = require("./SyntheticMouseEvent");

var ReactMount = require("./ReactMount");
var keyOf = require("./keyOf");

var topLevelTypes = EventConstants.topLevelTypes;
var getFirstReactDOM = ReactMount.getFirstReactDOM;

var eventTypes = {
  mouseEnter: {
    registrationName: keyOf({onMouseEnter: null}),
    dependencies: [
      topLevelTypes.topMouseOut,
      topLevelTypes.topMouseOver
    ]
  },
  mouseLeave: {
    registrationName: keyOf({onMouseLeave: null}),
    dependencies: [
      topLevelTypes.topMouseOut,
      topLevelTypes.topMouseOver
    ]
  }
};

var extractedEvents = [null, null];

var EnterLeaveEventPlugin = {

  eventTypes: eventTypes,

  /**
   * For almost every interaction we care about, there will be both a top-level
   * `mouseover` and `mouseout` event that occurs. Only use `mouseout` so that
   * we do not extract duplicate events. However, moving the mouse into the
   * browser from outside will not fire a `mouseout` event. In this case, we use
   * the `mouseover` top-level event.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    if (topLevelType === topLevelTypes.topMouseOver &&
        (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
      return null;
    }
    if (topLevelType !== topLevelTypes.topMouseOut &&
        topLevelType !== topLevelTypes.topMouseOver) {
      // Must not be a mouse in or mouse out - ignoring.
      return null;
    }

    var win;
    if (topLevelTarget.window === topLevelTarget) {
      // `topLevelTarget` is probably a window object.
      win = topLevelTarget;
    } else {
      // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
      var doc = topLevelTarget.ownerDocument;
      if (doc) {
        win = doc.defaultView || doc.parentWindow;
      } else {
        win = window;
      }
    }

    var from, to;
    if (topLevelType === topLevelTypes.topMouseOut) {
      from = topLevelTarget;
      to =
        getFirstReactDOM(nativeEvent.relatedTarget || nativeEvent.toElement) ||
        win;
    } else {
      from = win;
      to = topLevelTarget;
    }

    if (from === to) {
      // Nothing pertains to our managed components.
      return null;
    }

    var fromID = from ? ReactMount.getID(from) : '';
    var toID = to ? ReactMount.getID(to) : '';

    var leave = SyntheticMouseEvent.getPooled(
      eventTypes.mouseLeave,
      fromID,
      nativeEvent
    );
    leave.type = 'mouseleave';
    leave.target = from;
    leave.relatedTarget = to;

    var enter = SyntheticMouseEvent.getPooled(
      eventTypes.mouseEnter,
      toID,
      nativeEvent
    );
    enter.type = 'mouseenter';
    enter.target = to;
    enter.relatedTarget = from;

    EventPropagators.accumulateEnterLeaveDispatches(leave, enter, fromID, toID);

    extractedEvents[0] = leave;
    extractedEvents[1] = enter;

    return extractedEvents;
  }

};

module.exports = EnterLeaveEventPlugin;

},{"./EventConstants":19,"./EventPropagators":24,"./ReactMount":65,"./SyntheticMouseEvent":92,"./keyOf":131}],19:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventConstants
 */

"use strict";

var keyMirror = require("./keyMirror");

var PropagationPhases = keyMirror({bubbled: null, captured: null});

/**
 * Types of raw signals from the browser caught at the top level.
 */
var topLevelTypes = keyMirror({
  topBlur: null,
  topChange: null,
  topClick: null,
  topCompositionEnd: null,
  topCompositionStart: null,
  topCompositionUpdate: null,
  topContextMenu: null,
  topCopy: null,
  topCut: null,
  topDoubleClick: null,
  topDrag: null,
  topDragEnd: null,
  topDragEnter: null,
  topDragExit: null,
  topDragLeave: null,
  topDragOver: null,
  topDragStart: null,
  topDrop: null,
  topError: null,
  topFocus: null,
  topInput: null,
  topKeyDown: null,
  topKeyPress: null,
  topKeyUp: null,
  topLoad: null,
  topMouseDown: null,
  topMouseMove: null,
  topMouseOut: null,
  topMouseOver: null,
  topMouseUp: null,
  topPaste: null,
  topReset: null,
  topScroll: null,
  topSelectionChange: null,
  topSubmit: null,
  topTextInput: null,
  topTouchCancel: null,
  topTouchEnd: null,
  topTouchMove: null,
  topTouchStart: null,
  topWheel: null
});

var EventConstants = {
  topLevelTypes: topLevelTypes,
  PropagationPhases: PropagationPhases
};

module.exports = EventConstants;

},{"./keyMirror":130}],20:[function(require,module,exports){
(function (process){
/**
 * @providesModule EventListener
 * @typechecks
 */

var emptyFunction = require("./emptyFunction");

/**
 * Upstream version of event listener. Does not take into account specific
 * nature of platform.
 */
var EventListener = {
  /**
   * Listen to DOM events during the bubble phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
  listen: function(target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, false);
      return {
        remove: function() {
          target.removeEventListener(eventType, callback, false);
        }
      };
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback);
      return {
        remove: function() {
          target.detachEvent('on' + eventType, callback);
        }
      };
    }
  },

  /**
   * Listen to DOM events during the capture phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
  capture: function(target, eventType, callback) {
    if (!target.addEventListener) {
      if ("production" !== process.env.NODE_ENV) {
        console.error(
          'Attempted to listen to events during the capture phase on a ' +
          'browser that does not support the capture phase. Your application ' +
          'will not receive some events.'
        );
      }
      return {
        remove: emptyFunction
      };
    } else {
      target.addEventListener(eventType, callback, true);
      return {
        remove: function() {
          target.removeEventListener(eventType, callback, true);
        }
      };
    }
  },

  registerDefault: function() {}
};

module.exports = EventListener;

}).call(this,require('_process'))
},{"./emptyFunction":106,"_process":3}],21:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPluginHub
 */

"use strict";

var EventPluginRegistry = require("./EventPluginRegistry");
var EventPluginUtils = require("./EventPluginUtils");

var accumulate = require("./accumulate");
var forEachAccumulated = require("./forEachAccumulated");
var invariant = require("./invariant");
var isEventSupported = require("./isEventSupported");
var monitorCodeUse = require("./monitorCodeUse");

/**
 * Internal store for event listeners
 */
var listenerBank = {};

/**
 * Internal queue of events that have accumulated their dispatches and are
 * waiting to have their dispatches executed.
 */
var eventQueue = null;

/**
 * Dispatches an event and releases it back into the pool, unless persistent.
 *
 * @param {?object} event Synthetic event to be dispatched.
 * @private
 */
var executeDispatchesAndRelease = function(event) {
  if (event) {
    var executeDispatch = EventPluginUtils.executeDispatch;
    // Plugins can provide custom behavior when dispatching events.
    var PluginModule = EventPluginRegistry.getPluginModuleForEvent(event);
    if (PluginModule && PluginModule.executeDispatch) {
      executeDispatch = PluginModule.executeDispatch;
    }
    EventPluginUtils.executeDispatchesInOrder(event, executeDispatch);

    if (!event.isPersistent()) {
      event.constructor.release(event);
    }
  }
};

/**
 * - `InstanceHandle`: [required] Module that performs logical traversals of DOM
 *   hierarchy given ids of the logical DOM elements involved.
 */
var InstanceHandle = null;

function validateInstanceHandle() {
  var invalid = !InstanceHandle||
    !InstanceHandle.traverseTwoPhase ||
    !InstanceHandle.traverseEnterLeave;
  if (invalid) {
    throw new Error('InstanceHandle not injected before use!');
  }
}

/**
 * This is a unified interface for event plugins to be installed and configured.
 *
 * Event plugins can implement the following properties:
 *
 *   `extractEvents` {function(string, DOMEventTarget, string, object): *}
 *     Required. When a top-level event is fired, this method is expected to
 *     extract synthetic events that will in turn be queued and dispatched.
 *
 *   `eventTypes` {object}
 *     Optional, plugins that fire events must publish a mapping of registration
 *     names that are used to register listeners. Values of this mapping must
 *     be objects that contain `registrationName` or `phasedRegistrationNames`.
 *
 *   `executeDispatch` {function(object, function, string)}
 *     Optional, allows plugins to override how an event gets dispatched. By
 *     default, the listener is simply invoked.
 *
 * Each plugin that is injected into `EventsPluginHub` is immediately operable.
 *
 * @public
 */
var EventPluginHub = {

  /**
   * Methods for injecting dependencies.
   */
  injection: {

    /**
     * @param {object} InjectedMount
     * @public
     */
    injectMount: EventPluginUtils.injection.injectMount,

    /**
     * @param {object} InjectedInstanceHandle
     * @public
     */
    injectInstanceHandle: function(InjectedInstanceHandle) {
      InstanceHandle = InjectedInstanceHandle;
      if ("production" !== process.env.NODE_ENV) {
        validateInstanceHandle();
      }
    },

    getInstanceHandle: function() {
      if ("production" !== process.env.NODE_ENV) {
        validateInstanceHandle();
      }
      return InstanceHandle;
    },

    /**
     * @param {array} InjectedEventPluginOrder
     * @public
     */
    injectEventPluginOrder: EventPluginRegistry.injectEventPluginOrder,

    /**
     * @param {object} injectedNamesToPlugins Map from names to plugin modules.
     */
    injectEventPluginsByName: EventPluginRegistry.injectEventPluginsByName

  },

  eventNameDispatchConfigs: EventPluginRegistry.eventNameDispatchConfigs,

  registrationNameModules: EventPluginRegistry.registrationNameModules,

  /**
   * Stores `listener` at `listenerBank[registrationName][id]`. Is idempotent.
   *
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {?function} listener The callback to store.
   */
  putListener: function(id, registrationName, listener) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !listener || typeof listener === 'function',
      'Expected %s listener to be a function, instead got type %s',
      registrationName, typeof listener
    ) : invariant(!listener || typeof listener === 'function'));

    if ("production" !== process.env.NODE_ENV) {
      // IE8 has no API for event capturing and the `onScroll` event doesn't
      // bubble.
      if (registrationName === 'onScroll' &&
          !isEventSupported('scroll', true)) {
        monitorCodeUse('react_no_scroll_event');
        console.warn('This browser doesn\'t support the `onScroll` event');
      }
    }
    var bankForRegistrationName =
      listenerBank[registrationName] || (listenerBank[registrationName] = {});
    bankForRegistrationName[id] = listener;
  },

  /**
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @return {?function} The stored callback.
   */
  getListener: function(id, registrationName) {
    var bankForRegistrationName = listenerBank[registrationName];
    return bankForRegistrationName && bankForRegistrationName[id];
  },

  /**
   * Deletes a listener from the registration bank.
   *
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   */
  deleteListener: function(id, registrationName) {
    var bankForRegistrationName = listenerBank[registrationName];
    if (bankForRegistrationName) {
      delete bankForRegistrationName[id];
    }
  },

  /**
   * Deletes all listeners for the DOM element with the supplied ID.
   *
   * @param {string} id ID of the DOM element.
   */
  deleteAllListeners: function(id) {
    for (var registrationName in listenerBank) {
      delete listenerBank[registrationName][id];
    }
  },

  /**
   * Allows registered plugins an opportunity to extract events from top-level
   * native browser events.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @internal
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var events;
    var plugins = EventPluginRegistry.plugins;
    for (var i = 0, l = plugins.length; i < l; i++) {
      // Not every plugin in the ordering may be loaded at runtime.
      var possiblePlugin = plugins[i];
      if (possiblePlugin) {
        var extractedEvents = possiblePlugin.extractEvents(
          topLevelType,
          topLevelTarget,
          topLevelTargetID,
          nativeEvent
        );
        if (extractedEvents) {
          events = accumulate(events, extractedEvents);
        }
      }
    }
    return events;
  },

  /**
   * Enqueues a synthetic event that should be dispatched when
   * `processEventQueue` is invoked.
   *
   * @param {*} events An accumulation of synthetic events.
   * @internal
   */
  enqueueEvents: function(events) {
    if (events) {
      eventQueue = accumulate(eventQueue, events);
    }
  },

  /**
   * Dispatches all synthetic events on the event queue.
   *
   * @internal
   */
  processEventQueue: function() {
    // Set `eventQueue` to null before processing it so that we can tell if more
    // events get enqueued while processing.
    var processingEventQueue = eventQueue;
    eventQueue = null;
    forEachAccumulated(processingEventQueue, executeDispatchesAndRelease);
    ("production" !== process.env.NODE_ENV ? invariant(
      !eventQueue,
      'processEventQueue(): Additional events were enqueued while processing ' +
      'an event queue. Support for this has not yet been implemented.'
    ) : invariant(!eventQueue));
  },

  /**
   * These are needed for tests only. Do not use!
   */
  __purge: function() {
    listenerBank = {};
  },

  __getListenerBank: function() {
    return listenerBank;
  }

};

module.exports = EventPluginHub;

}).call(this,require('_process'))
},{"./EventPluginRegistry":22,"./EventPluginUtils":23,"./accumulate":98,"./forEachAccumulated":111,"./invariant":124,"./isEventSupported":125,"./monitorCodeUse":138,"_process":3}],22:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPluginRegistry
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

/**
 * Injectable ordering of event plugins.
 */
var EventPluginOrder = null;

/**
 * Injectable mapping from names to event plugin modules.
 */
var namesToPlugins = {};

/**
 * Recomputes the plugin list using the injected plugins and plugin ordering.
 *
 * @private
 */
function recomputePluginOrdering() {
  if (!EventPluginOrder) {
    // Wait until an `EventPluginOrder` is injected.
    return;
  }
  for (var pluginName in namesToPlugins) {
    var PluginModule = namesToPlugins[pluginName];
    var pluginIndex = EventPluginOrder.indexOf(pluginName);
    ("production" !== process.env.NODE_ENV ? invariant(
      pluginIndex > -1,
      'EventPluginRegistry: Cannot inject event plugins that do not exist in ' +
      'the plugin ordering, `%s`.',
      pluginName
    ) : invariant(pluginIndex > -1));
    if (EventPluginRegistry.plugins[pluginIndex]) {
      continue;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      PluginModule.extractEvents,
      'EventPluginRegistry: Event plugins must implement an `extractEvents` ' +
      'method, but `%s` does not.',
      pluginName
    ) : invariant(PluginModule.extractEvents));
    EventPluginRegistry.plugins[pluginIndex] = PluginModule;
    var publishedEvents = PluginModule.eventTypes;
    for (var eventName in publishedEvents) {
      ("production" !== process.env.NODE_ENV ? invariant(
        publishEventForPlugin(
          publishedEvents[eventName],
          PluginModule,
          eventName
        ),
        'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.',
        eventName,
        pluginName
      ) : invariant(publishEventForPlugin(
        publishedEvents[eventName],
        PluginModule,
        eventName
      )));
    }
  }
}

/**
 * Publishes an event so that it can be dispatched by the supplied plugin.
 *
 * @param {object} dispatchConfig Dispatch configuration for the event.
 * @param {object} PluginModule Plugin publishing the event.
 * @return {boolean} True if the event was successfully published.
 * @private
 */
function publishEventForPlugin(dispatchConfig, PluginModule, eventName) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName),
    'EventPluginHub: More than one plugin attempted to publish the same ' +
    'event name, `%s`.',
    eventName
  ) : invariant(!EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName)));
  EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;

  var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
  if (phasedRegistrationNames) {
    for (var phaseName in phasedRegistrationNames) {
      if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
        var phasedRegistrationName = phasedRegistrationNames[phaseName];
        publishRegistrationName(
          phasedRegistrationName,
          PluginModule,
          eventName
        );
      }
    }
    return true;
  } else if (dispatchConfig.registrationName) {
    publishRegistrationName(
      dispatchConfig.registrationName,
      PluginModule,
      eventName
    );
    return true;
  }
  return false;
}

/**
 * Publishes a registration name that is used to identify dispatched events and
 * can be used with `EventPluginHub.putListener` to register listeners.
 *
 * @param {string} registrationName Registration name to add.
 * @param {object} PluginModule Plugin publishing the event.
 * @private
 */
function publishRegistrationName(registrationName, PluginModule, eventName) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !EventPluginRegistry.registrationNameModules[registrationName],
    'EventPluginHub: More than one plugin attempted to publish the same ' +
    'registration name, `%s`.',
    registrationName
  ) : invariant(!EventPluginRegistry.registrationNameModules[registrationName]));
  EventPluginRegistry.registrationNameModules[registrationName] = PluginModule;
  EventPluginRegistry.registrationNameDependencies[registrationName] =
    PluginModule.eventTypes[eventName].dependencies;
}

/**
 * Registers plugins so that they can extract and dispatch events.
 *
 * @see {EventPluginHub}
 */
var EventPluginRegistry = {

  /**
   * Ordered list of injected plugins.
   */
  plugins: [],

  /**
   * Mapping from event name to dispatch config
   */
  eventNameDispatchConfigs: {},

  /**
   * Mapping from registration name to plugin module
   */
  registrationNameModules: {},

  /**
   * Mapping from registration name to event name
   */
  registrationNameDependencies: {},

  /**
   * Injects an ordering of plugins (by plugin name). This allows the ordering
   * to be decoupled from injection of the actual plugins so that ordering is
   * always deterministic regardless of packaging, on-the-fly injection, etc.
   *
   * @param {array} InjectedEventPluginOrder
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginOrder}
   */
  injectEventPluginOrder: function(InjectedEventPluginOrder) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !EventPluginOrder,
      'EventPluginRegistry: Cannot inject event plugin ordering more than ' +
      'once. You are likely trying to load more than one copy of React.'
    ) : invariant(!EventPluginOrder));
    // Clone the ordering so it cannot be dynamically mutated.
    EventPluginOrder = Array.prototype.slice.call(InjectedEventPluginOrder);
    recomputePluginOrdering();
  },

  /**
   * Injects plugins to be used by `EventPluginHub`. The plugin names must be
   * in the ordering injected by `injectEventPluginOrder`.
   *
   * Plugins can be injected as part of page initialization or on-the-fly.
   *
   * @param {object} injectedNamesToPlugins Map from names to plugin modules.
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginsByName}
   */
  injectEventPluginsByName: function(injectedNamesToPlugins) {
    var isOrderingDirty = false;
    for (var pluginName in injectedNamesToPlugins) {
      if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
        continue;
      }
      var PluginModule = injectedNamesToPlugins[pluginName];
      if (!namesToPlugins.hasOwnProperty(pluginName) ||
          namesToPlugins[pluginName] !== PluginModule) {
        ("production" !== process.env.NODE_ENV ? invariant(
          !namesToPlugins[pluginName],
          'EventPluginRegistry: Cannot inject two different event plugins ' +
          'using the same name, `%s`.',
          pluginName
        ) : invariant(!namesToPlugins[pluginName]));
        namesToPlugins[pluginName] = PluginModule;
        isOrderingDirty = true;
      }
    }
    if (isOrderingDirty) {
      recomputePluginOrdering();
    }
  },

  /**
   * Looks up the plugin for the supplied event.
   *
   * @param {object} event A synthetic event.
   * @return {?object} The plugin that created the supplied event.
   * @internal
   */
  getPluginModuleForEvent: function(event) {
    var dispatchConfig = event.dispatchConfig;
    if (dispatchConfig.registrationName) {
      return EventPluginRegistry.registrationNameModules[
        dispatchConfig.registrationName
      ] || null;
    }
    for (var phase in dispatchConfig.phasedRegistrationNames) {
      if (!dispatchConfig.phasedRegistrationNames.hasOwnProperty(phase)) {
        continue;
      }
      var PluginModule = EventPluginRegistry.registrationNameModules[
        dispatchConfig.phasedRegistrationNames[phase]
      ];
      if (PluginModule) {
        return PluginModule;
      }
    }
    return null;
  },

  /**
   * Exposed for unit testing.
   * @private
   */
  _resetEventPlugins: function() {
    EventPluginOrder = null;
    for (var pluginName in namesToPlugins) {
      if (namesToPlugins.hasOwnProperty(pluginName)) {
        delete namesToPlugins[pluginName];
      }
    }
    EventPluginRegistry.plugins.length = 0;

    var eventNameDispatchConfigs = EventPluginRegistry.eventNameDispatchConfigs;
    for (var eventName in eventNameDispatchConfigs) {
      if (eventNameDispatchConfigs.hasOwnProperty(eventName)) {
        delete eventNameDispatchConfigs[eventName];
      }
    }

    var registrationNameModules = EventPluginRegistry.registrationNameModules;
    for (var registrationName in registrationNameModules) {
      if (registrationNameModules.hasOwnProperty(registrationName)) {
        delete registrationNameModules[registrationName];
      }
    }
  }

};

module.exports = EventPluginRegistry;

}).call(this,require('_process'))
},{"./invariant":124,"_process":3}],23:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPluginUtils
 */

"use strict";

var EventConstants = require("./EventConstants");

var invariant = require("./invariant");

/**
 * Injected dependencies:
 */

/**
 * - `Mount`: [required] Module that can convert between React dom IDs and
 *   actual node references.
 */
var injection = {
  Mount: null,
  injectMount: function(InjectedMount) {
    injection.Mount = InjectedMount;
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? invariant(
        InjectedMount && InjectedMount.getNode,
        'EventPluginUtils.injection.injectMount(...): Injected Mount module ' +
        'is missing getNode.'
      ) : invariant(InjectedMount && InjectedMount.getNode));
    }
  }
};

var topLevelTypes = EventConstants.topLevelTypes;

function isEndish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseUp ||
         topLevelType === topLevelTypes.topTouchEnd ||
         topLevelType === topLevelTypes.topTouchCancel;
}

function isMoveish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseMove ||
         topLevelType === topLevelTypes.topTouchMove;
}
function isStartish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseDown ||
         topLevelType === topLevelTypes.topTouchStart;
}


var validateEventDispatches;
if ("production" !== process.env.NODE_ENV) {
  validateEventDispatches = function(event) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchIDs = event._dispatchIDs;

    var listenersIsArr = Array.isArray(dispatchListeners);
    var idsIsArr = Array.isArray(dispatchIDs);
    var IDsLen = idsIsArr ? dispatchIDs.length : dispatchIDs ? 1 : 0;
    var listenersLen = listenersIsArr ?
      dispatchListeners.length :
      dispatchListeners ? 1 : 0;

    ("production" !== process.env.NODE_ENV ? invariant(
      idsIsArr === listenersIsArr && IDsLen === listenersLen,
      'EventPluginUtils: Invalid `event`.'
    ) : invariant(idsIsArr === listenersIsArr && IDsLen === listenersLen));
  };
}

/**
 * Invokes `cb(event, listener, id)`. Avoids using call if no scope is
 * provided. The `(listener,id)` pair effectively forms the "dispatch" but are
 * kept separate to conserve memory.
 */
function forEachEventDispatch(event, cb) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchIDs = event._dispatchIDs;
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and IDs are two parallel arrays that are always in sync.
      cb(event, dispatchListeners[i], dispatchIDs[i]);
    }
  } else if (dispatchListeners) {
    cb(event, dispatchListeners, dispatchIDs);
  }
}

/**
 * Default implementation of PluginModule.executeDispatch().
 * @param {SyntheticEvent} SyntheticEvent to handle
 * @param {function} Application-level callback
 * @param {string} domID DOM id to pass to the callback.
 */
function executeDispatch(event, listener, domID) {
  event.currentTarget = injection.Mount.getNode(domID);
  var returnValue = listener(event, domID);
  event.currentTarget = null;
  return returnValue;
}

/**
 * Standard/simple iteration through an event's collected dispatches.
 */
function executeDispatchesInOrder(event, executeDispatch) {
  forEachEventDispatch(event, executeDispatch);
  event._dispatchListeners = null;
  event._dispatchIDs = null;
}

/**
 * Standard/simple iteration through an event's collected dispatches, but stops
 * at the first dispatch execution returning true, and returns that id.
 *
 * @return id of the first dispatch execution who's listener returns true, or
 * null if no listener returned true.
 */
function executeDispatchesInOrderStopAtTrueImpl(event) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchIDs = event._dispatchIDs;
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and IDs are two parallel arrays that are always in sync.
      if (dispatchListeners[i](event, dispatchIDs[i])) {
        return dispatchIDs[i];
      }
    }
  } else if (dispatchListeners) {
    if (dispatchListeners(event, dispatchIDs)) {
      return dispatchIDs;
    }
  }
  return null;
}

/**
 * @see executeDispatchesInOrderStopAtTrueImpl
 */
function executeDispatchesInOrderStopAtTrue(event) {
  var ret = executeDispatchesInOrderStopAtTrueImpl(event);
  event._dispatchIDs = null;
  event._dispatchListeners = null;
  return ret;
}

/**
 * Execution of a "direct" dispatch - there must be at most one dispatch
 * accumulated on the event or it is considered an error. It doesn't really make
 * sense for an event with multiple dispatches (bubbled) to keep track of the
 * return values at each dispatch execution, but it does tend to make sense when
 * dealing with "direct" dispatches.
 *
 * @return The return value of executing the single dispatch.
 */
function executeDirectDispatch(event) {
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  var dispatchListener = event._dispatchListeners;
  var dispatchID = event._dispatchIDs;
  ("production" !== process.env.NODE_ENV ? invariant(
    !Array.isArray(dispatchListener),
    'executeDirectDispatch(...): Invalid `event`.'
  ) : invariant(!Array.isArray(dispatchListener)));
  var res = dispatchListener ?
    dispatchListener(event, dispatchID) :
    null;
  event._dispatchListeners = null;
  event._dispatchIDs = null;
  return res;
}

/**
 * @param {SyntheticEvent} event
 * @return {bool} True iff number of dispatches accumulated is greater than 0.
 */
function hasDispatches(event) {
  return !!event._dispatchListeners;
}

/**
 * General utilities that are useful in creating custom Event Plugins.
 */
var EventPluginUtils = {
  isEndish: isEndish,
  isMoveish: isMoveish,
  isStartish: isStartish,

  executeDirectDispatch: executeDirectDispatch,
  executeDispatch: executeDispatch,
  executeDispatchesInOrder: executeDispatchesInOrder,
  executeDispatchesInOrderStopAtTrue: executeDispatchesInOrderStopAtTrue,
  hasDispatches: hasDispatches,
  injection: injection,
  useTouchEvents: false
};

module.exports = EventPluginUtils;

}).call(this,require('_process'))
},{"./EventConstants":19,"./invariant":124,"_process":3}],24:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPropagators
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");

var accumulate = require("./accumulate");
var forEachAccumulated = require("./forEachAccumulated");

var PropagationPhases = EventConstants.PropagationPhases;
var getListener = EventPluginHub.getListener;

/**
 * Some event types have a notion of different registration names for different
 * "phases" of propagation. This finds listeners by a given phase.
 */
function listenerAtPhase(id, event, propagationPhase) {
  var registrationName =
    event.dispatchConfig.phasedRegistrationNames[propagationPhase];
  return getListener(id, registrationName);
}

/**
 * Tags a `SyntheticEvent` with dispatched listeners. Creating this function
 * here, allows us to not have to bind or create functions for each event.
 * Mutating the event's members allows us to not have to create a wrapping
 * "dispatch" object that pairs the event with the listener.
 */
function accumulateDirectionalDispatches(domID, upwards, event) {
  if ("production" !== process.env.NODE_ENV) {
    if (!domID) {
      throw new Error('Dispatching id must not be null');
    }
  }
  var phase = upwards ? PropagationPhases.bubbled : PropagationPhases.captured;
  var listener = listenerAtPhase(domID, event, phase);
  if (listener) {
    event._dispatchListeners = accumulate(event._dispatchListeners, listener);
    event._dispatchIDs = accumulate(event._dispatchIDs, domID);
  }
}

/**
 * Collect dispatches (must be entirely collected before dispatching - see unit
 * tests). Lazily allocate the array to conserve memory.  We must loop through
 * each event and perform the traversal for each one. We can not perform a
 * single traversal for the entire collection of events because each event may
 * have a different target.
 */
function accumulateTwoPhaseDispatchesSingle(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    EventPluginHub.injection.getInstanceHandle().traverseTwoPhase(
      event.dispatchMarker,
      accumulateDirectionalDispatches,
      event
    );
  }
}


/**
 * Accumulates without regard to direction, does not look for phased
 * registration names. Same as `accumulateDirectDispatchesSingle` but without
 * requiring that the `dispatchMarker` be the same as the dispatched ID.
 */
function accumulateDispatches(id, ignoredDirection, event) {
  if (event && event.dispatchConfig.registrationName) {
    var registrationName = event.dispatchConfig.registrationName;
    var listener = getListener(id, registrationName);
    if (listener) {
      event._dispatchListeners = accumulate(event._dispatchListeners, listener);
      event._dispatchIDs = accumulate(event._dispatchIDs, id);
    }
  }
}

/**
 * Accumulates dispatches on an `SyntheticEvent`, but only for the
 * `dispatchMarker`.
 * @param {SyntheticEvent} event
 */
function accumulateDirectDispatchesSingle(event) {
  if (event && event.dispatchConfig.registrationName) {
    accumulateDispatches(event.dispatchMarker, null, event);
  }
}

function accumulateTwoPhaseDispatches(events) {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
}

function accumulateEnterLeaveDispatches(leave, enter, fromID, toID) {
  EventPluginHub.injection.getInstanceHandle().traverseEnterLeave(
    fromID,
    toID,
    accumulateDispatches,
    leave,
    enter
  );
}


function accumulateDirectDispatches(events) {
  forEachAccumulated(events, accumulateDirectDispatchesSingle);
}



/**
 * A small set of propagation patterns, each of which will accept a small amount
 * of information, and generate a set of "dispatch ready event objects" - which
 * are sets of events that have already been annotated with a set of dispatched
 * listener functions/ids. The API is designed this way to discourage these
 * propagation strategies from actually executing the dispatches, since we
 * always want to collect the entire set of dispatches before executing event a
 * single one.
 *
 * @constructor EventPropagators
 */
var EventPropagators = {
  accumulateTwoPhaseDispatches: accumulateTwoPhaseDispatches,
  accumulateDirectDispatches: accumulateDirectDispatches,
  accumulateEnterLeaveDispatches: accumulateEnterLeaveDispatches
};

module.exports = EventPropagators;

}).call(this,require('_process'))
},{"./EventConstants":19,"./EventPluginHub":21,"./accumulate":98,"./forEachAccumulated":111,"_process":3}],25:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ExecutionEnvironment
 */

/*jslint evil: true */

"use strict";

var canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
var ExecutionEnvironment = {

  canUseDOM: canUseDOM,

  canUseWorkers: typeof Worker !== 'undefined',

  canUseEventListeners:
    canUseDOM && !!(window.addEventListener || window.attachEvent),

  canUseViewport: canUseDOM && !!window.screen,

  isInWorker: !canUseDOM // For now, this is true - might change in the future.

};

module.exports = ExecutionEnvironment;

},{}],26:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule HTMLDOMPropertyConfig
 */

/*jslint bitwise: true*/

"use strict";

var DOMProperty = require("./DOMProperty");
var ExecutionEnvironment = require("./ExecutionEnvironment");

var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;
var MUST_USE_PROPERTY = DOMProperty.injection.MUST_USE_PROPERTY;
var HAS_BOOLEAN_VALUE = DOMProperty.injection.HAS_BOOLEAN_VALUE;
var HAS_SIDE_EFFECTS = DOMProperty.injection.HAS_SIDE_EFFECTS;
var HAS_NUMERIC_VALUE = DOMProperty.injection.HAS_NUMERIC_VALUE;
var HAS_POSITIVE_NUMERIC_VALUE =
  DOMProperty.injection.HAS_POSITIVE_NUMERIC_VALUE;
var HAS_OVERLOADED_BOOLEAN_VALUE =
  DOMProperty.injection.HAS_OVERLOADED_BOOLEAN_VALUE;

var hasSVG;
if (ExecutionEnvironment.canUseDOM) {
  var implementation = document.implementation;
  hasSVG = (
    implementation &&
    implementation.hasFeature &&
    implementation.hasFeature(
      'http://www.w3.org/TR/SVG11/feature#BasicStructure',
      '1.1'
    )
  );
}


var HTMLDOMPropertyConfig = {
  isCustomAttribute: RegExp.prototype.test.bind(
    /^(data|aria)-[a-z_][a-z\d_.\-]*$/
  ),
  Properties: {
    /**
     * Standard Properties
     */
    accept: null,
    accessKey: null,
    action: null,
    allowFullScreen: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    allowTransparency: MUST_USE_ATTRIBUTE,
    alt: null,
    async: HAS_BOOLEAN_VALUE,
    autoComplete: null,
    // autoFocus is polyfilled/normalized by AutoFocusMixin
    // autoFocus: HAS_BOOLEAN_VALUE,
    autoPlay: HAS_BOOLEAN_VALUE,
    cellPadding: null,
    cellSpacing: null,
    charSet: MUST_USE_ATTRIBUTE,
    checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    // To set className on SVG elements, it's necessary to use .setAttribute;
    // this works on HTML elements too in all browsers except IE8. Conveniently,
    // IE8 doesn't support SVG and so we can simply use the attribute in
    // browsers that support SVG and the property in browsers that don't,
    // regardless of whether the element is HTML or SVG.
    className: hasSVG ? MUST_USE_ATTRIBUTE : MUST_USE_PROPERTY,
    cols: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    colSpan: null,
    content: null,
    contentEditable: null,
    contextMenu: MUST_USE_ATTRIBUTE,
    controls: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    coords: null,
    crossOrigin: null,
    data: null, // For `<object />` acts as `src`.
    dateTime: MUST_USE_ATTRIBUTE,
    defer: HAS_BOOLEAN_VALUE,
    dir: null,
    disabled: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    download: HAS_OVERLOADED_BOOLEAN_VALUE,
    draggable: null,
    encType: null,
    form: MUST_USE_ATTRIBUTE,
    formNoValidate: HAS_BOOLEAN_VALUE,
    frameBorder: MUST_USE_ATTRIBUTE,
    height: MUST_USE_ATTRIBUTE,
    hidden: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    href: null,
    hrefLang: null,
    htmlFor: null,
    httpEquiv: null,
    icon: null,
    id: MUST_USE_PROPERTY,
    label: null,
    lang: null,
    list: null,
    loop: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    max: null,
    maxLength: MUST_USE_ATTRIBUTE,
    media: MUST_USE_ATTRIBUTE,
    mediaGroup: null,
    method: null,
    min: null,
    multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    name: null,
    noValidate: HAS_BOOLEAN_VALUE,
    open: null,
    pattern: null,
    placeholder: null,
    poster: null,
    preload: null,
    radioGroup: null,
    readOnly: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    rel: null,
    required: HAS_BOOLEAN_VALUE,
    role: MUST_USE_ATTRIBUTE,
    rows: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    rowSpan: null,
    sandbox: null,
    scope: null,
    scrollLeft: MUST_USE_PROPERTY,
    scrolling: null,
    scrollTop: MUST_USE_PROPERTY,
    seamless: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    shape: null,
    size: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    sizes: MUST_USE_ATTRIBUTE,
    span: HAS_POSITIVE_NUMERIC_VALUE,
    spellCheck: null,
    src: null,
    srcDoc: MUST_USE_PROPERTY,
    srcSet: MUST_USE_ATTRIBUTE,
    start: HAS_NUMERIC_VALUE,
    step: null,
    style: null,
    tabIndex: null,
    target: null,
    title: null,
    type: null,
    useMap: null,
    value: MUST_USE_PROPERTY | HAS_SIDE_EFFECTS,
    width: MUST_USE_ATTRIBUTE,
    wmode: MUST_USE_ATTRIBUTE,

    /**
     * Non-standard Properties
     */
    autoCapitalize: null, // Supported in Mobile Safari for keyboard hints
    autoCorrect: null, // Supported in Mobile Safari for keyboard hints
    itemProp: MUST_USE_ATTRIBUTE, // Microdata: http://schema.org/docs/gs.html
    itemScope: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE, // Microdata: http://schema.org/docs/gs.html
    itemType: MUST_USE_ATTRIBUTE, // Microdata: http://schema.org/docs/gs.html
    property: null // Supports OG in meta tags
  },
  DOMAttributeNames: {
    className: 'class',
    htmlFor: 'for',
    httpEquiv: 'http-equiv'
  },
  DOMPropertyNames: {
    autoCapitalize: 'autocapitalize',
    autoComplete: 'autocomplete',
    autoCorrect: 'autocorrect',
    autoFocus: 'autofocus',
    autoPlay: 'autoplay',
    encType: 'enctype',
    hrefLang: 'hreflang',
    radioGroup: 'radiogroup',
    spellCheck: 'spellcheck',
    srcDoc: 'srcdoc',
    srcSet: 'srcset'
  }
};

module.exports = HTMLDOMPropertyConfig;

},{"./DOMProperty":14,"./ExecutionEnvironment":25}],27:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule LinkedValueUtils
 * @typechecks static-only
 */

"use strict";

var ReactPropTypes = require("./ReactPropTypes");

var invariant = require("./invariant");

var hasReadOnlyValue = {
  'button': true,
  'checkbox': true,
  'image': true,
  'hidden': true,
  'radio': true,
  'reset': true,
  'submit': true
};

function _assertSingleLink(input) {
  ("production" !== process.env.NODE_ENV ? invariant(
    input.props.checkedLink == null || input.props.valueLink == null,
    'Cannot provide a checkedLink and a valueLink. If you want to use ' +
    'checkedLink, you probably don\'t want to use valueLink and vice versa.'
  ) : invariant(input.props.checkedLink == null || input.props.valueLink == null));
}
function _assertValueLink(input) {
  _assertSingleLink(input);
  ("production" !== process.env.NODE_ENV ? invariant(
    input.props.value == null && input.props.onChange == null,
    'Cannot provide a valueLink and a value or onChange event. If you want ' +
    'to use value or onChange, you probably don\'t want to use valueLink.'
  ) : invariant(input.props.value == null && input.props.onChange == null));
}

function _assertCheckedLink(input) {
  _assertSingleLink(input);
  ("production" !== process.env.NODE_ENV ? invariant(
    input.props.checked == null && input.props.onChange == null,
    'Cannot provide a checkedLink and a checked property or onChange event. ' +
    'If you want to use checked or onChange, you probably don\'t want to ' +
    'use checkedLink'
  ) : invariant(input.props.checked == null && input.props.onChange == null));
}

/**
 * @param {SyntheticEvent} e change event to handle
 */
function _handleLinkedValueChange(e) {
  /*jshint validthis:true */
  this.props.valueLink.requestChange(e.target.value);
}

/**
  * @param {SyntheticEvent} e change event to handle
  */
function _handleLinkedCheckChange(e) {
  /*jshint validthis:true */
  this.props.checkedLink.requestChange(e.target.checked);
}

/**
 * Provide a linked `value` attribute for controlled forms. You should not use
 * this outside of the ReactDOM controlled form components.
 */
var LinkedValueUtils = {
  Mixin: {
    propTypes: {
      value: function(props, propName, componentName) {
        if (!props[propName] ||
            hasReadOnlyValue[props.type] ||
            props.onChange ||
            props.readOnly ||
            props.disabled) {
          return;
        }
        return new Error(
          'You provided a `value` prop to a form field without an ' +
          '`onChange` handler. This will render a read-only field. If ' +
          'the field should be mutable use `defaultValue`. Otherwise, ' +
          'set either `onChange` or `readOnly`.'
        );
      },
      checked: function(props, propName, componentName) {
        if (!props[propName] ||
            props.onChange ||
            props.readOnly ||
            props.disabled) {
          return;
        }
        return new Error(
          'You provided a `checked` prop to a form field without an ' +
          '`onChange` handler. This will render a read-only field. If ' +
          'the field should be mutable use `defaultChecked`. Otherwise, ' +
          'set either `onChange` or `readOnly`.'
        );
      },
      onChange: ReactPropTypes.func
    }
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {*} current value of the input either from value prop or link.
   */
  getValue: function(input) {
    if (input.props.valueLink) {
      _assertValueLink(input);
      return input.props.valueLink.value;
    }
    return input.props.value;
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {*} current checked status of the input either from checked prop
   *             or link.
   */
  getChecked: function(input) {
    if (input.props.checkedLink) {
      _assertCheckedLink(input);
      return input.props.checkedLink.value;
    }
    return input.props.checked;
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {function} change callback either from onChange prop or link.
   */
  getOnChange: function(input) {
    if (input.props.valueLink) {
      _assertValueLink(input);
      return _handleLinkedValueChange;
    } else if (input.props.checkedLink) {
      _assertCheckedLink(input);
      return _handleLinkedCheckChange;
    }
    return input.props.onChange;
  }
};

module.exports = LinkedValueUtils;

}).call(this,require('_process'))
},{"./ReactPropTypes":73,"./invariant":124,"_process":3}],28:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule LocalEventTrapMixin
 */

"use strict";

var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");

var accumulate = require("./accumulate");
var forEachAccumulated = require("./forEachAccumulated");
var invariant = require("./invariant");

function remove(event) {
  event.remove();
}

var LocalEventTrapMixin = {
  trapBubbledEvent:function(topLevelType, handlerBaseName) {
    ("production" !== process.env.NODE_ENV ? invariant(this.isMounted(), 'Must be mounted to trap events') : invariant(this.isMounted()));
    var listener = ReactBrowserEventEmitter.trapBubbledEvent(
      topLevelType,
      handlerBaseName,
      this.getDOMNode()
    );
    this._localEventListeners = accumulate(this._localEventListeners, listener);
  },

  // trapCapturedEvent would look nearly identical. We don't implement that
  // method because it isn't currently needed.

  componentWillUnmount:function() {
    if (this._localEventListeners) {
      forEachAccumulated(this._localEventListeners, remove);
    }
  }
};

module.exports = LocalEventTrapMixin;

}).call(this,require('_process'))
},{"./ReactBrowserEventEmitter":33,"./accumulate":98,"./forEachAccumulated":111,"./invariant":124,"_process":3}],29:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule MobileSafariClickEventPlugin
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");

var emptyFunction = require("./emptyFunction");

var topLevelTypes = EventConstants.topLevelTypes;

/**
 * Mobile Safari does not fire properly bubble click events on non-interactive
 * elements, which means delegated click listeners do not fire. The workaround
 * for this bug involves attaching an empty click listener on the target node.
 *
 * This particular plugin works around the bug by attaching an empty click
 * listener on `touchstart` (which does fire on every element).
 */
var MobileSafariClickEventPlugin = {

  eventTypes: null,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    if (topLevelType === topLevelTypes.topTouchStart) {
      var target = nativeEvent.target;
      if (target && !target.onclick) {
        target.onclick = emptyFunction;
      }
    }
  }

};

module.exports = MobileSafariClickEventPlugin;

},{"./EventConstants":19,"./emptyFunction":106}],30:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule PooledClass
 */

"use strict";

var invariant = require("./invariant");

/**
 * Static poolers. Several custom versions for each potential number of
 * arguments. A completely generic pooler is easy to implement, but would
 * require accessing the `arguments` object. In each of these, `this` refers to
 * the Class itself, not an instance. If any others are needed, simply add them
 * here, or in their own files.
 */
var oneArgumentPooler = function(copyFieldsFrom) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
};

var twoArgumentPooler = function(a1, a2) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2);
    return instance;
  } else {
    return new Klass(a1, a2);
  }
};

var threeArgumentPooler = function(a1, a2, a3) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3);
    return instance;
  } else {
    return new Klass(a1, a2, a3);
  }
};

var fiveArgumentPooler = function(a1, a2, a3, a4, a5) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3, a4, a5);
    return instance;
  } else {
    return new Klass(a1, a2, a3, a4, a5);
  }
};

var standardReleaser = function(instance) {
  var Klass = this;
  ("production" !== process.env.NODE_ENV ? invariant(
    instance instanceof Klass,
    'Trying to release an instance into a pool of a different type.'
  ) : invariant(instance instanceof Klass));
  if (instance.destructor) {
    instance.destructor();
  }
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};

var DEFAULT_POOL_SIZE = 10;
var DEFAULT_POOLER = oneArgumentPooler;

/**
 * Augments `CopyConstructor` to be a poolable class, augmenting only the class
 * itself (statically) not adding any prototypical fields. Any CopyConstructor
 * you give this may have a `poolSize` property, and will look for a
 * prototypical `destructor` on instances (optional).
 *
 * @param {Function} CopyConstructor Constructor that can be used to reset.
 * @param {Function} pooler Customizable pooler.
 */
var addPoolingTo = function(CopyConstructor, pooler) {
  var NewKlass = CopyConstructor;
  NewKlass.instancePool = [];
  NewKlass.getPooled = pooler || DEFAULT_POOLER;
  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE;
  }
  NewKlass.release = standardReleaser;
  return NewKlass;
};

var PooledClass = {
  addPoolingTo: addPoolingTo,
  oneArgumentPooler: oneArgumentPooler,
  twoArgumentPooler: twoArgumentPooler,
  threeArgumentPooler: threeArgumentPooler,
  fiveArgumentPooler: fiveArgumentPooler
};

module.exports = PooledClass;

}).call(this,require('_process'))
},{"./invariant":124,"_process":3}],31:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule React
 */

"use strict";

var DOMPropertyOperations = require("./DOMPropertyOperations");
var EventPluginUtils = require("./EventPluginUtils");
var ReactChildren = require("./ReactChildren");
var ReactComponent = require("./ReactComponent");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactContext = require("./ReactContext");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactDescriptor = require("./ReactDescriptor");
var ReactDOM = require("./ReactDOM");
var ReactDOMComponent = require("./ReactDOMComponent");
var ReactDefaultInjection = require("./ReactDefaultInjection");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var ReactMultiChild = require("./ReactMultiChild");
var ReactPerf = require("./ReactPerf");
var ReactPropTypes = require("./ReactPropTypes");
var ReactServerRendering = require("./ReactServerRendering");
var ReactTextComponent = require("./ReactTextComponent");

var onlyChild = require("./onlyChild");
var warning = require("./warning");

ReactDefaultInjection.inject();

// Specifying arguments isn't necessary since we just use apply anyway, but it
// makes it clear for those actually consuming this API.
function createDescriptor(type, props, children) {
  var args = Array.prototype.slice.call(arguments, 1);
  return type.apply(null, args);
}

if ("production" !== process.env.NODE_ENV) {
  var _warnedForDeprecation = false;
}

var React = {
  Children: {
    map: ReactChildren.map,
    forEach: ReactChildren.forEach,
    count: ReactChildren.count,
    only: onlyChild
  },
  DOM: ReactDOM,
  PropTypes: ReactPropTypes,
  initializeTouchEvents: function(shouldUseTouch) {
    EventPluginUtils.useTouchEvents = shouldUseTouch;
  },
  createClass: ReactCompositeComponent.createClass,
  createDescriptor: function() {
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(
        _warnedForDeprecation,
        'React.createDescriptor is deprecated and will be removed in the ' +
        'next version of React. Use React.createElement instead.'
      ) : null);
      _warnedForDeprecation = true;
    }
    return createDescriptor.apply(this, arguments);
  },
  createElement: createDescriptor,
  constructAndRenderComponent: ReactMount.constructAndRenderComponent,
  constructAndRenderComponentByID: ReactMount.constructAndRenderComponentByID,
  renderComponent: ReactPerf.measure(
    'React',
    'renderComponent',
    ReactMount.renderComponent
  ),
  renderComponentToString: ReactServerRendering.renderComponentToString,
  renderComponentToStaticMarkup:
    ReactServerRendering.renderComponentToStaticMarkup,
  unmountComponentAtNode: ReactMount.unmountComponentAtNode,
  isValidClass: ReactDescriptor.isValidFactory,
  isValidComponent: ReactDescriptor.isValidDescriptor,
  withContext: ReactContext.withContext,
  __internals: {
    Component: ReactComponent,
    CurrentOwner: ReactCurrentOwner,
    DOMComponent: ReactDOMComponent,
    DOMPropertyOperations: DOMPropertyOperations,
    InstanceHandles: ReactInstanceHandles,
    Mount: ReactMount,
    MultiChild: ReactMultiChild,
    TextComponent: ReactTextComponent
  }
};

if ("production" !== process.env.NODE_ENV) {
  var ExecutionEnvironment = require("./ExecutionEnvironment");
  if (ExecutionEnvironment.canUseDOM &&
      window.top === window.self &&
      navigator.userAgent.indexOf('Chrome') > -1) {
    console.debug(
      'Download the React DevTools for a better development experience: ' +
      'http://fb.me/react-devtools'
    );

    var expectedFeatures = [
      // shims
      Array.isArray,
      Array.prototype.every,
      Array.prototype.forEach,
      Array.prototype.indexOf,
      Array.prototype.map,
      Date.now,
      Function.prototype.bind,
      Object.keys,
      String.prototype.split,
      String.prototype.trim,

      // shams
      Object.create,
      Object.freeze
    ];

    for (var i in expectedFeatures) {
      if (!expectedFeatures[i]) {
        console.error(
          'One or more ES5 shim/shams expected by React are not available: ' +
          'http://fb.me/react-warning-polyfills'
        );
        break;
      }
    }
  }
}

// Version exists only in the open-source version of React, not in Facebook's
// internal version.
React.version = '0.11.2';

module.exports = React;

}).call(this,require('_process'))
},{"./DOMPropertyOperations":15,"./EventPluginUtils":23,"./ExecutionEnvironment":25,"./ReactChildren":34,"./ReactComponent":35,"./ReactCompositeComponent":37,"./ReactContext":38,"./ReactCurrentOwner":39,"./ReactDOM":40,"./ReactDOMComponent":42,"./ReactDefaultInjection":52,"./ReactDescriptor":55,"./ReactInstanceHandles":63,"./ReactMount":65,"./ReactMultiChild":66,"./ReactPerf":69,"./ReactPropTypes":73,"./ReactServerRendering":77,"./ReactTextComponent":79,"./onlyChild":139,"./warning":147,"_process":3}],32:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactBrowserComponentMixin
 */

"use strict";

var ReactEmptyComponent = require("./ReactEmptyComponent");
var ReactMount = require("./ReactMount");

var invariant = require("./invariant");

var ReactBrowserComponentMixin = {
  /**
   * Returns the DOM node rendered by this component.
   *
   * @return {DOMElement} The root node of this component.
   * @final
   * @protected
   */
  getDOMNode: function() {
    ("production" !== process.env.NODE_ENV ? invariant(
      this.isMounted(),
      'getDOMNode(): A component must be mounted to have a DOM node.'
    ) : invariant(this.isMounted()));
    if (ReactEmptyComponent.isNullComponentID(this._rootNodeID)) {
      return null;
    }
    return ReactMount.getNode(this._rootNodeID);
  }
};

module.exports = ReactBrowserComponentMixin;

}).call(this,require('_process'))
},{"./ReactEmptyComponent":57,"./ReactMount":65,"./invariant":124,"_process":3}],33:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactBrowserEventEmitter
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");
var EventPluginRegistry = require("./EventPluginRegistry");
var ReactEventEmitterMixin = require("./ReactEventEmitterMixin");
var ViewportMetrics = require("./ViewportMetrics");

var isEventSupported = require("./isEventSupported");
var merge = require("./merge");

/**
 * Summary of `ReactBrowserEventEmitter` event handling:
 *
 *  - Top-level delegation is used to trap most native browser events. This
 *    may only occur in the main thread and is the responsibility of
 *    ReactEventListener, which is injected and can therefore support pluggable
 *    event sources. This is the only work that occurs in the main thread.
 *
 *  - We normalize and de-duplicate events to account for browser quirks. This
 *    may be done in the worker thread.
 *
 *  - Forward these native events (with the associated top-level type used to
 *    trap it) to `EventPluginHub`, which in turn will ask plugins if they want
 *    to extract any synthetic events.
 *
 *  - The `EventPluginHub` will then process each event by annotating them with
 *    "dispatches", a sequence of listeners and IDs that care about that event.
 *
 *  - The `EventPluginHub` then dispatches the events.
 *
 * Overview of React and the event system:
 *
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 *    React Core     .  General Purpose Event Plugin System
 */

var alreadyListeningTo = {};
var isMonitoringScrollValue = false;
var reactTopListenersCounter = 0;

// For events like 'submit' which don't consistently bubble (which we trap at a
// lower node than `document`), binding at `document` would cause duplicate
// events so we don't include them here
var topEventMapping = {
  topBlur: 'blur',
  topChange: 'change',
  topClick: 'click',
  topCompositionEnd: 'compositionend',
  topCompositionStart: 'compositionstart',
  topCompositionUpdate: 'compositionupdate',
  topContextMenu: 'contextmenu',
  topCopy: 'copy',
  topCut: 'cut',
  topDoubleClick: 'dblclick',
  topDrag: 'drag',
  topDragEnd: 'dragend',
  topDragEnter: 'dragenter',
  topDragExit: 'dragexit',
  topDragLeave: 'dragleave',
  topDragOver: 'dragover',
  topDragStart: 'dragstart',
  topDrop: 'drop',
  topFocus: 'focus',
  topInput: 'input',
  topKeyDown: 'keydown',
  topKeyPress: 'keypress',
  topKeyUp: 'keyup',
  topMouseDown: 'mousedown',
  topMouseMove: 'mousemove',
  topMouseOut: 'mouseout',
  topMouseOver: 'mouseover',
  topMouseUp: 'mouseup',
  topPaste: 'paste',
  topScroll: 'scroll',
  topSelectionChange: 'selectionchange',
  topTextInput: 'textInput',
  topTouchCancel: 'touchcancel',
  topTouchEnd: 'touchend',
  topTouchMove: 'touchmove',
  topTouchStart: 'touchstart',
  topWheel: 'wheel'
};

/**
 * To ensure no conflicts with other potential React instances on the page
 */
var topListenersIDKey = "_reactListenersID" + String(Math.random()).slice(2);

function getListeningForDocument(mountAt) {
  // In IE8, `mountAt` is a host object and doesn't have `hasOwnProperty`
  // directly.
  if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
    mountAt[topListenersIDKey] = reactTopListenersCounter++;
    alreadyListeningTo[mountAt[topListenersIDKey]] = {};
  }
  return alreadyListeningTo[mountAt[topListenersIDKey]];
}

/**
 * `ReactBrowserEventEmitter` is used to attach top-level event listeners. For
 * example:
 *
 *   ReactBrowserEventEmitter.putListener('myID', 'onClick', myFunction);
 *
 * This would allocate a "registration" of `('onClick', myFunction)` on 'myID'.
 *
 * @internal
 */
var ReactBrowserEventEmitter = merge(ReactEventEmitterMixin, {

  /**
   * Injectable event backend
   */
  ReactEventListener: null,

  injection: {
    /**
     * @param {object} ReactEventListener
     */
    injectReactEventListener: function(ReactEventListener) {
      ReactEventListener.setHandleTopLevel(
        ReactBrowserEventEmitter.handleTopLevel
      );
      ReactBrowserEventEmitter.ReactEventListener = ReactEventListener;
    }
  },

  /**
   * Sets whether or not any created callbacks should be enabled.
   *
   * @param {boolean} enabled True if callbacks should be enabled.
   */
  setEnabled: function(enabled) {
    if (ReactBrowserEventEmitter.ReactEventListener) {
      ReactBrowserEventEmitter.ReactEventListener.setEnabled(enabled);
    }
  },

  /**
   * @return {boolean} True if callbacks are enabled.
   */
  isEnabled: function() {
    return !!(
      ReactBrowserEventEmitter.ReactEventListener &&
      ReactBrowserEventEmitter.ReactEventListener.isEnabled()
    );
  },

  /**
   * We listen for bubbled touch events on the document object.
   *
   * Firefox v8.01 (and possibly others) exhibited strange behavior when
   * mounting `onmousemove` events at some node that was not the document
   * element. The symptoms were that if your mouse is not moving over something
   * contained within that mount point (for example on the background) the
   * top-level listeners for `onmousemove` won't be called. However, if you
   * register the `mousemove` on the document object, then it will of course
   * catch all `mousemove`s. This along with iOS quirks, justifies restricting
   * top-level listeners to the document object only, at least for these
   * movement types of events and possibly all events.
   *
   * @see http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
   *
   * Also, `keyup`/`keypress`/`keydown` do not bubble to the window on IE, but
   * they bubble to document.
   *
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {object} contentDocumentHandle Document which owns the container
   */
  listenTo: function(registrationName, contentDocumentHandle) {
    var mountAt = contentDocumentHandle;
    var isListening = getListeningForDocument(mountAt);
    var dependencies = EventPluginRegistry.
      registrationNameDependencies[registrationName];

    var topLevelTypes = EventConstants.topLevelTypes;
    for (var i = 0, l = dependencies.length; i < l; i++) {
      var dependency = dependencies[i];
      if (!(
            isListening.hasOwnProperty(dependency) &&
            isListening[dependency]
          )) {
        if (dependency === topLevelTypes.topWheel) {
          if (isEventSupported('wheel')) {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topWheel,
              'wheel',
              mountAt
            );
          } else if (isEventSupported('mousewheel')) {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topWheel,
              'mousewheel',
              mountAt
            );
          } else {
            // Firefox needs to capture a different mouse scroll event.
            // @see http://www.quirksmode.org/dom/events/tests/scroll.html
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topWheel,
              'DOMMouseScroll',
              mountAt
            );
          }
        } else if (dependency === topLevelTypes.topScroll) {

          if (isEventSupported('scroll', true)) {
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
              topLevelTypes.topScroll,
              'scroll',
              mountAt
            );
          } else {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topScroll,
              'scroll',
              ReactBrowserEventEmitter.ReactEventListener.WINDOW_HANDLE
            );
          }
        } else if (dependency === topLevelTypes.topFocus ||
            dependency === topLevelTypes.topBlur) {

          if (isEventSupported('focus', true)) {
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
              topLevelTypes.topFocus,
              'focus',
              mountAt
            );
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
              topLevelTypes.topBlur,
              'blur',
              mountAt
            );
          } else if (isEventSupported('focusin')) {
            // IE has `focusin` and `focusout` events which bubble.
            // @see http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topFocus,
              'focusin',
              mountAt
            );
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topBlur,
              'focusout',
              mountAt
            );
          }

          // to make sure blur and focus event listeners are only attached once
          isListening[topLevelTypes.topBlur] = true;
          isListening[topLevelTypes.topFocus] = true;
        } else if (topEventMapping.hasOwnProperty(dependency)) {
          ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
            dependency,
            topEventMapping[dependency],
            mountAt
          );
        }

        isListening[dependency] = true;
      }
    }
  },

  trapBubbledEvent: function(topLevelType, handlerBaseName, handle) {
    return ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
      topLevelType,
      handlerBaseName,
      handle
    );
  },

  trapCapturedEvent: function(topLevelType, handlerBaseName, handle) {
    return ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
      topLevelType,
      handlerBaseName,
      handle
    );
  },

  /**
   * Listens to window scroll and resize events. We cache scroll values so that
   * application code can access them without triggering reflows.
   *
   * NOTE: Scroll events do not bubble.
   *
   * @see http://www.quirksmode.org/dom/events/scroll.html
   */
  ensureScrollValueMonitoring: function(){
    if (!isMonitoringScrollValue) {
      var refresh = ViewportMetrics.refreshScrollValues;
      ReactBrowserEventEmitter.ReactEventListener.monitorScrollValue(refresh);
      isMonitoringScrollValue = true;
    }
  },

  eventNameDispatchConfigs: EventPluginHub.eventNameDispatchConfigs,

  registrationNameModules: EventPluginHub.registrationNameModules,

  putListener: EventPluginHub.putListener,

  getListener: EventPluginHub.getListener,

  deleteListener: EventPluginHub.deleteListener,

  deleteAllListeners: EventPluginHub.deleteAllListeners

});

module.exports = ReactBrowserEventEmitter;

},{"./EventConstants":19,"./EventPluginHub":21,"./EventPluginRegistry":22,"./ReactEventEmitterMixin":59,"./ViewportMetrics":97,"./isEventSupported":125,"./merge":134}],34:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactChildren
 */

"use strict";

var PooledClass = require("./PooledClass");

var traverseAllChildren = require("./traverseAllChildren");
var warning = require("./warning");

var twoArgumentPooler = PooledClass.twoArgumentPooler;
var threeArgumentPooler = PooledClass.threeArgumentPooler;

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * traversal. Allows avoiding binding callbacks.
 *
 * @constructor ForEachBookKeeping
 * @param {!function} forEachFunction Function to perform traversal with.
 * @param {?*} forEachContext Context to perform context with.
 */
function ForEachBookKeeping(forEachFunction, forEachContext) {
  this.forEachFunction = forEachFunction;
  this.forEachContext = forEachContext;
}
PooledClass.addPoolingTo(ForEachBookKeeping, twoArgumentPooler);

function forEachSingleChild(traverseContext, child, name, i) {
  var forEachBookKeeping = traverseContext;
  forEachBookKeeping.forEachFunction.call(
    forEachBookKeeping.forEachContext, child, i);
}

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} forEachFunc.
 * @param {*} forEachContext Context for forEachContext.
 */
function forEachChildren(children, forEachFunc, forEachContext) {
  if (children == null) {
    return children;
  }

  var traverseContext =
    ForEachBookKeeping.getPooled(forEachFunc, forEachContext);
  traverseAllChildren(children, forEachSingleChild, traverseContext);
  ForEachBookKeeping.release(traverseContext);
}

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * mapping. Allows avoiding binding callbacks.
 *
 * @constructor MapBookKeeping
 * @param {!*} mapResult Object containing the ordered map of results.
 * @param {!function} mapFunction Function to perform mapping with.
 * @param {?*} mapContext Context to perform mapping with.
 */
function MapBookKeeping(mapResult, mapFunction, mapContext) {
  this.mapResult = mapResult;
  this.mapFunction = mapFunction;
  this.mapContext = mapContext;
}
PooledClass.addPoolingTo(MapBookKeeping, threeArgumentPooler);

function mapSingleChildIntoContext(traverseContext, child, name, i) {
  var mapBookKeeping = traverseContext;
  var mapResult = mapBookKeeping.mapResult;

  var keyUnique = !mapResult.hasOwnProperty(name);
  ("production" !== process.env.NODE_ENV ? warning(
    keyUnique,
    'ReactChildren.map(...): Encountered two children with the same key, ' +
    '`%s`. Child keys must be unique; when two children share a key, only ' +
    'the first child will be used.',
    name
  ) : null);

  if (keyUnique) {
    var mappedChild =
      mapBookKeeping.mapFunction.call(mapBookKeeping.mapContext, child, i);
    mapResult[name] = mappedChild;
  }
}

/**
 * Maps children that are typically specified as `props.children`.
 *
 * The provided mapFunction(child, key, index) will be called for each
 * leaf child.
 *
 * TODO: This may likely break any calls to `ReactChildren.map` that were
 * previously relying on the fact that we guarded against null children.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} mapFunction.
 * @param {*} mapContext Context for mapFunction.
 * @return {object} Object containing the ordered map of results.
 */
function mapChildren(children, func, context) {
  if (children == null) {
    return children;
  }

  var mapResult = {};
  var traverseContext = MapBookKeeping.getPooled(mapResult, func, context);
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
  MapBookKeeping.release(traverseContext);
  return mapResult;
}

function forEachSingleChildDummy(traverseContext, child, name, i) {
  return null;
}

/**
 * Count the number of children that are typically specified as
 * `props.children`.
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */
function countChildren(children, context) {
  return traverseAllChildren(children, forEachSingleChildDummy, null);
}

var ReactChildren = {
  forEach: forEachChildren,
  map: mapChildren,
  count: countChildren
};

module.exports = ReactChildren;

}).call(this,require('_process'))
},{"./PooledClass":30,"./traverseAllChildren":146,"./warning":147,"_process":3}],35:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactComponent
 */

"use strict";

var ReactDescriptor = require("./ReactDescriptor");
var ReactOwner = require("./ReactOwner");
var ReactUpdates = require("./ReactUpdates");

var invariant = require("./invariant");
var keyMirror = require("./keyMirror");
var merge = require("./merge");

/**
 * Every React component is in one of these life cycles.
 */
var ComponentLifeCycle = keyMirror({
  /**
   * Mounted components have a DOM node representation and are capable of
   * receiving new props.
   */
  MOUNTED: null,
  /**
   * Unmounted components are inactive and cannot receive new props.
   */
  UNMOUNTED: null
});

var injected = false;

/**
 * Optionally injectable environment dependent cleanup hook. (server vs.
 * browser etc). Example: A browser system caches DOM nodes based on component
 * ID and must remove that cache entry when this instance is unmounted.
 *
 * @private
 */
var unmountIDFromEnvironment = null;

/**
 * The "image" of a component tree, is the platform specific (typically
 * serialized) data that represents a tree of lower level UI building blocks.
 * On the web, this "image" is HTML markup which describes a construction of
 * low level `div` and `span` nodes. Other platforms may have different
 * encoding of this "image". This must be injected.
 *
 * @private
 */
var mountImageIntoNode = null;

/**
 * Components are the basic units of composition in React.
 *
 * Every component accepts a set of keyed input parameters known as "props" that
 * are initialized by the constructor. Once a component is mounted, the props
 * can be mutated using `setProps` or `replaceProps`.
 *
 * Every component is capable of the following operations:
 *
 *   `mountComponent`
 *     Initializes the component, renders markup, and registers event listeners.
 *
 *   `receiveComponent`
 *     Updates the rendered DOM nodes to match the given component.
 *
 *   `unmountComponent`
 *     Releases any resources allocated by this component.
 *
 * Components can also be "owned" by other components. Being owned by another
 * component means being constructed by that component. This is different from
 * being the child of a component, which means having a DOM representation that
 * is a child of the DOM representation of that component.
 *
 * @class ReactComponent
 */
var ReactComponent = {

  injection: {
    injectEnvironment: function(ReactComponentEnvironment) {
      ("production" !== process.env.NODE_ENV ? invariant(
        !injected,
        'ReactComponent: injectEnvironment() can only be called once.'
      ) : invariant(!injected));
      mountImageIntoNode = ReactComponentEnvironment.mountImageIntoNode;
      unmountIDFromEnvironment =
        ReactComponentEnvironment.unmountIDFromEnvironment;
      ReactComponent.BackendIDOperations =
        ReactComponentEnvironment.BackendIDOperations;
      injected = true;
    }
  },

  /**
   * @internal
   */
  LifeCycle: ComponentLifeCycle,

  /**
   * Injected module that provides ability to mutate individual properties.
   * Injected into the base class because many different subclasses need access
   * to this.
   *
   * @internal
   */
  BackendIDOperations: null,

  /**
   * Base functionality for every ReactComponent constructor. Mixed into the
   * `ReactComponent` prototype, but exposed statically for easy access.
   *
   * @lends {ReactComponent.prototype}
   */
  Mixin: {

    /**
     * Checks whether or not this component is mounted.
     *
     * @return {boolean} True if mounted, false otherwise.
     * @final
     * @protected
     */
    isMounted: function() {
      return this._lifeCycleState === ComponentLifeCycle.MOUNTED;
    },

    /**
     * Sets a subset of the props.
     *
     * @param {object} partialProps Subset of the next props.
     * @param {?function} callback Called after props are updated.
     * @final
     * @public
     */
    setProps: function(partialProps, callback) {
      // Merge with the pending descriptor if it exists, otherwise with existing
      // descriptor props.
      var descriptor = this._pendingDescriptor || this._descriptor;
      this.replaceProps(
        merge(descriptor.props, partialProps),
        callback
      );
    },

    /**
     * Replaces all of the props.
     *
     * @param {object} props New props.
     * @param {?function} callback Called after props are updated.
     * @final
     * @public
     */
    replaceProps: function(props, callback) {
      ("production" !== process.env.NODE_ENV ? invariant(
        this.isMounted(),
        'replaceProps(...): Can only update a mounted component.'
      ) : invariant(this.isMounted()));
      ("production" !== process.env.NODE_ENV ? invariant(
        this._mountDepth === 0,
        'replaceProps(...): You called `setProps` or `replaceProps` on a ' +
        'component with a parent. This is an anti-pattern since props will ' +
        'get reactively updated when rendered. Instead, change the owner\'s ' +
        '`render` method to pass the correct value as props to the component ' +
        'where it is created.'
      ) : invariant(this._mountDepth === 0));
      // This is a deoptimized path. We optimize for always having a descriptor.
      // This creates an extra internal descriptor.
      this._pendingDescriptor = ReactDescriptor.cloneAndReplaceProps(
        this._pendingDescriptor || this._descriptor,
        props
      );
      ReactUpdates.enqueueUpdate(this, callback);
    },

    /**
     * Schedule a partial update to the props. Only used for internal testing.
     *
     * @param {object} partialProps Subset of the next props.
     * @param {?function} callback Called after props are updated.
     * @final
     * @internal
     */
    _setPropsInternal: function(partialProps, callback) {
      // This is a deoptimized path. We optimize for always having a descriptor.
      // This creates an extra internal descriptor.
      var descriptor = this._pendingDescriptor || this._descriptor;
      this._pendingDescriptor = ReactDescriptor.cloneAndReplaceProps(
        descriptor,
        merge(descriptor.props, partialProps)
      );
      ReactUpdates.enqueueUpdate(this, callback);
    },

    /**
     * Base constructor for all React components.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.construct.call(this, ...)`.
     *
     * @param {ReactDescriptor} descriptor
     * @internal
     */
    construct: function(descriptor) {
      // This is the public exposed props object after it has been processed
      // with default props. The descriptor's props represents the true internal
      // state of the props.
      this.props = descriptor.props;
      // Record the component responsible for creating this component.
      // This is accessible through the descriptor but we maintain an extra
      // field for compatibility with devtools and as a way to make an
      // incremental update. TODO: Consider deprecating this field.
      this._owner = descriptor._owner;

      // All components start unmounted.
      this._lifeCycleState = ComponentLifeCycle.UNMOUNTED;

      // See ReactUpdates.
      this._pendingCallbacks = null;

      // We keep the old descriptor and a reference to the pending descriptor
      // to track updates.
      this._descriptor = descriptor;
      this._pendingDescriptor = null;
    },

    /**
     * Initializes the component, renders markup, and registers event listeners.
     *
     * NOTE: This does not insert any nodes into the DOM.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.mountComponent.call(this, ...)`.
     *
     * @param {string} rootID DOM ID of the root node.
     * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
     * @param {number} mountDepth number of components in the owner hierarchy.
     * @return {?string} Rendered markup to be inserted into the DOM.
     * @internal
     */
    mountComponent: function(rootID, transaction, mountDepth) {
      ("production" !== process.env.NODE_ENV ? invariant(
        !this.isMounted(),
        'mountComponent(%s, ...): Can only mount an unmounted component. ' +
        'Make sure to avoid storing components between renders or reusing a ' +
        'single component instance in multiple places.',
        rootID
      ) : invariant(!this.isMounted()));
      var props = this._descriptor.props;
      if (props.ref != null) {
        var owner = this._descriptor._owner;
        ReactOwner.addComponentAsRefTo(this, props.ref, owner);
      }
      this._rootNodeID = rootID;
      this._lifeCycleState = ComponentLifeCycle.MOUNTED;
      this._mountDepth = mountDepth;
      // Effectively: return '';
    },

    /**
     * Releases any resources allocated by `mountComponent`.
     *
     * NOTE: This does not remove any nodes from the DOM.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.unmountComponent.call(this)`.
     *
     * @internal
     */
    unmountComponent: function() {
      ("production" !== process.env.NODE_ENV ? invariant(
        this.isMounted(),
        'unmountComponent(): Can only unmount a mounted component.'
      ) : invariant(this.isMounted()));
      var props = this.props;
      if (props.ref != null) {
        ReactOwner.removeComponentAsRefFrom(this, props.ref, this._owner);
      }
      unmountIDFromEnvironment(this._rootNodeID);
      this._rootNodeID = null;
      this._lifeCycleState = ComponentLifeCycle.UNMOUNTED;
    },

    /**
     * Given a new instance of this component, updates the rendered DOM nodes
     * as if that instance was rendered instead.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.receiveComponent.call(this, ...)`.
     *
     * @param {object} nextComponent Next set of properties.
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    receiveComponent: function(nextDescriptor, transaction) {
      ("production" !== process.env.NODE_ENV ? invariant(
        this.isMounted(),
        'receiveComponent(...): Can only update a mounted component.'
      ) : invariant(this.isMounted()));
      this._pendingDescriptor = nextDescriptor;
      this.performUpdateIfNecessary(transaction);
    },

    /**
     * If `_pendingDescriptor` is set, update the component.
     *
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    performUpdateIfNecessary: function(transaction) {
      if (this._pendingDescriptor == null) {
        return;
      }
      var prevDescriptor = this._descriptor;
      var nextDescriptor = this._pendingDescriptor;
      this._descriptor = nextDescriptor;
      this.props = nextDescriptor.props;
      this._owner = nextDescriptor._owner;
      this._pendingDescriptor = null;
      this.updateComponent(transaction, prevDescriptor);
    },

    /**
     * Updates the component's currently mounted representation.
     *
     * @param {ReactReconcileTransaction} transaction
     * @param {object} prevDescriptor
     * @internal
     */
    updateComponent: function(transaction, prevDescriptor) {
      var nextDescriptor = this._descriptor;

      // If either the owner or a `ref` has changed, make sure the newest owner
      // has stored a reference to `this`, and the previous owner (if different)
      // has forgotten the reference to `this`. We use the descriptor instead
      // of the public this.props because the post processing cannot determine
      // a ref. The ref conceptually lives on the descriptor.

      // TODO: Should this even be possible? The owner cannot change because
      // it's forbidden by shouldUpdateReactComponent. The ref can change
      // if you swap the keys of but not the refs. Reconsider where this check
      // is made. It probably belongs where the key checking and
      // instantiateReactComponent is done.

      if (nextDescriptor._owner !== prevDescriptor._owner ||
          nextDescriptor.props.ref !== prevDescriptor.props.ref) {
        if (prevDescriptor.props.ref != null) {
          ReactOwner.removeComponentAsRefFrom(
            this, prevDescriptor.props.ref, prevDescriptor._owner
          );
        }
        // Correct, even if the owner is the same, and only the ref has changed.
        if (nextDescriptor.props.ref != null) {
          ReactOwner.addComponentAsRefTo(
            this,
            nextDescriptor.props.ref,
            nextDescriptor._owner
          );
        }
      }
    },

    /**
     * Mounts this component and inserts it into the DOM.
     *
     * @param {string} rootID DOM ID of the root node.
     * @param {DOMElement} container DOM element to mount into.
     * @param {boolean} shouldReuseMarkup If true, do not insert markup
     * @final
     * @internal
     * @see {ReactMount.renderComponent}
     */
    mountComponentIntoNode: function(rootID, container, shouldReuseMarkup) {
      var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
      transaction.perform(
        this._mountComponentIntoNode,
        this,
        rootID,
        container,
        transaction,
        shouldReuseMarkup
      );
      ReactUpdates.ReactReconcileTransaction.release(transaction);
    },

    /**
     * @param {string} rootID DOM ID of the root node.
     * @param {DOMElement} container DOM element to mount into.
     * @param {ReactReconcileTransaction} transaction
     * @param {boolean} shouldReuseMarkup If true, do not insert markup
     * @final
     * @private
     */
    _mountComponentIntoNode: function(
        rootID,
        container,
        transaction,
        shouldReuseMarkup) {
      var markup = this.mountComponent(rootID, transaction, 0);
      mountImageIntoNode(markup, container, shouldReuseMarkup);
    },

    /**
     * Checks if this component is owned by the supplied `owner` component.
     *
     * @param {ReactComponent} owner Component to check.
     * @return {boolean} True if `owners` owns this component.
     * @final
     * @internal
     */
    isOwnedBy: function(owner) {
      return this._owner === owner;
    },

    /**
     * Gets another component, that shares the same owner as this one, by ref.
     *
     * @param {string} ref of a sibling Component.
     * @return {?ReactComponent} the actual sibling Component.
     * @final
     * @internal
     */
    getSiblingByRef: function(ref) {
      var owner = this._owner;
      if (!owner || !owner.refs) {
        return null;
      }
      return owner.refs[ref];
    }
  }
};

module.exports = ReactComponent;

}).call(this,require('_process'))
},{"./ReactDescriptor":55,"./ReactOwner":68,"./ReactUpdates":80,"./invariant":124,"./keyMirror":130,"./merge":134,"_process":3}],36:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactComponentBrowserEnvironment
 */

/*jslint evil: true */

"use strict";

var ReactDOMIDOperations = require("./ReactDOMIDOperations");
var ReactMarkupChecksum = require("./ReactMarkupChecksum");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");
var ReactReconcileTransaction = require("./ReactReconcileTransaction");

var getReactRootElementInContainer = require("./getReactRootElementInContainer");
var invariant = require("./invariant");
var setInnerHTML = require("./setInnerHTML");


var ELEMENT_NODE_TYPE = 1;
var DOC_NODE_TYPE = 9;


/**
 * Abstracts away all functionality of `ReactComponent` requires knowledge of
 * the browser context.
 */
var ReactComponentBrowserEnvironment = {
  ReactReconcileTransaction: ReactReconcileTransaction,

  BackendIDOperations: ReactDOMIDOperations,

  /**
   * If a particular environment requires that some resources be cleaned up,
   * specify this in the injected Mixin. In the DOM, we would likely want to
   * purge any cached node ID lookups.
   *
   * @private
   */
  unmountIDFromEnvironment: function(rootNodeID) {
    ReactMount.purgeID(rootNodeID);
  },

  /**
   * @param {string} markup Markup string to place into the DOM Element.
   * @param {DOMElement} container DOM Element to insert markup into.
   * @param {boolean} shouldReuseMarkup Should reuse the existing markup in the
   * container if possible.
   */
  mountImageIntoNode: ReactPerf.measure(
    'ReactComponentBrowserEnvironment',
    'mountImageIntoNode',
    function(markup, container, shouldReuseMarkup) {
      ("production" !== process.env.NODE_ENV ? invariant(
        container && (
          container.nodeType === ELEMENT_NODE_TYPE ||
            container.nodeType === DOC_NODE_TYPE
        ),
        'mountComponentIntoNode(...): Target container is not valid.'
      ) : invariant(container && (
        container.nodeType === ELEMENT_NODE_TYPE ||
          container.nodeType === DOC_NODE_TYPE
      )));

      if (shouldReuseMarkup) {
        if (ReactMarkupChecksum.canReuseMarkup(
          markup,
          getReactRootElementInContainer(container))) {
          return;
        } else {
          ("production" !== process.env.NODE_ENV ? invariant(
            container.nodeType !== DOC_NODE_TYPE,
            'You\'re trying to render a component to the document using ' +
            'server rendering but the checksum was invalid. This usually ' +
            'means you rendered a different component type or props on ' +
            'the client from the one on the server, or your render() ' +
            'methods are impure. React cannot handle this case due to ' +
            'cross-browser quirks by rendering at the document root. You ' +
            'should look for environment dependent code in your components ' +
            'and ensure the props are the same client and server side.'
          ) : invariant(container.nodeType !== DOC_NODE_TYPE));

          if ("production" !== process.env.NODE_ENV) {
            console.warn(
              'React attempted to use reuse markup in a container but the ' +
              'checksum was invalid. This generally means that you are ' +
              'using server rendering and the markup generated on the ' +
              'server was not what the client was expecting. React injected ' +
              'new markup to compensate which works but you have lost many ' +
              'of the benefits of server rendering. Instead, figure out ' +
              'why the markup being generated is different on the client ' +
              'or server.'
            );
          }
        }
      }

      ("production" !== process.env.NODE_ENV ? invariant(
        container.nodeType !== DOC_NODE_TYPE,
        'You\'re trying to render a component to the document but ' +
          'you didn\'t use server rendering. We can\'t do this ' +
          'without using server rendering due to cross-browser quirks. ' +
          'See renderComponentToString() for server rendering.'
      ) : invariant(container.nodeType !== DOC_NODE_TYPE));

      setInnerHTML(container, markup);
    }
  )
};

module.exports = ReactComponentBrowserEnvironment;

}).call(this,require('_process'))
},{"./ReactDOMIDOperations":44,"./ReactMarkupChecksum":64,"./ReactMount":65,"./ReactPerf":69,"./ReactReconcileTransaction":75,"./getReactRootElementInContainer":118,"./invariant":124,"./setInnerHTML":142,"_process":3}],37:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactCompositeComponent
 */

"use strict";

var ReactComponent = require("./ReactComponent");
var ReactContext = require("./ReactContext");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactDescriptor = require("./ReactDescriptor");
var ReactDescriptorValidator = require("./ReactDescriptorValidator");
var ReactEmptyComponent = require("./ReactEmptyComponent");
var ReactErrorUtils = require("./ReactErrorUtils");
var ReactOwner = require("./ReactOwner");
var ReactPerf = require("./ReactPerf");
var ReactPropTransferer = require("./ReactPropTransferer");
var ReactPropTypeLocations = require("./ReactPropTypeLocations");
var ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");
var ReactUpdates = require("./ReactUpdates");

var instantiateReactComponent = require("./instantiateReactComponent");
var invariant = require("./invariant");
var keyMirror = require("./keyMirror");
var merge = require("./merge");
var mixInto = require("./mixInto");
var monitorCodeUse = require("./monitorCodeUse");
var mapObject = require("./mapObject");
var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
var warning = require("./warning");

/**
 * Policies that describe methods in `ReactCompositeComponentInterface`.
 */
var SpecPolicy = keyMirror({
  /**
   * These methods may be defined only once by the class specification or mixin.
   */
  DEFINE_ONCE: null,
  /**
   * These methods may be defined by both the class specification and mixins.
   * Subsequent definitions will be chained. These methods must return void.
   */
  DEFINE_MANY: null,
  /**
   * These methods are overriding the base ReactCompositeComponent class.
   */
  OVERRIDE_BASE: null,
  /**
   * These methods are similar to DEFINE_MANY, except we assume they return
   * objects. We try to merge the keys of the return values of all the mixed in
   * functions. If there is a key conflict we throw.
   */
  DEFINE_MANY_MERGED: null
});


var injectedMixins = [];

/**
 * Composite components are higher-level components that compose other composite
 * or native components.
 *
 * To create a new type of `ReactCompositeComponent`, pass a specification of
 * your new class to `React.createClass`. The only requirement of your class
 * specification is that you implement a `render` method.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return <div>Hello World</div>;
 *     }
 *   });
 *
 * The class specification supports a specific protocol of methods that have
 * special meaning (e.g. `render`). See `ReactCompositeComponentInterface` for
 * more the comprehensive protocol. Any other properties and methods in the
 * class specification will available on the prototype.
 *
 * @interface ReactCompositeComponentInterface
 * @internal
 */
var ReactCompositeComponentInterface = {

  /**
   * An array of Mixin objects to include when defining your component.
   *
   * @type {array}
   * @optional
   */
  mixins: SpecPolicy.DEFINE_MANY,

  /**
   * An object containing properties and methods that should be defined on
   * the component's constructor instead of its prototype (static methods).
   *
   * @type {object}
   * @optional
   */
  statics: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of prop types for this component.
   *
   * @type {object}
   * @optional
   */
  propTypes: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of context types for this component.
   *
   * @type {object}
   * @optional
   */
  contextTypes: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of context types this component sets for its children.
   *
   * @type {object}
   * @optional
   */
  childContextTypes: SpecPolicy.DEFINE_MANY,

  // ==== Definition methods ====

  /**
   * Invoked when the component is mounted. Values in the mapping will be set on
   * `this.props` if that prop is not specified (i.e. using an `in` check).
   *
   * This method is invoked before `getInitialState` and therefore cannot rely
   * on `this.state` or use `this.setState`.
   *
   * @return {object}
   * @optional
   */
  getDefaultProps: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Invoked once before the component is mounted. The return value will be used
   * as the initial value of `this.state`.
   *
   *   getInitialState: function() {
   *     return {
   *       isOn: false,
   *       fooBaz: new BazFoo()
   *     }
   *   }
   *
   * @return {object}
   * @optional
   */
  getInitialState: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * @return {object}
   * @optional
   */
  getChildContext: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Uses props from `this.props` and state from `this.state` to render the
   * structure of the component.
   *
   * No guarantees are made about when or how often this method is invoked, so
   * it must not have side effects.
   *
   *   render: function() {
   *     var name = this.props.name;
   *     return <div>Hello, {name}!</div>;
   *   }
   *
   * @return {ReactComponent}
   * @nosideeffects
   * @required
   */
  render: SpecPolicy.DEFINE_ONCE,



  // ==== Delegate methods ====

  /**
   * Invoked when the component is initially created and about to be mounted.
   * This may have side effects, but any external subscriptions or data created
   * by this method must be cleaned up in `componentWillUnmount`.
   *
   * @optional
   */
  componentWillMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component has been mounted and has a DOM representation.
   * However, there is no guarantee that the DOM node is in the document.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been mounted (initialized and rendered) for the first time.
   *
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked before the component receives new props.
   *
   * Use this as an opportunity to react to a prop transition by updating the
   * state using `this.setState`. Current props are accessed via `this.props`.
   *
   *   componentWillReceiveProps: function(nextProps, nextContext) {
   *     this.setState({
   *       likesIncreasing: nextProps.likeCount > this.props.likeCount
   *     });
   *   }
   *
   * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
   * transition may cause a state change, but the opposite is not true. If you
   * need it, you are probably looking for `componentWillUpdate`.
   *
   * @param {object} nextProps
   * @optional
   */
  componentWillReceiveProps: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked while deciding if the component should be updated as a result of
   * receiving new props, state and/or context.
   *
   * Use this as an opportunity to `return false` when you're certain that the
   * transition to the new props/state/context will not require a component
   * update.
   *
   *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
   *     return !equal(nextProps, this.props) ||
   *       !equal(nextState, this.state) ||
   *       !equal(nextContext, this.context);
   *   }
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @return {boolean} True if the component should update.
   * @optional
   */
  shouldComponentUpdate: SpecPolicy.DEFINE_ONCE,

  /**
   * Invoked when the component is about to update due to a transition from
   * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
   * and `nextContext`.
   *
   * Use this as an opportunity to perform preparation before an update occurs.
   *
   * NOTE: You **cannot** use `this.setState()` in this method.
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @param {ReactReconcileTransaction} transaction
   * @optional
   */
  componentWillUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component's DOM representation has been updated.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been updated.
   *
   * @param {object} prevProps
   * @param {?object} prevState
   * @param {?object} prevContext
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component is about to be removed from its parent and have
   * its DOM representation destroyed.
   *
   * Use this as an opportunity to deallocate any external resources.
   *
   * NOTE: There is no `componentDidUnmount` since your component will have been
   * destroyed by that point.
   *
   * @optional
   */
  componentWillUnmount: SpecPolicy.DEFINE_MANY,



  // ==== Advanced methods ====

  /**
   * Updates the component's currently mounted DOM representation.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   * @overridable
   */
  updateComponent: SpecPolicy.OVERRIDE_BASE

};

/**
 * Mapping from class specification keys to special processing functions.
 *
 * Although these are declared like instance properties in the specification
 * when defining classes using `React.createClass`, they are actually static
 * and are accessible on the constructor instead of the prototype. Despite
 * being static, they must be defined outside of the "statics" key under
 * which all other static methods are defined.
 */
var RESERVED_SPEC_KEYS = {
  displayName: function(Constructor, displayName) {
    Constructor.displayName = displayName;
  },
  mixins: function(Constructor, mixins) {
    if (mixins) {
      for (var i = 0; i < mixins.length; i++) {
        mixSpecIntoComponent(Constructor, mixins[i]);
      }
    }
  },
  childContextTypes: function(Constructor, childContextTypes) {
    validateTypeDef(
      Constructor,
      childContextTypes,
      ReactPropTypeLocations.childContext
    );
    Constructor.childContextTypes = merge(
      Constructor.childContextTypes,
      childContextTypes
    );
  },
  contextTypes: function(Constructor, contextTypes) {
    validateTypeDef(
      Constructor,
      contextTypes,
      ReactPropTypeLocations.context
    );
    Constructor.contextTypes = merge(Constructor.contextTypes, contextTypes);
  },
  /**
   * Special case getDefaultProps which should move into statics but requires
   * automatic merging.
   */
  getDefaultProps: function(Constructor, getDefaultProps) {
    if (Constructor.getDefaultProps) {
      Constructor.getDefaultProps = createMergedResultFunction(
        Constructor.getDefaultProps,
        getDefaultProps
      );
    } else {
      Constructor.getDefaultProps = getDefaultProps;
    }
  },
  propTypes: function(Constructor, propTypes) {
    validateTypeDef(
      Constructor,
      propTypes,
      ReactPropTypeLocations.prop
    );
    Constructor.propTypes = merge(Constructor.propTypes, propTypes);
  },
  statics: function(Constructor, statics) {
    mixStaticSpecIntoComponent(Constructor, statics);
  }
};

function getDeclarationErrorAddendum(component) {
  var owner = component._owner || null;
  if (owner && owner.constructor && owner.constructor.displayName) {
    return ' Check the render method of `' + owner.constructor.displayName +
      '`.';
  }
  return '';
}

function validateTypeDef(Constructor, typeDef, location) {
  for (var propName in typeDef) {
    if (typeDef.hasOwnProperty(propName)) {
      ("production" !== process.env.NODE_ENV ? invariant(
        typeof typeDef[propName] == 'function',
        '%s: %s type `%s` is invalid; it must be a function, usually from ' +
        'React.PropTypes.',
        Constructor.displayName || 'ReactCompositeComponent',
        ReactPropTypeLocationNames[location],
        propName
      ) : invariant(typeof typeDef[propName] == 'function'));
    }
  }
}

function validateMethodOverride(proto, name) {
  var specPolicy = ReactCompositeComponentInterface.hasOwnProperty(name) ?
    ReactCompositeComponentInterface[name] :
    null;

  // Disallow overriding of base class methods unless explicitly allowed.
  if (ReactCompositeComponentMixin.hasOwnProperty(name)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      specPolicy === SpecPolicy.OVERRIDE_BASE,
      'ReactCompositeComponentInterface: You are attempting to override ' +
      '`%s` from your class specification. Ensure that your method names ' +
      'do not overlap with React methods.',
      name
    ) : invariant(specPolicy === SpecPolicy.OVERRIDE_BASE));
  }

  // Disallow defining methods more than once unless explicitly allowed.
  if (proto.hasOwnProperty(name)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      specPolicy === SpecPolicy.DEFINE_MANY ||
      specPolicy === SpecPolicy.DEFINE_MANY_MERGED,
      'ReactCompositeComponentInterface: You are attempting to define ' +
      '`%s` on your component more than once. This conflict may be due ' +
      'to a mixin.',
      name
    ) : invariant(specPolicy === SpecPolicy.DEFINE_MANY ||
    specPolicy === SpecPolicy.DEFINE_MANY_MERGED));
  }
}

function validateLifeCycleOnReplaceState(instance) {
  var compositeLifeCycleState = instance._compositeLifeCycleState;
  ("production" !== process.env.NODE_ENV ? invariant(
    instance.isMounted() ||
      compositeLifeCycleState === CompositeLifeCycle.MOUNTING,
    'replaceState(...): Can only update a mounted or mounting component.'
  ) : invariant(instance.isMounted() ||
    compositeLifeCycleState === CompositeLifeCycle.MOUNTING));
  ("production" !== process.env.NODE_ENV ? invariant(compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE,
    'replaceState(...): Cannot update during an existing state transition ' +
    '(such as within `render`). This could potentially cause an infinite ' +
    'loop so it is forbidden.'
  ) : invariant(compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE));
  ("production" !== process.env.NODE_ENV ? invariant(compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING,
    'replaceState(...): Cannot update while unmounting component. This ' +
    'usually means you called setState() on an unmounted component.'
  ) : invariant(compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING));
}

/**
 * Custom version of `mixInto` which handles policy validation and reserved
 * specification keys when building `ReactCompositeComponent` classses.
 */
function mixSpecIntoComponent(Constructor, spec) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !ReactDescriptor.isValidFactory(spec),
    'ReactCompositeComponent: You\'re attempting to ' +
    'use a component class as a mixin. Instead, just use a regular object.'
  ) : invariant(!ReactDescriptor.isValidFactory(spec)));
  ("production" !== process.env.NODE_ENV ? invariant(
    !ReactDescriptor.isValidDescriptor(spec),
    'ReactCompositeComponent: You\'re attempting to ' +
    'use a component as a mixin. Instead, just use a regular object.'
  ) : invariant(!ReactDescriptor.isValidDescriptor(spec)));

  var proto = Constructor.prototype;
  for (var name in spec) {
    var property = spec[name];
    if (!spec.hasOwnProperty(name)) {
      continue;
    }

    validateMethodOverride(proto, name);

    if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
      RESERVED_SPEC_KEYS[name](Constructor, property);
    } else {
      // Setup methods on prototype:
      // The following member methods should not be automatically bound:
      // 1. Expected ReactCompositeComponent methods (in the "interface").
      // 2. Overridden methods (that were mixed in).
      var isCompositeComponentMethod =
        ReactCompositeComponentInterface.hasOwnProperty(name);
      var isAlreadyDefined = proto.hasOwnProperty(name);
      var markedDontBind = property && property.__reactDontBind;
      var isFunction = typeof property === 'function';
      var shouldAutoBind =
        isFunction &&
        !isCompositeComponentMethod &&
        !isAlreadyDefined &&
        !markedDontBind;

      if (shouldAutoBind) {
        if (!proto.__reactAutoBindMap) {
          proto.__reactAutoBindMap = {};
        }
        proto.__reactAutoBindMap[name] = property;
        proto[name] = property;
      } else {
        if (isAlreadyDefined) {
          var specPolicy = ReactCompositeComponentInterface[name];

          // These cases should already be caught by validateMethodOverride
          ("production" !== process.env.NODE_ENV ? invariant(
            isCompositeComponentMethod && (
              specPolicy === SpecPolicy.DEFINE_MANY_MERGED ||
              specPolicy === SpecPolicy.DEFINE_MANY
            ),
            'ReactCompositeComponent: Unexpected spec policy %s for key %s ' +
            'when mixing in component specs.',
            specPolicy,
            name
          ) : invariant(isCompositeComponentMethod && (
            specPolicy === SpecPolicy.DEFINE_MANY_MERGED ||
            specPolicy === SpecPolicy.DEFINE_MANY
          )));

          // For methods which are defined more than once, call the existing
          // methods before calling the new property, merging if appropriate.
          if (specPolicy === SpecPolicy.DEFINE_MANY_MERGED) {
            proto[name] = createMergedResultFunction(proto[name], property);
          } else if (specPolicy === SpecPolicy.DEFINE_MANY) {
            proto[name] = createChainedFunction(proto[name], property);
          }
        } else {
          proto[name] = property;
          if ("production" !== process.env.NODE_ENV) {
            // Add verbose displayName to the function, which helps when looking
            // at profiling tools.
            if (typeof property === 'function' && spec.displayName) {
              proto[name].displayName = spec.displayName + '_' + name;
            }
          }
        }
      }
    }
  }
}

function mixStaticSpecIntoComponent(Constructor, statics) {
  if (!statics) {
    return;
  }
  for (var name in statics) {
    var property = statics[name];
    if (!statics.hasOwnProperty(name)) {
      continue;
    }

    var isInherited = name in Constructor;
    var result = property;
    if (isInherited) {
      var existingProperty = Constructor[name];
      var existingType = typeof existingProperty;
      var propertyType = typeof property;
      ("production" !== process.env.NODE_ENV ? invariant(
        existingType === 'function' && propertyType === 'function',
        'ReactCompositeComponent: You are attempting to define ' +
        '`%s` on your component more than once, but that is only supported ' +
        'for functions, which are chained together. This conflict may be ' +
        'due to a mixin.',
        name
      ) : invariant(existingType === 'function' && propertyType === 'function'));
      result = createChainedFunction(existingProperty, property);
    }
    Constructor[name] = result;
  }
}

/**
 * Merge two objects, but throw if both contain the same key.
 *
 * @param {object} one The first object, which is mutated.
 * @param {object} two The second object
 * @return {object} one after it has been mutated to contain everything in two.
 */
function mergeObjectsWithNoDuplicateKeys(one, two) {
  ("production" !== process.env.NODE_ENV ? invariant(
    one && two && typeof one === 'object' && typeof two === 'object',
    'mergeObjectsWithNoDuplicateKeys(): Cannot merge non-objects'
  ) : invariant(one && two && typeof one === 'object' && typeof two === 'object'));

  mapObject(two, function(value, key) {
    ("production" !== process.env.NODE_ENV ? invariant(
      one[key] === undefined,
      'mergeObjectsWithNoDuplicateKeys(): ' +
      'Tried to merge two objects with the same key: %s',
      key
    ) : invariant(one[key] === undefined));
    one[key] = value;
  });
  return one;
}

/**
 * Creates a function that invokes two functions and merges their return values.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createMergedResultFunction(one, two) {
  return function mergedResult() {
    var a = one.apply(this, arguments);
    var b = two.apply(this, arguments);
    if (a == null) {
      return b;
    } else if (b == null) {
      return a;
    }
    return mergeObjectsWithNoDuplicateKeys(a, b);
  };
}

/**
 * Creates a function that invokes two functions and ignores their return vales.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createChainedFunction(one, two) {
  return function chainedFunction() {
    one.apply(this, arguments);
    two.apply(this, arguments);
  };
}

/**
 * `ReactCompositeComponent` maintains an auxiliary life cycle state in
 * `this._compositeLifeCycleState` (which can be null).
 *
 * This is different from the life cycle state maintained by `ReactComponent` in
 * `this._lifeCycleState`. The following diagram shows how the states overlap in
 * time. There are times when the CompositeLifeCycle is null - at those times it
 * is only meaningful to look at ComponentLifeCycle alone.
 *
 * Top Row: ReactComponent.ComponentLifeCycle
 * Low Row: ReactComponent.CompositeLifeCycle
 *
 * +-------+------------------------------------------------------+--------+
 * |  UN   |                    MOUNTED                           |   UN   |
 * |MOUNTED|                                                      | MOUNTED|
 * +-------+------------------------------------------------------+--------+
 * |       ^--------+   +------+   +------+   +------+   +--------^        |
 * |       |        |   |      |   |      |   |      |   |        |        |
 * |    0--|MOUNTING|-0-|RECEIV|-0-|RECEIV|-0-|RECEIV|-0-|   UN   |--->0   |
 * |       |        |   |PROPS |   | PROPS|   | STATE|   |MOUNTING|        |
 * |       |        |   |      |   |      |   |      |   |        |        |
 * |       |        |   |      |   |      |   |      |   |        |        |
 * |       +--------+   +------+   +------+   +------+   +--------+        |
 * |       |                                                      |        |
 * +-------+------------------------------------------------------+--------+
 */
var CompositeLifeCycle = keyMirror({
  /**
   * Components in the process of being mounted respond to state changes
   * differently.
   */
  MOUNTING: null,
  /**
   * Components in the process of being unmounted are guarded against state
   * changes.
   */
  UNMOUNTING: null,
  /**
   * Components that are mounted and receiving new props respond to state
   * changes differently.
   */
  RECEIVING_PROPS: null,
  /**
   * Components that are mounted and receiving new state are guarded against
   * additional state changes.
   */
  RECEIVING_STATE: null
});

/**
 * @lends {ReactCompositeComponent.prototype}
 */
var ReactCompositeComponentMixin = {

  /**
   * Base constructor for all composite component.
   *
   * @param {ReactDescriptor} descriptor
   * @final
   * @internal
   */
  construct: function(descriptor) {
    // Children can be either an array or more than one argument
    ReactComponent.Mixin.construct.apply(this, arguments);
    ReactOwner.Mixin.construct.apply(this, arguments);

    this.state = null;
    this._pendingState = null;

    // This is the public post-processed context. The real context and pending
    // context lives on the descriptor.
    this.context = null;

    this._compositeLifeCycleState = null;
  },

  /**
   * Checks whether or not this composite component is mounted.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function() {
    return ReactComponent.Mixin.isMounted.call(this) &&
      this._compositeLifeCycleState !== CompositeLifeCycle.MOUNTING;
  },

  /**
   * Initializes the component, renders markup, and registers event listeners.
   *
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {number} mountDepth number of components in the owner hierarchy
   * @return {?string} Rendered markup to be inserted into the DOM.
   * @final
   * @internal
   */
  mountComponent: ReactPerf.measure(
    'ReactCompositeComponent',
    'mountComponent',
    function(rootID, transaction, mountDepth) {
      ReactComponent.Mixin.mountComponent.call(
        this,
        rootID,
        transaction,
        mountDepth
      );
      this._compositeLifeCycleState = CompositeLifeCycle.MOUNTING;

      if (this.__reactAutoBindMap) {
        this._bindAutoBindMethods();
      }

      this.context = this._processContext(this._descriptor._context);
      this.props = this._processProps(this.props);

      this.state = this.getInitialState ? this.getInitialState() : null;
      ("production" !== process.env.NODE_ENV ? invariant(
        typeof this.state === 'object' && !Array.isArray(this.state),
        '%s.getInitialState(): must return an object or null',
        this.constructor.displayName || 'ReactCompositeComponent'
      ) : invariant(typeof this.state === 'object' && !Array.isArray(this.state)));

      this._pendingState = null;
      this._pendingForceUpdate = false;

      if (this.componentWillMount) {
        this.componentWillMount();
        // When mounting, calls to `setState` by `componentWillMount` will set
        // `this._pendingState` without triggering a re-render.
        if (this._pendingState) {
          this.state = this._pendingState;
          this._pendingState = null;
        }
      }

      this._renderedComponent = instantiateReactComponent(
        this._renderValidatedComponent()
      );

      // Done with mounting, `setState` will now trigger UI changes.
      this._compositeLifeCycleState = null;
      var markup = this._renderedComponent.mountComponent(
        rootID,
        transaction,
        mountDepth + 1
      );
      if (this.componentDidMount) {
        transaction.getReactMountReady().enqueue(this.componentDidMount, this);
      }
      return markup;
    }
  ),

  /**
   * Releases any resources allocated by `mountComponent`.
   *
   * @final
   * @internal
   */
  unmountComponent: function() {
    this._compositeLifeCycleState = CompositeLifeCycle.UNMOUNTING;
    if (this.componentWillUnmount) {
      this.componentWillUnmount();
    }
    this._compositeLifeCycleState = null;

    this._renderedComponent.unmountComponent();
    this._renderedComponent = null;

    ReactComponent.Mixin.unmountComponent.call(this);

    // Some existing components rely on this.props even after they've been
    // destroyed (in event handlers).
    // TODO: this.props = null;
    // TODO: this.state = null;
  },

  /**
   * Sets a subset of the state. Always use this or `replaceState` to mutate
   * state. You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * There is no guarantee that calls to `setState` will run synchronously,
   * as they may eventually be batched together.  You can provide an optional
   * callback that will be executed when the call to setState is actually
   * completed.
   *
   * @param {object} partialState Next partial state to be merged with state.
   * @param {?function} callback Called after state is updated.
   * @final
   * @protected
   */
  setState: function(partialState, callback) {
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof partialState === 'object' || partialState == null,
      'setState(...): takes an object of state variables to update.'
    ) : invariant(typeof partialState === 'object' || partialState == null));
    if ("production" !== process.env.NODE_ENV){
      ("production" !== process.env.NODE_ENV ? warning(
        partialState != null,
        'setState(...): You passed an undefined or null state object; ' +
        'instead, use forceUpdate().'
      ) : null);
    }
    // Merge with `_pendingState` if it exists, otherwise with existing state.
    this.replaceState(
      merge(this._pendingState || this.state, partialState),
      callback
    );
  },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {object} completeState Next state.
   * @param {?function} callback Called after state is updated.
   * @final
   * @protected
   */
  replaceState: function(completeState, callback) {
    validateLifeCycleOnReplaceState(this);
    this._pendingState = completeState;
    if (this._compositeLifeCycleState !== CompositeLifeCycle.MOUNTING) {
      // If we're in a componentWillMount handler, don't enqueue a rerender
      // because ReactUpdates assumes we're in a browser context (which is wrong
      // for server rendering) and we're about to do a render anyway.
      // TODO: The callback here is ignored when setState is called from
      // componentWillMount. Either fix it or disallow doing so completely in
      // favor of getInitialState.
      ReactUpdates.enqueueUpdate(this, callback);
    }
  },

  /**
   * Filters the context object to only contain keys specified in
   * `contextTypes`, and asserts that they are valid.
   *
   * @param {object} context
   * @return {?object}
   * @private
   */
  _processContext: function(context) {
    var maskedContext = null;
    var contextTypes = this.constructor.contextTypes;
    if (contextTypes) {
      maskedContext = {};
      for (var contextName in contextTypes) {
        maskedContext[contextName] = context[contextName];
      }
      if ("production" !== process.env.NODE_ENV) {
        this._checkPropTypes(
          contextTypes,
          maskedContext,
          ReactPropTypeLocations.context
        );
      }
    }
    return maskedContext;
  },

  /**
   * @param {object} currentContext
   * @return {object}
   * @private
   */
  _processChildContext: function(currentContext) {
    var childContext = this.getChildContext && this.getChildContext();
    var displayName = this.constructor.displayName || 'ReactCompositeComponent';
    if (childContext) {
      ("production" !== process.env.NODE_ENV ? invariant(
        typeof this.constructor.childContextTypes === 'object',
        '%s.getChildContext(): childContextTypes must be defined in order to ' +
        'use getChildContext().',
        displayName
      ) : invariant(typeof this.constructor.childContextTypes === 'object'));
      if ("production" !== process.env.NODE_ENV) {
        this._checkPropTypes(
          this.constructor.childContextTypes,
          childContext,
          ReactPropTypeLocations.childContext
        );
      }
      for (var name in childContext) {
        ("production" !== process.env.NODE_ENV ? invariant(
          name in this.constructor.childContextTypes,
          '%s.getChildContext(): key "%s" is not defined in childContextTypes.',
          displayName,
          name
        ) : invariant(name in this.constructor.childContextTypes));
      }
      return merge(currentContext, childContext);
    }
    return currentContext;
  },

  /**
   * Processes props by setting default values for unspecified props and
   * asserting that the props are valid. Does not mutate its argument; returns
   * a new props object with defaults merged in.
   *
   * @param {object} newProps
   * @return {object}
   * @private
   */
  _processProps: function(newProps) {
    var defaultProps = this.constructor.defaultProps;
    var props;
    if (defaultProps) {
      props = merge(newProps);
      for (var propName in defaultProps) {
        if (typeof props[propName] === 'undefined') {
          props[propName] = defaultProps[propName];
        }
      }
    } else {
      props = newProps;
    }
    if ("production" !== process.env.NODE_ENV) {
      var propTypes = this.constructor.propTypes;
      if (propTypes) {
        this._checkPropTypes(propTypes, props, ReactPropTypeLocations.prop);
      }
    }
    return props;
  },

  /**
   * Assert that the props are valid
   *
   * @param {object} propTypes Map of prop name to a ReactPropType
   * @param {object} props
   * @param {string} location e.g. "prop", "context", "child context"
   * @private
   */
  _checkPropTypes: function(propTypes, props, location) {
    // TODO: Stop validating prop types here and only use the descriptor
    // validation.
    var componentName = this.constructor.displayName;
    for (var propName in propTypes) {
      if (propTypes.hasOwnProperty(propName)) {
        var error =
          propTypes[propName](props, propName, componentName, location);
        if (error instanceof Error) {
          // We may want to extend this logic for similar errors in
          // renderComponent calls, so I'm abstracting it away into
          // a function to minimize refactoring in the future
          var addendum = getDeclarationErrorAddendum(this);
          ("production" !== process.env.NODE_ENV ? warning(false, error.message + addendum) : null);
        }
      }
    }
  },

  /**
   * If any of `_pendingDescriptor`, `_pendingState`, or `_pendingForceUpdate`
   * is set, update the component.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  performUpdateIfNecessary: function(transaction) {
    var compositeLifeCycleState = this._compositeLifeCycleState;
    // Do not trigger a state transition if we are in the middle of mounting or
    // receiving props because both of those will already be doing this.
    if (compositeLifeCycleState === CompositeLifeCycle.MOUNTING ||
        compositeLifeCycleState === CompositeLifeCycle.RECEIVING_PROPS) {
      return;
    }

    if (this._pendingDescriptor == null &&
        this._pendingState == null &&
        !this._pendingForceUpdate) {
      return;
    }

    var nextContext = this.context;
    var nextProps = this.props;
    var nextDescriptor = this._descriptor;
    if (this._pendingDescriptor != null) {
      nextDescriptor = this._pendingDescriptor;
      nextContext = this._processContext(nextDescriptor._context);
      nextProps = this._processProps(nextDescriptor.props);
      this._pendingDescriptor = null;

      this._compositeLifeCycleState = CompositeLifeCycle.RECEIVING_PROPS;
      if (this.componentWillReceiveProps) {
        this.componentWillReceiveProps(nextProps, nextContext);
      }
    }

    this._compositeLifeCycleState = CompositeLifeCycle.RECEIVING_STATE;

    var nextState = this._pendingState || this.state;
    this._pendingState = null;

    try {
      var shouldUpdate =
        this._pendingForceUpdate ||
        !this.shouldComponentUpdate ||
        this.shouldComponentUpdate(nextProps, nextState, nextContext);

      if ("production" !== process.env.NODE_ENV) {
        if (typeof shouldUpdate === "undefined") {
          console.warn(
            (this.constructor.displayName || 'ReactCompositeComponent') +
            '.shouldComponentUpdate(): Returned undefined instead of a ' +
            'boolean value. Make sure to return true or false.'
          );
        }
      }

      if (shouldUpdate) {
        this._pendingForceUpdate = false;
        // Will set `this.props`, `this.state` and `this.context`.
        this._performComponentUpdate(
          nextDescriptor,
          nextProps,
          nextState,
          nextContext,
          transaction
        );
      } else {
        // If it's determined that a component should not update, we still want
        // to set props and state.
        this._descriptor = nextDescriptor;
        this.props = nextProps;
        this.state = nextState;
        this.context = nextContext;

        // Owner cannot change because shouldUpdateReactComponent doesn't allow
        // it. TODO: Remove this._owner completely.
        this._owner = nextDescriptor._owner;
      }
    } finally {
      this._compositeLifeCycleState = null;
    }
  },

  /**
   * Merges new props and state, notifies delegate methods of update and
   * performs update.
   *
   * @param {ReactDescriptor} nextDescriptor Next descriptor
   * @param {object} nextProps Next public object to set as properties.
   * @param {?object} nextState Next object to set as state.
   * @param {?object} nextContext Next public object to set as context.
   * @param {ReactReconcileTransaction} transaction
   * @private
   */
  _performComponentUpdate: function(
    nextDescriptor,
    nextProps,
    nextState,
    nextContext,
    transaction
  ) {
    var prevDescriptor = this._descriptor;
    var prevProps = this.props;
    var prevState = this.state;
    var prevContext = this.context;

    if (this.componentWillUpdate) {
      this.componentWillUpdate(nextProps, nextState, nextContext);
    }

    this._descriptor = nextDescriptor;
    this.props = nextProps;
    this.state = nextState;
    this.context = nextContext;

    // Owner cannot change because shouldUpdateReactComponent doesn't allow
    // it. TODO: Remove this._owner completely.
    this._owner = nextDescriptor._owner;

    this.updateComponent(
      transaction,
      prevDescriptor
    );

    if (this.componentDidUpdate) {
      transaction.getReactMountReady().enqueue(
        this.componentDidUpdate.bind(this, prevProps, prevState, prevContext),
        this
      );
    }
  },

  receiveComponent: function(nextDescriptor, transaction) {
    if (nextDescriptor === this._descriptor &&
        nextDescriptor._owner != null) {
      // Since descriptors are immutable after the owner is rendered,
      // we can do a cheap identity compare here to determine if this is a
      // superfluous reconcile. It's possible for state to be mutable but such
      // change should trigger an update of the owner which would recreate
      // the descriptor. We explicitly check for the existence of an owner since
      // it's possible for a descriptor created outside a composite to be
      // deeply mutated and reused.
      return;
    }

    ReactComponent.Mixin.receiveComponent.call(
      this,
      nextDescriptor,
      transaction
    );
  },

  /**
   * Updates the component's currently mounted DOM representation.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {ReactDescriptor} prevDescriptor
   * @internal
   * @overridable
   */
  updateComponent: ReactPerf.measure(
    'ReactCompositeComponent',
    'updateComponent',
    function(transaction, prevParentDescriptor) {
      ReactComponent.Mixin.updateComponent.call(
        this,
        transaction,
        prevParentDescriptor
      );

      var prevComponentInstance = this._renderedComponent;
      var prevDescriptor = prevComponentInstance._descriptor;
      var nextDescriptor = this._renderValidatedComponent();
      if (shouldUpdateReactComponent(prevDescriptor, nextDescriptor)) {
        prevComponentInstance.receiveComponent(nextDescriptor, transaction);
      } else {
        // These two IDs are actually the same! But nothing should rely on that.
        var thisID = this._rootNodeID;
        var prevComponentID = prevComponentInstance._rootNodeID;
        prevComponentInstance.unmountComponent();
        this._renderedComponent = instantiateReactComponent(nextDescriptor);
        var nextMarkup = this._renderedComponent.mountComponent(
          thisID,
          transaction,
          this._mountDepth + 1
        );
        ReactComponent.BackendIDOperations.dangerouslyReplaceNodeWithMarkupByID(
          prevComponentID,
          nextMarkup
        );
      }
    }
  ),

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldUpdateComponent`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {?function} callback Called after update is complete.
   * @final
   * @protected
   */
  forceUpdate: function(callback) {
    var compositeLifeCycleState = this._compositeLifeCycleState;
    ("production" !== process.env.NODE_ENV ? invariant(
      this.isMounted() ||
        compositeLifeCycleState === CompositeLifeCycle.MOUNTING,
      'forceUpdate(...): Can only force an update on mounted or mounting ' +
        'components.'
    ) : invariant(this.isMounted() ||
      compositeLifeCycleState === CompositeLifeCycle.MOUNTING));
    ("production" !== process.env.NODE_ENV ? invariant(
      compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE &&
      compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING,
      'forceUpdate(...): Cannot force an update while unmounting component ' +
      'or during an existing state transition (such as within `render`).'
    ) : invariant(compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE &&
    compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING));
    this._pendingForceUpdate = true;
    ReactUpdates.enqueueUpdate(this, callback);
  },

  /**
   * @private
   */
  _renderValidatedComponent: ReactPerf.measure(
    'ReactCompositeComponent',
    '_renderValidatedComponent',
    function() {
      var renderedComponent;
      var previousContext = ReactContext.current;
      ReactContext.current = this._processChildContext(
        this._descriptor._context
      );
      ReactCurrentOwner.current = this;
      try {
        renderedComponent = this.render();
        if (renderedComponent === null || renderedComponent === false) {
          renderedComponent = ReactEmptyComponent.getEmptyComponent();
          ReactEmptyComponent.registerNullComponentID(this._rootNodeID);
        } else {
          ReactEmptyComponent.deregisterNullComponentID(this._rootNodeID);
        }
      } finally {
        ReactContext.current = previousContext;
        ReactCurrentOwner.current = null;
      }
      ("production" !== process.env.NODE_ENV ? invariant(
        ReactDescriptor.isValidDescriptor(renderedComponent),
        '%s.render(): A valid ReactComponent must be returned. You may have ' +
          'returned undefined, an array or some other invalid object.',
        this.constructor.displayName || 'ReactCompositeComponent'
      ) : invariant(ReactDescriptor.isValidDescriptor(renderedComponent)));
      return renderedComponent;
    }
  ),

  /**
   * @private
   */
  _bindAutoBindMethods: function() {
    for (var autoBindKey in this.__reactAutoBindMap) {
      if (!this.__reactAutoBindMap.hasOwnProperty(autoBindKey)) {
        continue;
      }
      var method = this.__reactAutoBindMap[autoBindKey];
      this[autoBindKey] = this._bindAutoBindMethod(ReactErrorUtils.guard(
        method,
        this.constructor.displayName + '.' + autoBindKey
      ));
    }
  },

  /**
   * Binds a method to the component.
   *
   * @param {function} method Method to be bound.
   * @private
   */
  _bindAutoBindMethod: function(method) {
    var component = this;
    var boundMethod = function() {
      return method.apply(component, arguments);
    };
    if ("production" !== process.env.NODE_ENV) {
      boundMethod.__reactBoundContext = component;
      boundMethod.__reactBoundMethod = method;
      boundMethod.__reactBoundArguments = null;
      var componentName = component.constructor.displayName;
      var _bind = boundMethod.bind;
      boundMethod.bind = function(newThis ) {var args=Array.prototype.slice.call(arguments,1);
        // User is trying to bind() an autobound method; we effectively will
        // ignore the value of "this" that the user is trying to use, so
        // let's warn.
        if (newThis !== component && newThis !== null) {
          monitorCodeUse('react_bind_warning', { component: componentName });
          console.warn(
            'bind(): React component methods may only be bound to the ' +
            'component instance. See ' + componentName
          );
        } else if (!args.length) {
          monitorCodeUse('react_bind_warning', { component: componentName });
          console.warn(
            'bind(): You are binding a component method to the component. ' +
            'React does this for you automatically in a high-performance ' +
            'way, so you can safely remove this call. See ' + componentName
          );
          return boundMethod;
        }
        var reboundMethod = _bind.apply(boundMethod, arguments);
        reboundMethod.__reactBoundContext = component;
        reboundMethod.__reactBoundMethod = method;
        reboundMethod.__reactBoundArguments = args;
        return reboundMethod;
      };
    }
    return boundMethod;
  }
};

var ReactCompositeComponentBase = function() {};
mixInto(ReactCompositeComponentBase, ReactComponent.Mixin);
mixInto(ReactCompositeComponentBase, ReactOwner.Mixin);
mixInto(ReactCompositeComponentBase, ReactPropTransferer.Mixin);
mixInto(ReactCompositeComponentBase, ReactCompositeComponentMixin);

/**
 * Module for creating composite components.
 *
 * @class ReactCompositeComponent
 * @extends ReactComponent
 * @extends ReactOwner
 * @extends ReactPropTransferer
 */
var ReactCompositeComponent = {

  LifeCycle: CompositeLifeCycle,

  Base: ReactCompositeComponentBase,

  /**
   * Creates a composite component class given a class specification.
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
  createClass: function(spec) {
    var Constructor = function(props, owner) {
      this.construct(props, owner);
    };
    Constructor.prototype = new ReactCompositeComponentBase();
    Constructor.prototype.constructor = Constructor;

    injectedMixins.forEach(
      mixSpecIntoComponent.bind(null, Constructor)
    );

    mixSpecIntoComponent(Constructor, spec);

    // Initialize the defaultProps property after all mixins have been merged
    if (Constructor.getDefaultProps) {
      Constructor.defaultProps = Constructor.getDefaultProps();
    }

    ("production" !== process.env.NODE_ENV ? invariant(
      Constructor.prototype.render,
      'createClass(...): Class specification must implement a `render` method.'
    ) : invariant(Constructor.prototype.render));

    if ("production" !== process.env.NODE_ENV) {
      if (Constructor.prototype.componentShouldUpdate) {
        monitorCodeUse(
          'react_component_should_update_warning',
          { component: spec.displayName }
        );
        console.warn(
          (spec.displayName || 'A component') + ' has a method called ' +
          'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' +
          'The name is phrased as a question because the function is ' +
          'expected to return a value.'
         );
      }
    }

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactCompositeComponentInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    var descriptorFactory = ReactDescriptor.createFactory(Constructor);

    if ("production" !== process.env.NODE_ENV) {
      return ReactDescriptorValidator.createFactory(
        descriptorFactory,
        Constructor.propTypes,
        Constructor.contextTypes
      );
    }

    return descriptorFactory;
  },

  injection: {
    injectMixin: function(mixin) {
      injectedMixins.push(mixin);
    }
  }
};

module.exports = ReactCompositeComponent;

}).call(this,require('_process'))
},{"./ReactComponent":35,"./ReactContext":38,"./ReactCurrentOwner":39,"./ReactDescriptor":55,"./ReactDescriptorValidator":56,"./ReactEmptyComponent":57,"./ReactErrorUtils":58,"./ReactOwner":68,"./ReactPerf":69,"./ReactPropTransferer":70,"./ReactPropTypeLocationNames":71,"./ReactPropTypeLocations":72,"./ReactUpdates":80,"./instantiateReactComponent":123,"./invariant":124,"./keyMirror":130,"./mapObject":132,"./merge":134,"./mixInto":137,"./monitorCodeUse":138,"./shouldUpdateReactComponent":144,"./warning":147,"_process":3}],38:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactContext
 */

"use strict";

var merge = require("./merge");

/**
 * Keeps track of the current context.
 *
 * The context is automatically passed down the component ownership hierarchy
 * and is accessible via `this.context` on ReactCompositeComponents.
 */
var ReactContext = {

  /**
   * @internal
   * @type {object}
   */
  current: {},

  /**
   * Temporarily extends the current context while executing scopedCallback.
   *
   * A typical use case might look like
   *
   *  render: function() {
   *    var children = ReactContext.withContext({foo: 'foo'} () => (
   *
   *    ));
   *    return <div>{children}</div>;
   *  }
   *
   * @param {object} newContext New context to merge into the existing context
   * @param {function} scopedCallback Callback to run with the new context
   * @return {ReactComponent|array<ReactComponent>}
   */
  withContext: function(newContext, scopedCallback) {
    var result;
    var previousContext = ReactContext.current;
    ReactContext.current = merge(previousContext, newContext);
    try {
      result = scopedCallback();
    } finally {
      ReactContext.current = previousContext;
    }
    return result;
  }

};

module.exports = ReactContext;

},{"./merge":134}],39:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactCurrentOwner
 */

"use strict";

/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 *
 * The depth indicate how many composite components are above this render level.
 */
var ReactCurrentOwner = {

  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null

};

module.exports = ReactCurrentOwner;

},{}],40:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOM
 * @typechecks static-only
 */

"use strict";

var ReactDescriptor = require("./ReactDescriptor");
var ReactDescriptorValidator = require("./ReactDescriptorValidator");
var ReactDOMComponent = require("./ReactDOMComponent");

var mergeInto = require("./mergeInto");
var mapObject = require("./mapObject");

/**
 * Creates a new React class that is idempotent and capable of containing other
 * React components. It accepts event listeners and DOM properties that are
 * valid according to `DOMProperty`.
 *
 *  - Event listeners: `onClick`, `onMouseDown`, etc.
 *  - DOM properties: `className`, `name`, `title`, etc.
 *
 * The `style` property functions differently from the DOM API. It accepts an
 * object mapping of style properties to values.
 *
 * @param {boolean} omitClose True if the close tag should be omitted.
 * @param {string} tag Tag name (e.g. `div`).
 * @private
 */
function createDOMComponentClass(omitClose, tag) {
  var Constructor = function(descriptor) {
    this.construct(descriptor);
  };
  Constructor.prototype = new ReactDOMComponent(tag, omitClose);
  Constructor.prototype.constructor = Constructor;
  Constructor.displayName = tag;

  var ConvenienceConstructor = ReactDescriptor.createFactory(Constructor);

  if ("production" !== process.env.NODE_ENV) {
    return ReactDescriptorValidator.createFactory(
      ConvenienceConstructor
    );
  }

  return ConvenienceConstructor;
}

/**
 * Creates a mapping from supported HTML tags to `ReactDOMComponent` classes.
 * This is also accessible via `React.DOM`.
 *
 * @public
 */
var ReactDOM = mapObject({
  a: false,
  abbr: false,
  address: false,
  area: true,
  article: false,
  aside: false,
  audio: false,
  b: false,
  base: true,
  bdi: false,
  bdo: false,
  big: false,
  blockquote: false,
  body: false,
  br: true,
  button: false,
  canvas: false,
  caption: false,
  cite: false,
  code: false,
  col: true,
  colgroup: false,
  data: false,
  datalist: false,
  dd: false,
  del: false,
  details: false,
  dfn: false,
  dialog: false,
  div: false,
  dl: false,
  dt: false,
  em: false,
  embed: true,
  fieldset: false,
  figcaption: false,
  figure: false,
  footer: false,
  form: false, // NOTE: Injected, see `ReactDOMForm`.
  h1: false,
  h2: false,
  h3: false,
  h4: false,
  h5: false,
  h6: false,
  head: false,
  header: false,
  hr: true,
  html: false,
  i: false,
  iframe: false,
  img: true,
  input: true,
  ins: false,
  kbd: false,
  keygen: true,
  label: false,
  legend: false,
  li: false,
  link: true,
  main: false,
  map: false,
  mark: false,
  menu: false,
  menuitem: false, // NOTE: Close tag should be omitted, but causes problems.
  meta: true,
  meter: false,
  nav: false,
  noscript: false,
  object: false,
  ol: false,
  optgroup: false,
  option: false,
  output: false,
  p: false,
  param: true,
  picture: false,
  pre: false,
  progress: false,
  q: false,
  rp: false,
  rt: false,
  ruby: false,
  s: false,
  samp: false,
  script: false,
  section: false,
  select: false,
  small: false,
  source: true,
  span: false,
  strong: false,
  style: false,
  sub: false,
  summary: false,
  sup: false,
  table: false,
  tbody: false,
  td: false,
  textarea: false, // NOTE: Injected, see `ReactDOMTextarea`.
  tfoot: false,
  th: false,
  thead: false,
  time: false,
  title: false,
  tr: false,
  track: true,
  u: false,
  ul: false,
  'var': false,
  video: false,
  wbr: true,

  // SVG
  circle: false,
  defs: false,
  ellipse: false,
  g: false,
  line: false,
  linearGradient: false,
  mask: false,
  path: false,
  pattern: false,
  polygon: false,
  polyline: false,
  radialGradient: false,
  rect: false,
  stop: false,
  svg: false,
  text: false,
  tspan: false
}, createDOMComponentClass);

var injection = {
  injectComponentClasses: function(componentClasses) {
    mergeInto(ReactDOM, componentClasses);
  }
};

ReactDOM.injection = injection;

module.exports = ReactDOM;

}).call(this,require('_process'))
},{"./ReactDOMComponent":42,"./ReactDescriptor":55,"./ReactDescriptorValidator":56,"./mapObject":132,"./mergeInto":136,"_process":3}],41:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMButton
 */

"use strict";

var AutoFocusMixin = require("./AutoFocusMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

var keyMirror = require("./keyMirror");

// Store a reference to the <button> `ReactDOMComponent`.
var button = ReactDOM.button;

var mouseListenerNames = keyMirror({
  onClick: true,
  onDoubleClick: true,
  onMouseDown: true,
  onMouseMove: true,
  onMouseUp: true,
  onClickCapture: true,
  onDoubleClickCapture: true,
  onMouseDownCapture: true,
  onMouseMoveCapture: true,
  onMouseUpCapture: true
});

/**
 * Implements a <button> native component that does not receive mouse events
 * when `disabled` is set.
 */
var ReactDOMButton = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMButton',

  mixins: [AutoFocusMixin, ReactBrowserComponentMixin],

  render: function() {
    var props = {};

    // Copy the props; except the mouse listeners if we're disabled
    for (var key in this.props) {
      if (this.props.hasOwnProperty(key) &&
          (!this.props.disabled || !mouseListenerNames[key])) {
        props[key] = this.props[key];
      }
    }

    return button(props, this.props.children);
  }

});

module.exports = ReactDOMButton;

},{"./AutoFocusMixin":5,"./ReactBrowserComponentMixin":32,"./ReactCompositeComponent":37,"./ReactDOM":40,"./keyMirror":130}],42:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMComponent
 * @typechecks static-only
 */

"use strict";

var CSSPropertyOperations = require("./CSSPropertyOperations");
var DOMProperty = require("./DOMProperty");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactComponent = require("./ReactComponent");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactMount = require("./ReactMount");
var ReactMultiChild = require("./ReactMultiChild");
var ReactPerf = require("./ReactPerf");

var escapeTextForBrowser = require("./escapeTextForBrowser");
var invariant = require("./invariant");
var keyOf = require("./keyOf");
var merge = require("./merge");
var mixInto = require("./mixInto");

var deleteListener = ReactBrowserEventEmitter.deleteListener;
var listenTo = ReactBrowserEventEmitter.listenTo;
var registrationNameModules = ReactBrowserEventEmitter.registrationNameModules;

// For quickly matching children type, to test if can be treated as content.
var CONTENT_TYPES = {'string': true, 'number': true};

var STYLE = keyOf({style: null});

var ELEMENT_NODE_TYPE = 1;

/**
 * @param {?object} props
 */
function assertValidProps(props) {
  if (!props) {
    return;
  }
  // Note the use of `==` which checks for null or undefined.
  ("production" !== process.env.NODE_ENV ? invariant(
    props.children == null || props.dangerouslySetInnerHTML == null,
    'Can only set one of `children` or `props.dangerouslySetInnerHTML`.'
  ) : invariant(props.children == null || props.dangerouslySetInnerHTML == null));
  ("production" !== process.env.NODE_ENV ? invariant(
    props.style == null || typeof props.style === 'object',
    'The `style` prop expects a mapping from style properties to values, ' +
    'not a string.'
  ) : invariant(props.style == null || typeof props.style === 'object'));
}

function putListener(id, registrationName, listener, transaction) {
  var container = ReactMount.findReactContainerForID(id);
  if (container) {
    var doc = container.nodeType === ELEMENT_NODE_TYPE ?
      container.ownerDocument :
      container;
    listenTo(registrationName, doc);
  }
  transaction.getPutListenerQueue().enqueuePutListener(
    id,
    registrationName,
    listener
  );
}


/**
 * @constructor ReactDOMComponent
 * @extends ReactComponent
 * @extends ReactMultiChild
 */
function ReactDOMComponent(tag, omitClose) {
  this._tagOpen = '<' + tag;
  this._tagClose = omitClose ? '' : '</' + tag + '>';
  this.tagName = tag.toUpperCase();
}

ReactDOMComponent.Mixin = {

  /**
   * Generates root tag markup then recurses. This method has side effects and
   * is not idempotent.
   *
   * @internal
   * @param {string} rootID The root DOM ID for this node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {number} mountDepth number of components in the owner hierarchy
   * @return {string} The computed markup.
   */
  mountComponent: ReactPerf.measure(
    'ReactDOMComponent',
    'mountComponent',
    function(rootID, transaction, mountDepth) {
      ReactComponent.Mixin.mountComponent.call(
        this,
        rootID,
        transaction,
        mountDepth
      );
      assertValidProps(this.props);
      return (
        this._createOpenTagMarkupAndPutListeners(transaction) +
        this._createContentMarkup(transaction) +
        this._tagClose
      );
    }
  ),

  /**
   * Creates markup for the open tag and all attributes.
   *
   * This method has side effects because events get registered.
   *
   * Iterating over object properties is faster than iterating over arrays.
   * @see http://jsperf.com/obj-vs-arr-iteration
   *
   * @private
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {string} Markup of opening tag.
   */
  _createOpenTagMarkupAndPutListeners: function(transaction) {
    var props = this.props;
    var ret = this._tagOpen;

    for (var propKey in props) {
      if (!props.hasOwnProperty(propKey)) {
        continue;
      }
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      if (registrationNameModules.hasOwnProperty(propKey)) {
        putListener(this._rootNodeID, propKey, propValue, transaction);
      } else {
        if (propKey === STYLE) {
          if (propValue) {
            propValue = props.style = merge(props.style);
          }
          propValue = CSSPropertyOperations.createMarkupForStyles(propValue);
        }
        var markup =
          DOMPropertyOperations.createMarkupForProperty(propKey, propValue);
        if (markup) {
          ret += ' ' + markup;
        }
      }
    }

    // For static pages, no need to put React ID and checksum. Saves lots of
    // bytes.
    if (transaction.renderToStaticMarkup) {
      return ret + '>';
    }

    var markupForID = DOMPropertyOperations.createMarkupForID(this._rootNodeID);
    return ret + ' ' + markupForID + '>';
  },

  /**
   * Creates markup for the content between the tags.
   *
   * @private
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {string} Content markup.
   */
  _createContentMarkup: function(transaction) {
    // Intentional use of != to avoid catching zero/false.
    var innerHTML = this.props.dangerouslySetInnerHTML;
    if (innerHTML != null) {
      if (innerHTML.__html != null) {
        return innerHTML.__html;
      }
    } else {
      var contentToUse =
        CONTENT_TYPES[typeof this.props.children] ? this.props.children : null;
      var childrenToUse = contentToUse != null ? null : this.props.children;
      if (contentToUse != null) {
        return escapeTextForBrowser(contentToUse);
      } else if (childrenToUse != null) {
        var mountImages = this.mountChildren(
          childrenToUse,
          transaction
        );
        return mountImages.join('');
      }
    }
    return '';
  },

  receiveComponent: function(nextDescriptor, transaction) {
    if (nextDescriptor === this._descriptor &&
        nextDescriptor._owner != null) {
      // Since descriptors are immutable after the owner is rendered,
      // we can do a cheap identity compare here to determine if this is a
      // superfluous reconcile. It's possible for state to be mutable but such
      // change should trigger an update of the owner which would recreate
      // the descriptor. We explicitly check for the existence of an owner since
      // it's possible for a descriptor created outside a composite to be
      // deeply mutated and reused.
      return;
    }

    ReactComponent.Mixin.receiveComponent.call(
      this,
      nextDescriptor,
      transaction
    );
  },

  /**
   * Updates a native DOM component after it has already been allocated and
   * attached to the DOM. Reconciles the root DOM node, then recurses.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {ReactDescriptor} prevDescriptor
   * @internal
   * @overridable
   */
  updateComponent: ReactPerf.measure(
    'ReactDOMComponent',
    'updateComponent',
    function(transaction, prevDescriptor) {
      assertValidProps(this._descriptor.props);
      ReactComponent.Mixin.updateComponent.call(
        this,
        transaction,
        prevDescriptor
      );
      this._updateDOMProperties(prevDescriptor.props, transaction);
      this._updateDOMChildren(prevDescriptor.props, transaction);
    }
  ),

  /**
   * Reconciles the properties by detecting differences in property values and
   * updating the DOM as necessary. This function is probably the single most
   * critical path for performance optimization.
   *
   * TODO: Benchmark whether checking for changed values in memory actually
   *       improves performance (especially statically positioned elements).
   * TODO: Benchmark the effects of putting this at the top since 99% of props
   *       do not change for a given reconciliation.
   * TODO: Benchmark areas that can be improved with caching.
   *
   * @private
   * @param {object} lastProps
   * @param {ReactReconcileTransaction} transaction
   */
  _updateDOMProperties: function(lastProps, transaction) {
    var nextProps = this.props;
    var propKey;
    var styleName;
    var styleUpdates;
    for (propKey in lastProps) {
      if (nextProps.hasOwnProperty(propKey) ||
         !lastProps.hasOwnProperty(propKey)) {
        continue;
      }
      if (propKey === STYLE) {
        var lastStyle = lastProps[propKey];
        for (styleName in lastStyle) {
          if (lastStyle.hasOwnProperty(styleName)) {
            styleUpdates = styleUpdates || {};
            styleUpdates[styleName] = '';
          }
        }
      } else if (registrationNameModules.hasOwnProperty(propKey)) {
        deleteListener(this._rootNodeID, propKey);
      } else if (
          DOMProperty.isStandardName[propKey] ||
          DOMProperty.isCustomAttribute(propKey)) {
        ReactComponent.BackendIDOperations.deletePropertyByID(
          this._rootNodeID,
          propKey
        );
      }
    }
    for (propKey in nextProps) {
      var nextProp = nextProps[propKey];
      var lastProp = lastProps[propKey];
      if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp) {
        continue;
      }
      if (propKey === STYLE) {
        if (nextProp) {
          nextProp = nextProps.style = merge(nextProp);
        }
        if (lastProp) {
          // Unset styles on `lastProp` but not on `nextProp`.
          for (styleName in lastProp) {
            if (lastProp.hasOwnProperty(styleName) &&
                (!nextProp || !nextProp.hasOwnProperty(styleName))) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = '';
            }
          }
          // Update styles that changed since `lastProp`.
          for (styleName in nextProp) {
            if (nextProp.hasOwnProperty(styleName) &&
                lastProp[styleName] !== nextProp[styleName]) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = nextProp[styleName];
            }
          }
        } else {
          // Relies on `updateStylesByID` not mutating `styleUpdates`.
          styleUpdates = nextProp;
        }
      } else if (registrationNameModules.hasOwnProperty(propKey)) {
        putListener(this._rootNodeID, propKey, nextProp, transaction);
      } else if (
          DOMProperty.isStandardName[propKey] ||
          DOMProperty.isCustomAttribute(propKey)) {
        ReactComponent.BackendIDOperations.updatePropertyByID(
          this._rootNodeID,
          propKey,
          nextProp
        );
      }
    }
    if (styleUpdates) {
      ReactComponent.BackendIDOperations.updateStylesByID(
        this._rootNodeID,
        styleUpdates
      );
    }
  },

  /**
   * Reconciles the children with the various properties that affect the
   * children content.
   *
   * @param {object} lastProps
   * @param {ReactReconcileTransaction} transaction
   */
  _updateDOMChildren: function(lastProps, transaction) {
    var nextProps = this.props;

    var lastContent =
      CONTENT_TYPES[typeof lastProps.children] ? lastProps.children : null;
    var nextContent =
      CONTENT_TYPES[typeof nextProps.children] ? nextProps.children : null;

    var lastHtml =
      lastProps.dangerouslySetInnerHTML &&
      lastProps.dangerouslySetInnerHTML.__html;
    var nextHtml =
      nextProps.dangerouslySetInnerHTML &&
      nextProps.dangerouslySetInnerHTML.__html;

    // Note the use of `!=` which checks for null or undefined.
    var lastChildren = lastContent != null ? null : lastProps.children;
    var nextChildren = nextContent != null ? null : nextProps.children;

    // If we're switching from children to content/html or vice versa, remove
    // the old content
    var lastHasContentOrHtml = lastContent != null || lastHtml != null;
    var nextHasContentOrHtml = nextContent != null || nextHtml != null;
    if (lastChildren != null && nextChildren == null) {
      this.updateChildren(null, transaction);
    } else if (lastHasContentOrHtml && !nextHasContentOrHtml) {
      this.updateTextContent('');
    }

    if (nextContent != null) {
      if (lastContent !== nextContent) {
        this.updateTextContent('' + nextContent);
      }
    } else if (nextHtml != null) {
      if (lastHtml !== nextHtml) {
        ReactComponent.BackendIDOperations.updateInnerHTMLByID(
          this._rootNodeID,
          nextHtml
        );
      }
    } else if (nextChildren != null) {
      this.updateChildren(nextChildren, transaction);
    }
  },

  /**
   * Destroys all event registrations for this instance. Does not remove from
   * the DOM. That must be done by the parent.
   *
   * @internal
   */
  unmountComponent: function() {
    this.unmountChildren();
    ReactBrowserEventEmitter.deleteAllListeners(this._rootNodeID);
    ReactComponent.Mixin.unmountComponent.call(this);
  }

};

mixInto(ReactDOMComponent, ReactComponent.Mixin);
mixInto(ReactDOMComponent, ReactDOMComponent.Mixin);
mixInto(ReactDOMComponent, ReactMultiChild.Mixin);
mixInto(ReactDOMComponent, ReactBrowserComponentMixin);

module.exports = ReactDOMComponent;

}).call(this,require('_process'))
},{"./CSSPropertyOperations":8,"./DOMProperty":14,"./DOMPropertyOperations":15,"./ReactBrowserComponentMixin":32,"./ReactBrowserEventEmitter":33,"./ReactComponent":35,"./ReactMount":65,"./ReactMultiChild":66,"./ReactPerf":69,"./escapeTextForBrowser":108,"./invariant":124,"./keyOf":131,"./merge":134,"./mixInto":137,"_process":3}],43:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMForm
 */

"use strict";

var EventConstants = require("./EventConstants");
var LocalEventTrapMixin = require("./LocalEventTrapMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

// Store a reference to the <form> `ReactDOMComponent`.
var form = ReactDOM.form;

/**
 * Since onSubmit doesn't bubble OR capture on the top level in IE8, we need
 * to capture it on the <form> element itself. There are lots of hacks we could
 * do to accomplish this, but the most reliable is to make <form> a
 * composite component and use `componentDidMount` to attach the event handlers.
 */
var ReactDOMForm = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMForm',

  mixins: [ReactBrowserComponentMixin, LocalEventTrapMixin],

  render: function() {
    // TODO: Instead of using `ReactDOM` directly, we should use JSX. However,
    // `jshint` fails to parse JSX so in order for linting to work in the open
    // source repo, we need to just use `ReactDOM.form`.
    return this.transferPropsTo(form(null, this.props.children));
  },

  componentDidMount: function() {
    this.trapBubbledEvent(EventConstants.topLevelTypes.topReset, 'reset');
    this.trapBubbledEvent(EventConstants.topLevelTypes.topSubmit, 'submit');
  }
});

module.exports = ReactDOMForm;

},{"./EventConstants":19,"./LocalEventTrapMixin":28,"./ReactBrowserComponentMixin":32,"./ReactCompositeComponent":37,"./ReactDOM":40}],44:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMIDOperations
 * @typechecks static-only
 */

/*jslint evil: true */

"use strict";

var CSSPropertyOperations = require("./CSSPropertyOperations");
var DOMChildrenOperations = require("./DOMChildrenOperations");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");

var invariant = require("./invariant");
var setInnerHTML = require("./setInnerHTML");

/**
 * Errors for properties that should not be updated with `updatePropertyById()`.
 *
 * @type {object}
 * @private
 */
var INVALID_PROPERTY_ERRORS = {
  dangerouslySetInnerHTML:
    '`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.',
  style: '`style` must be set using `updateStylesByID()`.'
};

/**
 * Operations used to process updates to DOM nodes. This is made injectable via
 * `ReactComponent.BackendIDOperations`.
 */
var ReactDOMIDOperations = {

  /**
   * Updates a DOM node with new property values. This should only be used to
   * update DOM properties in `DOMProperty`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} name A valid property name, see `DOMProperty`.
   * @param {*} value New value of the property.
   * @internal
   */
  updatePropertyByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'updatePropertyByID',
    function(id, name, value) {
      var node = ReactMount.getNode(id);
      ("production" !== process.env.NODE_ENV ? invariant(
        !INVALID_PROPERTY_ERRORS.hasOwnProperty(name),
        'updatePropertyByID(...): %s',
        INVALID_PROPERTY_ERRORS[name]
      ) : invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name)));

      // If we're updating to null or undefined, we should remove the property
      // from the DOM node instead of inadvertantly setting to a string. This
      // brings us in line with the same behavior we have on initial render.
      if (value != null) {
        DOMPropertyOperations.setValueForProperty(node, name, value);
      } else {
        DOMPropertyOperations.deleteValueForProperty(node, name);
      }
    }
  ),

  /**
   * Updates a DOM node to remove a property. This should only be used to remove
   * DOM properties in `DOMProperty`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} name A property name to remove, see `DOMProperty`.
   * @internal
   */
  deletePropertyByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'deletePropertyByID',
    function(id, name, value) {
      var node = ReactMount.getNode(id);
      ("production" !== process.env.NODE_ENV ? invariant(
        !INVALID_PROPERTY_ERRORS.hasOwnProperty(name),
        'updatePropertyByID(...): %s',
        INVALID_PROPERTY_ERRORS[name]
      ) : invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name)));
      DOMPropertyOperations.deleteValueForProperty(node, name, value);
    }
  ),

  /**
   * Updates a DOM node with new style values. If a value is specified as '',
   * the corresponding style property will be unset.
   *
   * @param {string} id ID of the node to update.
   * @param {object} styles Mapping from styles to values.
   * @internal
   */
  updateStylesByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'updateStylesByID',
    function(id, styles) {
      var node = ReactMount.getNode(id);
      CSSPropertyOperations.setValueForStyles(node, styles);
    }
  ),

  /**
   * Updates a DOM node's innerHTML.
   *
   * @param {string} id ID of the node to update.
   * @param {string} html An HTML string.
   * @internal
   */
  updateInnerHTMLByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'updateInnerHTMLByID',
    function(id, html) {
      var node = ReactMount.getNode(id);
      setInnerHTML(node, html);
    }
  ),

  /**
   * Updates a DOM node's text content set by `props.content`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} content Text content.
   * @internal
   */
  updateTextContentByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'updateTextContentByID',
    function(id, content) {
      var node = ReactMount.getNode(id);
      DOMChildrenOperations.updateTextContent(node, content);
    }
  ),

  /**
   * Replaces a DOM node that exists in the document with markup.
   *
   * @param {string} id ID of child to be replaced.
   * @param {string} markup Dangerous markup to inject in place of child.
   * @internal
   * @see {Danger.dangerouslyReplaceNodeWithMarkup}
   */
  dangerouslyReplaceNodeWithMarkupByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'dangerouslyReplaceNodeWithMarkupByID',
    function(id, markup) {
      var node = ReactMount.getNode(id);
      DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup(node, markup);
    }
  ),

  /**
   * Updates a component's children by processing a series of updates.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markup List of markup strings.
   * @internal
   */
  dangerouslyProcessChildrenUpdates: ReactPerf.measure(
    'ReactDOMIDOperations',
    'dangerouslyProcessChildrenUpdates',
    function(updates, markup) {
      for (var i = 0; i < updates.length; i++) {
        updates[i].parentNode = ReactMount.getNode(updates[i].parentID);
      }
      DOMChildrenOperations.processUpdates(updates, markup);
    }
  )
};

module.exports = ReactDOMIDOperations;

}).call(this,require('_process'))
},{"./CSSPropertyOperations":8,"./DOMChildrenOperations":13,"./DOMPropertyOperations":15,"./ReactMount":65,"./ReactPerf":69,"./invariant":124,"./setInnerHTML":142,"_process":3}],45:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMImg
 */

"use strict";

var EventConstants = require("./EventConstants");
var LocalEventTrapMixin = require("./LocalEventTrapMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

// Store a reference to the <img> `ReactDOMComponent`.
var img = ReactDOM.img;

/**
 * Since onLoad doesn't bubble OR capture on the top level in IE8, we need to
 * capture it on the <img> element itself. There are lots of hacks we could do
 * to accomplish this, but the most reliable is to make <img> a composite
 * component and use `componentDidMount` to attach the event handlers.
 */
var ReactDOMImg = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMImg',
  tagName: 'IMG',

  mixins: [ReactBrowserComponentMixin, LocalEventTrapMixin],

  render: function() {
    return img(this.props);
  },

  componentDidMount: function() {
    this.trapBubbledEvent(EventConstants.topLevelTypes.topLoad, 'load');
    this.trapBubbledEvent(EventConstants.topLevelTypes.topError, 'error');
  }
});

module.exports = ReactDOMImg;

},{"./EventConstants":19,"./LocalEventTrapMixin":28,"./ReactBrowserComponentMixin":32,"./ReactCompositeComponent":37,"./ReactDOM":40}],46:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMInput
 */

"use strict";

var AutoFocusMixin = require("./AutoFocusMixin");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var LinkedValueUtils = require("./LinkedValueUtils");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");
var ReactMount = require("./ReactMount");

var invariant = require("./invariant");
var merge = require("./merge");

// Store a reference to the <input> `ReactDOMComponent`.
var input = ReactDOM.input;

var instancesByReactID = {};

/**
 * Implements an <input> native component that allows setting these optional
 * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
 *
 * If `checked` or `value` are not supplied (or null/undefined), user actions
 * that affect the checked state or value will trigger updates to the element.
 *
 * If they are supplied (and not null/undefined), the rendered element will not
 * trigger updates to the element. Instead, the props must change in order for
 * the rendered element to be updated.
 *
 * The rendered element will be initialized as unchecked (or `defaultChecked`)
 * with an empty value (or `defaultValue`).
 *
 * @see http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
 */
var ReactDOMInput = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMInput',

  mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],

  getInitialState: function() {
    var defaultValue = this.props.defaultValue;
    return {
      checked: this.props.defaultChecked || false,
      value: defaultValue != null ? defaultValue : null
    };
  },

  shouldComponentUpdate: function() {
    // Defer any updates to this component during the `onChange` handler.
    return !this._isChanging;
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = merge(this.props);

    props.defaultChecked = null;
    props.defaultValue = null;

    var value = LinkedValueUtils.getValue(this);
    props.value = value != null ? value : this.state.value;

    var checked = LinkedValueUtils.getChecked(this);
    props.checked = checked != null ? checked : this.state.checked;

    props.onChange = this._handleChange;

    return input(props, this.props.children);
  },

  componentDidMount: function() {
    var id = ReactMount.getID(this.getDOMNode());
    instancesByReactID[id] = this;
  },

  componentWillUnmount: function() {
    var rootNode = this.getDOMNode();
    var id = ReactMount.getID(rootNode);
    delete instancesByReactID[id];
  },

  componentDidUpdate: function(prevProps, prevState, prevContext) {
    var rootNode = this.getDOMNode();
    if (this.props.checked != null) {
      DOMPropertyOperations.setValueForProperty(
        rootNode,
        'checked',
        this.props.checked || false
      );
    }

    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      DOMPropertyOperations.setValueForProperty(rootNode, 'value', '' + value);
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      this._isChanging = true;
      returnValue = onChange.call(this, event);
      this._isChanging = false;
    }
    this.setState({
      checked: event.target.checked,
      value: event.target.value
    });

    var name = this.props.name;
    if (this.props.type === 'radio' && name != null) {
      var rootNode = this.getDOMNode();
      var queryRoot = rootNode;

      while (queryRoot.parentNode) {
        queryRoot = queryRoot.parentNode;
      }

      // If `rootNode.form` was non-null, then we could try `form.elements`,
      // but that sometimes behaves strangely in IE8. We could also try using
      // `form.getElementsByName`, but that will only return direct children
      // and won't include inputs that use the HTML5 `form=` attribute. Since
      // the input might not even be in a form, let's just use the global
      // `querySelectorAll` to ensure we don't miss anything.
      var group = queryRoot.querySelectorAll(
        'input[name=' + JSON.stringify('' + name) + '][type="radio"]');

      for (var i = 0, groupLen = group.length; i < groupLen; i++) {
        var otherNode = group[i];
        if (otherNode === rootNode ||
            otherNode.form !== rootNode.form) {
          continue;
        }
        var otherID = ReactMount.getID(otherNode);
        ("production" !== process.env.NODE_ENV ? invariant(
          otherID,
          'ReactDOMInput: Mixing React and non-React radio inputs with the ' +
          'same `name` is not supported.'
        ) : invariant(otherID));
        var otherInstance = instancesByReactID[otherID];
        ("production" !== process.env.NODE_ENV ? invariant(
          otherInstance,
          'ReactDOMInput: Unknown radio button ID %s.',
          otherID
        ) : invariant(otherInstance));
        // In some cases, this will actually change the `checked` state value.
        // In other cases, there's no change but this forces a reconcile upon
        // which componentDidUpdate will reset the DOM property to whatever it
        // should be.
        otherInstance.setState({
          checked: false
        });
      }
    }

    return returnValue;
  }

});

module.exports = ReactDOMInput;

}).call(this,require('_process'))
},{"./AutoFocusMixin":5,"./DOMPropertyOperations":15,"./LinkedValueUtils":27,"./ReactBrowserComponentMixin":32,"./ReactCompositeComponent":37,"./ReactDOM":40,"./ReactMount":65,"./invariant":124,"./merge":134,"_process":3}],47:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMOption
 */

"use strict";

var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

var warning = require("./warning");

// Store a reference to the <option> `ReactDOMComponent`.
var option = ReactDOM.option;

/**
 * Implements an <option> native component that warns when `selected` is set.
 */
var ReactDOMOption = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMOption',

  mixins: [ReactBrowserComponentMixin],

  componentWillMount: function() {
    // TODO (yungsters): Remove support for `selected` in <option>.
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(
        this.props.selected == null,
        'Use the `defaultValue` or `value` props on <select> instead of ' +
        'setting `selected` on <option>.'
      ) : null);
    }
  },

  render: function() {
    return option(this.props, this.props.children);
  }

});

module.exports = ReactDOMOption;

}).call(this,require('_process'))
},{"./ReactBrowserComponentMixin":32,"./ReactCompositeComponent":37,"./ReactDOM":40,"./warning":147,"_process":3}],48:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMSelect
 */

"use strict";

var AutoFocusMixin = require("./AutoFocusMixin");
var LinkedValueUtils = require("./LinkedValueUtils");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

var merge = require("./merge");

// Store a reference to the <select> `ReactDOMComponent`.
var select = ReactDOM.select;

/**
 * Validation function for `value` and `defaultValue`.
 * @private
 */
function selectValueType(props, propName, componentName) {
  if (props[propName] == null) {
    return;
  }
  if (props.multiple) {
    if (!Array.isArray(props[propName])) {
      return new Error(
        ("The `" + propName + "` prop supplied to <select> must be an array if ") +
        ("`multiple` is true.")
      );
    }
  } else {
    if (Array.isArray(props[propName])) {
      return new Error(
        ("The `" + propName + "` prop supplied to <select> must be a scalar ") +
        ("value if `multiple` is false.")
      );
    }
  }
}

/**
 * If `value` is supplied, updates <option> elements on mount and update.
 * @param {ReactComponent} component Instance of ReactDOMSelect
 * @param {?*} propValue For uncontrolled components, null/undefined. For
 * controlled components, a string (or with `multiple`, a list of strings).
 * @private
 */
function updateOptions(component, propValue) {
  var multiple = component.props.multiple;
  var value = propValue != null ? propValue : component.state.value;
  var options = component.getDOMNode().options;
  var selectedValue, i, l;
  if (multiple) {
    selectedValue = {};
    for (i = 0, l = value.length; i < l; ++i) {
      selectedValue['' + value[i]] = true;
    }
  } else {
    selectedValue = '' + value;
  }
  for (i = 0, l = options.length; i < l; i++) {
    var selected = multiple ?
      selectedValue.hasOwnProperty(options[i].value) :
      options[i].value === selectedValue;

    if (selected !== options[i].selected) {
      options[i].selected = selected;
    }
  }
}

/**
 * Implements a <select> native component that allows optionally setting the
 * props `value` and `defaultValue`. If `multiple` is false, the prop must be a
 * string. If `multiple` is true, the prop must be an array of strings.
 *
 * If `value` is not supplied (or null/undefined), user actions that change the
 * selected option will trigger updates to the rendered options.
 *
 * If it is supplied (and not null/undefined), the rendered options will not
 * update in response to user actions. Instead, the `value` prop must change in
 * order for the rendered options to update.
 *
 * If `defaultValue` is provided, any options with the supplied values will be
 * selected.
 */
var ReactDOMSelect = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMSelect',

  mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],

  propTypes: {
    defaultValue: selectValueType,
    value: selectValueType
  },

  getInitialState: function() {
    return {value: this.props.defaultValue || (this.props.multiple ? [] : '')};
  },

  componentWillReceiveProps: function(nextProps) {
    if (!this.props.multiple && nextProps.multiple) {
      this.setState({value: [this.state.value]});
    } else if (this.props.multiple && !nextProps.multiple) {
      this.setState({value: this.state.value[0]});
    }
  },

  shouldComponentUpdate: function() {
    // Defer any updates to this component during the `onChange` handler.
    return !this._isChanging;
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = merge(this.props);

    props.onChange = this._handleChange;
    props.value = null;

    return select(props, this.props.children);
  },

  componentDidMount: function() {
    updateOptions(this, LinkedValueUtils.getValue(this));
  },

  componentDidUpdate: function(prevProps) {
    var value = LinkedValueUtils.getValue(this);
    var prevMultiple = !!prevProps.multiple;
    var multiple = !!this.props.multiple;
    if (value != null || prevMultiple !== multiple) {
      updateOptions(this, value);
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      this._isChanging = true;
      returnValue = onChange.call(this, event);
      this._isChanging = false;
    }

    var selectedValue;
    if (this.props.multiple) {
      selectedValue = [];
      var options = event.target.options;
      for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          selectedValue.push(options[i].value);
        }
      }
    } else {
      selectedValue = event.target.value;
    }

    this.setState({value: selectedValue});
    return returnValue;
  }

});

module.exports = ReactDOMSelect;

},{"./AutoFocusMixin":5,"./LinkedValueUtils":27,"./ReactBrowserComponentMixin":32,"./ReactCompositeComponent":37,"./ReactDOM":40,"./merge":134}],49:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMSelection
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var getNodeForCharacterOffset = require("./getNodeForCharacterOffset");
var getTextContentAccessor = require("./getTextContentAccessor");

/**
 * While `isCollapsed` is available on the Selection object and `collapsed`
 * is available on the Range object, IE11 sometimes gets them wrong.
 * If the anchor/focus nodes and offsets are the same, the range is collapsed.
 */
function isCollapsed(anchorNode, anchorOffset, focusNode, focusOffset) {
  return anchorNode === focusNode && anchorOffset === focusOffset;
}

/**
 * Get the appropriate anchor and focus node/offset pairs for IE.
 *
 * The catch here is that IE's selection API doesn't provide information
 * about whether the selection is forward or backward, so we have to
 * behave as though it's always forward.
 *
 * IE text differs from modern selection in that it behaves as though
 * block elements end with a new line. This means character offsets will
 * differ between the two APIs.
 *
 * @param {DOMElement} node
 * @return {object}
 */
function getIEOffsets(node) {
  var selection = document.selection;
  var selectedRange = selection.createRange();
  var selectedLength = selectedRange.text.length;

  // Duplicate selection so we can move range without breaking user selection.
  var fromStart = selectedRange.duplicate();
  fromStart.moveToElementText(node);
  fromStart.setEndPoint('EndToStart', selectedRange);

  var startOffset = fromStart.text.length;
  var endOffset = startOffset + selectedLength;

  return {
    start: startOffset,
    end: endOffset
  };
}

/**
 * @param {DOMElement} node
 * @return {?object}
 */
function getModernOffsets(node) {
  var selection = window.getSelection();

  if (selection.rangeCount === 0) {
    return null;
  }

  var anchorNode = selection.anchorNode;
  var anchorOffset = selection.anchorOffset;
  var focusNode = selection.focusNode;
  var focusOffset = selection.focusOffset;

  var currentRange = selection.getRangeAt(0);

  // If the node and offset values are the same, the selection is collapsed.
  // `Selection.isCollapsed` is available natively, but IE sometimes gets
  // this value wrong.
  var isSelectionCollapsed = isCollapsed(
    selection.anchorNode,
    selection.anchorOffset,
    selection.focusNode,
    selection.focusOffset
  );

  var rangeLength = isSelectionCollapsed ? 0 : currentRange.toString().length;

  var tempRange = currentRange.cloneRange();
  tempRange.selectNodeContents(node);
  tempRange.setEnd(currentRange.startContainer, currentRange.startOffset);

  var isTempRangeCollapsed = isCollapsed(
    tempRange.startContainer,
    tempRange.startOffset,
    tempRange.endContainer,
    tempRange.endOffset
  );

  var start = isTempRangeCollapsed ? 0 : tempRange.toString().length;
  var end = start + rangeLength;

  // Detect whether the selection is backward.
  var detectionRange = document.createRange();
  detectionRange.setStart(anchorNode, anchorOffset);
  detectionRange.setEnd(focusNode, focusOffset);
  var isBackward = detectionRange.collapsed;
  detectionRange.detach();

  return {
    start: isBackward ? end : start,
    end: isBackward ? start : end
  };
}

/**
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setIEOffsets(node, offsets) {
  var range = document.selection.createRange().duplicate();
  var start, end;

  if (typeof offsets.end === 'undefined') {
    start = offsets.start;
    end = start;
  } else if (offsets.start > offsets.end) {
    start = offsets.end;
    end = offsets.start;
  } else {
    start = offsets.start;
    end = offsets.end;
  }

  range.moveToElementText(node);
  range.moveStart('character', start);
  range.setEndPoint('EndToStart', range);
  range.moveEnd('character', end - start);
  range.select();
}

/**
 * In modern non-IE browsers, we can support both forward and backward
 * selections.
 *
 * Note: IE10+ supports the Selection object, but it does not support
 * the `extend` method, which means that even in modern IE, it's not possible
 * to programatically create a backward selection. Thus, for all IE
 * versions, we use the old IE API to create our selections.
 *
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setModernOffsets(node, offsets) {
  var selection = window.getSelection();

  var length = node[getTextContentAccessor()].length;
  var start = Math.min(offsets.start, length);
  var end = typeof offsets.end === 'undefined' ?
            start : Math.min(offsets.end, length);

  // IE 11 uses modern selection, but doesn't support the extend method.
  // Flip backward selections, so we can set with a single range.
  if (!selection.extend && start > end) {
    var temp = end;
    end = start;
    start = temp;
  }

  var startMarker = getNodeForCharacterOffset(node, start);
  var endMarker = getNodeForCharacterOffset(node, end);

  if (startMarker && endMarker) {
    var range = document.createRange();
    range.setStart(startMarker.node, startMarker.offset);
    selection.removeAllRanges();

    if (start > end) {
      selection.addRange(range);
      selection.extend(endMarker.node, endMarker.offset);
    } else {
      range.setEnd(endMarker.node, endMarker.offset);
      selection.addRange(range);
    }

    range.detach();
  }
}

var useIEOffsets = ExecutionEnvironment.canUseDOM && document.selection;

var ReactDOMSelection = {
  /**
   * @param {DOMElement} node
   */
  getOffsets: useIEOffsets ? getIEOffsets : getModernOffsets,

  /**
   * @param {DOMElement|DOMTextNode} node
   * @param {object} offsets
   */
  setOffsets: useIEOffsets ? setIEOffsets : setModernOffsets
};

module.exports = ReactDOMSelection;

},{"./ExecutionEnvironment":25,"./getNodeForCharacterOffset":117,"./getTextContentAccessor":119}],50:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMTextarea
 */

"use strict";

var AutoFocusMixin = require("./AutoFocusMixin");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var LinkedValueUtils = require("./LinkedValueUtils");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

var invariant = require("./invariant");
var merge = require("./merge");

var warning = require("./warning");

// Store a reference to the <textarea> `ReactDOMComponent`.
var textarea = ReactDOM.textarea;

/**
 * Implements a <textarea> native component that allows setting `value`, and
 * `defaultValue`. This differs from the traditional DOM API because value is
 * usually set as PCDATA children.
 *
 * If `value` is not supplied (or null/undefined), user actions that affect the
 * value will trigger updates to the element.
 *
 * If `value` is supplied (and not null/undefined), the rendered element will
 * not trigger updates to the element. Instead, the `value` prop must change in
 * order for the rendered element to be updated.
 *
 * The rendered element will be initialized with an empty value, the prop
 * `defaultValue` if specified, or the children content (deprecated).
 */
var ReactDOMTextarea = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMTextarea',

  mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],

  getInitialState: function() {
    var defaultValue = this.props.defaultValue;
    // TODO (yungsters): Remove support for children content in <textarea>.
    var children = this.props.children;
    if (children != null) {
      if ("production" !== process.env.NODE_ENV) {
        ("production" !== process.env.NODE_ENV ? warning(
          false,
          'Use the `defaultValue` or `value` props instead of setting ' +
          'children on <textarea>.'
        ) : null);
      }
      ("production" !== process.env.NODE_ENV ? invariant(
        defaultValue == null,
        'If you supply `defaultValue` on a <textarea>, do not pass children.'
      ) : invariant(defaultValue == null));
      if (Array.isArray(children)) {
        ("production" !== process.env.NODE_ENV ? invariant(
          children.length <= 1,
          '<textarea> can only have at most one child.'
        ) : invariant(children.length <= 1));
        children = children[0];
      }

      defaultValue = '' + children;
    }
    if (defaultValue == null) {
      defaultValue = '';
    }
    var value = LinkedValueUtils.getValue(this);
    return {
      // We save the initial value so that `ReactDOMComponent` doesn't update
      // `textContent` (unnecessary since we update value).
      // The initial value can be a boolean or object so that's why it's
      // forced to be a string.
      initialValue: '' + (value != null ? value : defaultValue)
    };
  },

  shouldComponentUpdate: function() {
    // Defer any updates to this component during the `onChange` handler.
    return !this._isChanging;
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = merge(this.props);

    ("production" !== process.env.NODE_ENV ? invariant(
      props.dangerouslySetInnerHTML == null,
      '`dangerouslySetInnerHTML` does not make sense on <textarea>.'
    ) : invariant(props.dangerouslySetInnerHTML == null));

    props.defaultValue = null;
    props.value = null;
    props.onChange = this._handleChange;

    // Always set children to the same thing. In IE9, the selection range will
    // get reset if `textContent` is mutated.
    return textarea(props, this.state.initialValue);
  },

  componentDidUpdate: function(prevProps, prevState, prevContext) {
    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      var rootNode = this.getDOMNode();
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      DOMPropertyOperations.setValueForProperty(rootNode, 'value', '' + value);
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      this._isChanging = true;
      returnValue = onChange.call(this, event);
      this._isChanging = false;
    }
    this.setState({value: event.target.value});
    return returnValue;
  }

});

module.exports = ReactDOMTextarea;

}).call(this,require('_process'))
},{"./AutoFocusMixin":5,"./DOMPropertyOperations":15,"./LinkedValueUtils":27,"./ReactBrowserComponentMixin":32,"./ReactCompositeComponent":37,"./ReactDOM":40,"./invariant":124,"./merge":134,"./warning":147,"_process":3}],51:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDefaultBatchingStrategy
 */

"use strict";

var ReactUpdates = require("./ReactUpdates");
var Transaction = require("./Transaction");

var emptyFunction = require("./emptyFunction");
var mixInto = require("./mixInto");

var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function() {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  }
};

var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)
};

var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];

function ReactDefaultBatchingStrategyTransaction() {
  this.reinitializeTransaction();
}

mixInto(ReactDefaultBatchingStrategyTransaction, Transaction.Mixin);
mixInto(ReactDefaultBatchingStrategyTransaction, {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  }
});

var transaction = new ReactDefaultBatchingStrategyTransaction();

var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,

  /**
   * Call the provided function in a context within which calls to `setState`
   * and friends are batched such that components aren't updated unnecessarily.
   */
  batchedUpdates: function(callback, a, b) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;

    ReactDefaultBatchingStrategy.isBatchingUpdates = true;

    // The code is written this way to avoid extra allocations
    if (alreadyBatchingUpdates) {
      callback(a, b);
    } else {
      transaction.perform(callback, null, a, b);
    }
  }
};

module.exports = ReactDefaultBatchingStrategy;

},{"./ReactUpdates":80,"./Transaction":96,"./emptyFunction":106,"./mixInto":137}],52:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDefaultInjection
 */

"use strict";

var BeforeInputEventPlugin = require("./BeforeInputEventPlugin");
var ChangeEventPlugin = require("./ChangeEventPlugin");
var ClientReactRootIndex = require("./ClientReactRootIndex");
var CompositionEventPlugin = require("./CompositionEventPlugin");
var DefaultEventPluginOrder = require("./DefaultEventPluginOrder");
var EnterLeaveEventPlugin = require("./EnterLeaveEventPlugin");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var HTMLDOMPropertyConfig = require("./HTMLDOMPropertyConfig");
var MobileSafariClickEventPlugin = require("./MobileSafariClickEventPlugin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactComponentBrowserEnvironment =
  require("./ReactComponentBrowserEnvironment");
var ReactDefaultBatchingStrategy = require("./ReactDefaultBatchingStrategy");
var ReactDOM = require("./ReactDOM");
var ReactDOMButton = require("./ReactDOMButton");
var ReactDOMForm = require("./ReactDOMForm");
var ReactDOMImg = require("./ReactDOMImg");
var ReactDOMInput = require("./ReactDOMInput");
var ReactDOMOption = require("./ReactDOMOption");
var ReactDOMSelect = require("./ReactDOMSelect");
var ReactDOMTextarea = require("./ReactDOMTextarea");
var ReactEventListener = require("./ReactEventListener");
var ReactInjection = require("./ReactInjection");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var SelectEventPlugin = require("./SelectEventPlugin");
var ServerReactRootIndex = require("./ServerReactRootIndex");
var SimpleEventPlugin = require("./SimpleEventPlugin");
var SVGDOMPropertyConfig = require("./SVGDOMPropertyConfig");

var createFullPageComponent = require("./createFullPageComponent");

function inject() {
  ReactInjection.EventEmitter.injectReactEventListener(
    ReactEventListener
  );

  /**
   * Inject modules for resolving DOM hierarchy and plugin ordering.
   */
  ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);
  ReactInjection.EventPluginHub.injectInstanceHandle(ReactInstanceHandles);
  ReactInjection.EventPluginHub.injectMount(ReactMount);

  /**
   * Some important event plugins included by default (without having to require
   * them).
   */
  ReactInjection.EventPluginHub.injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    CompositionEventPlugin: CompositionEventPlugin,
    MobileSafariClickEventPlugin: MobileSafariClickEventPlugin,
    SelectEventPlugin: SelectEventPlugin,
    BeforeInputEventPlugin: BeforeInputEventPlugin
  });

  ReactInjection.DOM.injectComponentClasses({
    button: ReactDOMButton,
    form: ReactDOMForm,
    img: ReactDOMImg,
    input: ReactDOMInput,
    option: ReactDOMOption,
    select: ReactDOMSelect,
    textarea: ReactDOMTextarea,

    html: createFullPageComponent(ReactDOM.html),
    head: createFullPageComponent(ReactDOM.head),
    body: createFullPageComponent(ReactDOM.body)
  });

  // This needs to happen after createFullPageComponent() otherwise the mixin
  // gets double injected.
  ReactInjection.CompositeComponent.injectMixin(ReactBrowserComponentMixin);

  ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
  ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);

  ReactInjection.EmptyComponent.injectEmptyComponent(ReactDOM.noscript);

  ReactInjection.Updates.injectReconcileTransaction(
    ReactComponentBrowserEnvironment.ReactReconcileTransaction
  );
  ReactInjection.Updates.injectBatchingStrategy(
    ReactDefaultBatchingStrategy
  );

  ReactInjection.RootIndex.injectCreateReactRootIndex(
    ExecutionEnvironment.canUseDOM ?
      ClientReactRootIndex.createReactRootIndex :
      ServerReactRootIndex.createReactRootIndex
  );

  ReactInjection.Component.injectEnvironment(ReactComponentBrowserEnvironment);

  if ("production" !== process.env.NODE_ENV) {
    var url = (ExecutionEnvironment.canUseDOM && window.location.href) || '';
    if ((/[?&]react_perf\b/).test(url)) {
      var ReactDefaultPerf = require("./ReactDefaultPerf");
      ReactDefaultPerf.start();
    }
  }
}

module.exports = {
  inject: inject
};

}).call(this,require('_process'))
},{"./BeforeInputEventPlugin":6,"./ChangeEventPlugin":10,"./ClientReactRootIndex":11,"./CompositionEventPlugin":12,"./DefaultEventPluginOrder":17,"./EnterLeaveEventPlugin":18,"./ExecutionEnvironment":25,"./HTMLDOMPropertyConfig":26,"./MobileSafariClickEventPlugin":29,"./ReactBrowserComponentMixin":32,"./ReactComponentBrowserEnvironment":36,"./ReactDOM":40,"./ReactDOMButton":41,"./ReactDOMForm":43,"./ReactDOMImg":45,"./ReactDOMInput":46,"./ReactDOMOption":47,"./ReactDOMSelect":48,"./ReactDOMTextarea":50,"./ReactDefaultBatchingStrategy":51,"./ReactDefaultPerf":53,"./ReactEventListener":60,"./ReactInjection":61,"./ReactInstanceHandles":63,"./ReactMount":65,"./SVGDOMPropertyConfig":81,"./SelectEventPlugin":82,"./ServerReactRootIndex":83,"./SimpleEventPlugin":84,"./createFullPageComponent":103,"_process":3}],53:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDefaultPerf
 * @typechecks static-only
 */

"use strict";

var DOMProperty = require("./DOMProperty");
var ReactDefaultPerfAnalysis = require("./ReactDefaultPerfAnalysis");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");

var performanceNow = require("./performanceNow");

function roundFloat(val) {
  return Math.floor(val * 100) / 100;
}

function addValue(obj, key, val) {
  obj[key] = (obj[key] || 0) + val;
}

var ReactDefaultPerf = {
  _allMeasurements: [], // last item in the list is the current one
  _mountStack: [0],
  _injected: false,

  start: function() {
    if (!ReactDefaultPerf._injected) {
      ReactPerf.injection.injectMeasure(ReactDefaultPerf.measure);
    }

    ReactDefaultPerf._allMeasurements.length = 0;
    ReactPerf.enableMeasure = true;
  },

  stop: function() {
    ReactPerf.enableMeasure = false;
  },

  getLastMeasurements: function() {
    return ReactDefaultPerf._allMeasurements;
  },

  printExclusive: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getExclusiveSummary(measurements);
    console.table(summary.map(function(item) {
      return {
        'Component class name': item.componentName,
        'Total inclusive time (ms)': roundFloat(item.inclusive),
        'Exclusive mount time (ms)': roundFloat(item.exclusive),
        'Exclusive render time (ms)': roundFloat(item.render),
        'Mount time per instance (ms)': roundFloat(item.exclusive / item.count),
        'Render time per instance (ms)': roundFloat(item.render / item.count),
        'Instances': item.count
      };
    }));
    // TODO: ReactDefaultPerfAnalysis.getTotalTime() does not return the correct
    // number.
  },

  printInclusive: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(measurements);
    console.table(summary.map(function(item) {
      return {
        'Owner > component': item.componentName,
        'Inclusive time (ms)': roundFloat(item.time),
        'Instances': item.count
      };
    }));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  printWasted: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(
      measurements,
      true
    );
    console.table(summary.map(function(item) {
      return {
        'Owner > component': item.componentName,
        'Wasted time (ms)': item.time,
        'Instances': item.count
      };
    }));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  printDOM: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getDOMSummary(measurements);
    console.table(summary.map(function(item) {
      var result = {};
      result[DOMProperty.ID_ATTRIBUTE_NAME] = item.id;
      result['type'] = item.type;
      result['args'] = JSON.stringify(item.args);
      return result;
    }));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  _recordWrite: function(id, fnName, totalTime, args) {
    // TODO: totalTime isn't that useful since it doesn't count paints/reflows
    var writes =
      ReactDefaultPerf
        ._allMeasurements[ReactDefaultPerf._allMeasurements.length - 1]
        .writes;
    writes[id] = writes[id] || [];
    writes[id].push({
      type: fnName,
      time: totalTime,
      args: args
    });
  },

  measure: function(moduleName, fnName, func) {
    return function() {var args=Array.prototype.slice.call(arguments,0);
      var totalTime;
      var rv;
      var start;

      if (fnName === '_renderNewRootComponent' ||
          fnName === 'flushBatchedUpdates') {
        // A "measurement" is a set of metrics recorded for each flush. We want
        // to group the metrics for a given flush together so we can look at the
        // components that rendered and the DOM operations that actually
        // happened to determine the amount of "wasted work" performed.
        ReactDefaultPerf._allMeasurements.push({
          exclusive: {},
          inclusive: {},
          render: {},
          counts: {},
          writes: {},
          displayNames: {},
          totalTime: 0
        });
        start = performanceNow();
        rv = func.apply(this, args);
        ReactDefaultPerf._allMeasurements[
          ReactDefaultPerf._allMeasurements.length - 1
        ].totalTime = performanceNow() - start;
        return rv;
      } else if (moduleName === 'ReactDOMIDOperations' ||
        moduleName === 'ReactComponentBrowserEnvironment') {
        start = performanceNow();
        rv = func.apply(this, args);
        totalTime = performanceNow() - start;

        if (fnName === 'mountImageIntoNode') {
          var mountID = ReactMount.getID(args[1]);
          ReactDefaultPerf._recordWrite(mountID, fnName, totalTime, args[0]);
        } else if (fnName === 'dangerouslyProcessChildrenUpdates') {
          // special format
          args[0].forEach(function(update) {
            var writeArgs = {};
            if (update.fromIndex !== null) {
              writeArgs.fromIndex = update.fromIndex;
            }
            if (update.toIndex !== null) {
              writeArgs.toIndex = update.toIndex;
            }
            if (update.textContent !== null) {
              writeArgs.textContent = update.textContent;
            }
            if (update.markupIndex !== null) {
              writeArgs.markup = args[1][update.markupIndex];
            }
            ReactDefaultPerf._recordWrite(
              update.parentID,
              update.type,
              totalTime,
              writeArgs
            );
          });
        } else {
          // basic format
          ReactDefaultPerf._recordWrite(
            args[0],
            fnName,
            totalTime,
            Array.prototype.slice.call(args, 1)
          );
        }
        return rv;
      } else if (moduleName === 'ReactCompositeComponent' && (
        fnName === 'mountComponent' ||
        fnName === 'updateComponent' || // TODO: receiveComponent()?
        fnName === '_renderValidatedComponent')) {

        var rootNodeID = fnName === 'mountComponent' ?
          args[0] :
          this._rootNodeID;
        var isRender = fnName === '_renderValidatedComponent';
        var isMount = fnName === 'mountComponent';

        var mountStack = ReactDefaultPerf._mountStack;
        var entry = ReactDefaultPerf._allMeasurements[
          ReactDefaultPerf._allMeasurements.length - 1
        ];

        if (isRender) {
          addValue(entry.counts, rootNodeID, 1);
        } else if (isMount) {
          mountStack.push(0);
        }

        start = performanceNow();
        rv = func.apply(this, args);
        totalTime = performanceNow() - start;

        if (isRender) {
          addValue(entry.render, rootNodeID, totalTime);
        } else if (isMount) {
          var subMountTime = mountStack.pop();
          mountStack[mountStack.length - 1] += totalTime;
          addValue(entry.exclusive, rootNodeID, totalTime - subMountTime);
          addValue(entry.inclusive, rootNodeID, totalTime);
        } else {
          addValue(entry.inclusive, rootNodeID, totalTime);
        }

        entry.displayNames[rootNodeID] = {
          current: this.constructor.displayName,
          owner: this._owner ? this._owner.constructor.displayName : '<root>'
        };

        return rv;
      } else {
        return func.apply(this, args);
      }
    };
  }
};

module.exports = ReactDefaultPerf;

},{"./DOMProperty":14,"./ReactDefaultPerfAnalysis":54,"./ReactMount":65,"./ReactPerf":69,"./performanceNow":141}],54:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDefaultPerfAnalysis
 */

var merge = require("./merge");

// Don't try to save users less than 1.2ms (a number I made up)
var DONT_CARE_THRESHOLD = 1.2;
var DOM_OPERATION_TYPES = {
  'mountImageIntoNode': 'set innerHTML',
  INSERT_MARKUP: 'set innerHTML',
  MOVE_EXISTING: 'move',
  REMOVE_NODE: 'remove',
  TEXT_CONTENT: 'set textContent',
  'updatePropertyByID': 'update attribute',
  'deletePropertyByID': 'delete attribute',
  'updateStylesByID': 'update styles',
  'updateInnerHTMLByID': 'set innerHTML',
  'dangerouslyReplaceNodeWithMarkupByID': 'replace'
};

function getTotalTime(measurements) {
  // TODO: return number of DOM ops? could be misleading.
  // TODO: measure dropped frames after reconcile?
  // TODO: log total time of each reconcile and the top-level component
  // class that triggered it.
  var totalTime = 0;
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    totalTime += measurement.totalTime;
  }
  return totalTime;
}

function getDOMSummary(measurements) {
  var items = [];
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var id;

    for (id in measurement.writes) {
      measurement.writes[id].forEach(function(write) {
        items.push({
          id: id,
          type: DOM_OPERATION_TYPES[write.type] || write.type,
          args: write.args
        });
      });
    }
  }
  return items;
}

function getExclusiveSummary(measurements) {
  var candidates = {};
  var displayName;

  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = merge(measurement.exclusive, measurement.inclusive);

    for (var id in allIDs) {
      displayName = measurement.displayNames[id].current;

      candidates[displayName] = candidates[displayName] || {
        componentName: displayName,
        inclusive: 0,
        exclusive: 0,
        render: 0,
        count: 0
      };
      if (measurement.render[id]) {
        candidates[displayName].render += measurement.render[id];
      }
      if (measurement.exclusive[id]) {
        candidates[displayName].exclusive += measurement.exclusive[id];
      }
      if (measurement.inclusive[id]) {
        candidates[displayName].inclusive += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[displayName].count += measurement.counts[id];
      }
    }
  }

  // Now make a sorted array with the results.
  var arr = [];
  for (displayName in candidates) {
    if (candidates[displayName].exclusive >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[displayName]);
    }
  }

  arr.sort(function(a, b) {
    return b.exclusive - a.exclusive;
  });

  return arr;
}

function getInclusiveSummary(measurements, onlyClean) {
  var candidates = {};
  var inclusiveKey;

  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = merge(measurement.exclusive, measurement.inclusive);
    var cleanComponents;

    if (onlyClean) {
      cleanComponents = getUnchangedComponents(measurement);
    }

    for (var id in allIDs) {
      if (onlyClean && !cleanComponents[id]) {
        continue;
      }

      var displayName = measurement.displayNames[id];

      // Inclusive time is not useful for many components without knowing where
      // they are instantiated. So we aggregate inclusive time with both the
      // owner and current displayName as the key.
      inclusiveKey = displayName.owner + ' > ' + displayName.current;

      candidates[inclusiveKey] = candidates[inclusiveKey] || {
        componentName: inclusiveKey,
        time: 0,
        count: 0
      };

      if (measurement.inclusive[id]) {
        candidates[inclusiveKey].time += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[inclusiveKey].count += measurement.counts[id];
      }
    }
  }

  // Now make a sorted array with the results.
  var arr = [];
  for (inclusiveKey in candidates) {
    if (candidates[inclusiveKey].time >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[inclusiveKey]);
    }
  }

  arr.sort(function(a, b) {
    return b.time - a.time;
  });

  return arr;
}

function getUnchangedComponents(measurement) {
  // For a given reconcile, look at which components did not actually
  // render anything to the DOM and return a mapping of their ID to
  // the amount of time it took to render the entire subtree.
  var cleanComponents = {};
  var dirtyLeafIDs = Object.keys(measurement.writes);
  var allIDs = merge(measurement.exclusive, measurement.inclusive);

  for (var id in allIDs) {
    var isDirty = false;
    // For each component that rendered, see if a component that triggerd
    // a DOM op is in its subtree.
    for (var i = 0; i < dirtyLeafIDs.length; i++) {
      if (dirtyLeafIDs[i].indexOf(id) === 0) {
        isDirty = true;
        break;
      }
    }
    if (!isDirty && measurement.counts[id] > 0) {
      cleanComponents[id] = true;
    }
  }
  return cleanComponents;
}

var ReactDefaultPerfAnalysis = {
  getExclusiveSummary: getExclusiveSummary,
  getInclusiveSummary: getInclusiveSummary,
  getDOMSummary: getDOMSummary,
  getTotalTime: getTotalTime
};

module.exports = ReactDefaultPerfAnalysis;

},{"./merge":134}],55:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDescriptor
 */

"use strict";

var ReactContext = require("./ReactContext");
var ReactCurrentOwner = require("./ReactCurrentOwner");

var merge = require("./merge");
var warning = require("./warning");

/**
 * Warn for mutations.
 *
 * @internal
 * @param {object} object
 * @param {string} key
 */
function defineWarningProperty(object, key) {
  Object.defineProperty(object, key, {

    configurable: false,
    enumerable: true,

    get: function() {
      if (!this._store) {
        return null;
      }
      return this._store[key];
    },

    set: function(value) {
      ("production" !== process.env.NODE_ENV ? warning(
        false,
        'Don\'t set the ' + key + ' property of the component. ' +
        'Mutate the existing props object instead.'
      ) : null);
      this._store[key] = value;
    }

  });
}

/**
 * This is updated to true if the membrane is successfully created.
 */
var useMutationMembrane = false;

/**
 * Warn for mutations.
 *
 * @internal
 * @param {object} descriptor
 */
function defineMutationMembrane(prototype) {
  try {
    var pseudoFrozenProperties = {
      props: true
    };
    for (var key in pseudoFrozenProperties) {
      defineWarningProperty(prototype, key);
    }
    useMutationMembrane = true;
  } catch (x) {
    // IE will fail on defineProperty
  }
}

/**
 * Transfer static properties from the source to the target. Functions are
 * rebound to have this reflect the original source.
 */
function proxyStaticMethods(target, source) {
  if (typeof source !== 'function') {
    return;
  }
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      var value = source[key];
      if (typeof value === 'function') {
        var bound = value.bind(source);
        // Copy any properties defined on the function, such as `isRequired` on
        // a PropTypes validator. (mergeInto refuses to work on functions.)
        for (var k in value) {
          if (value.hasOwnProperty(k)) {
            bound[k] = value[k];
          }
        }
        target[key] = bound;
      } else {
        target[key] = value;
      }
    }
  }
}

/**
 * Base constructor for all React descriptors. This is only used to make this
 * work with a dynamic instanceof check. Nothing should live on this prototype.
 *
 * @param {*} type
 * @internal
 */
var ReactDescriptor = function() {};

if ("production" !== process.env.NODE_ENV) {
  defineMutationMembrane(ReactDescriptor.prototype);
}

ReactDescriptor.createFactory = function(type) {

  var descriptorPrototype = Object.create(ReactDescriptor.prototype);

  var factory = function(props, children) {
    // For consistency we currently allocate a new object for every descriptor.
    // This protects the descriptor from being mutated by the original props
    // object being mutated. It also protects the original props object from
    // being mutated by children arguments and default props. This behavior
    // comes with a performance cost and could be deprecated in the future.
    // It could also be optimized with a smarter JSX transform.
    if (props == null) {
      props = {};
    } else if (typeof props === 'object') {
      props = merge(props);
    }

    // Children can be more than one argument, and those are transferred onto
    // the newly allocated props object.
    var childrenLength = arguments.length - 1;
    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);
      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 1];
      }
      props.children = childArray;
    }

    // Initialize the descriptor object
    var descriptor = Object.create(descriptorPrototype);

    // Record the component responsible for creating this descriptor.
    descriptor._owner = ReactCurrentOwner.current;

    // TODO: Deprecate withContext, and then the context becomes accessible
    // through the owner.
    descriptor._context = ReactContext.current;

    if ("production" !== process.env.NODE_ENV) {
      // The validation flag and props are currently mutative. We put them on
      // an external backing store so that we can freeze the whole object.
      // This can be replaced with a WeakMap once they are implemented in
      // commonly used development environments.
      descriptor._store = { validated: false, props: props };

      // We're not allowed to set props directly on the object so we early
      // return and rely on the prototype membrane to forward to the backing
      // store.
      if (useMutationMembrane) {
        Object.freeze(descriptor);
        return descriptor;
      }
    }

    descriptor.props = props;
    return descriptor;
  };

  // Currently we expose the prototype of the descriptor so that
  // <Foo /> instanceof Foo works. This is controversial pattern.
  factory.prototype = descriptorPrototype;

  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on descriptors. E.g. <Foo />.type === Foo.type and for
  // static methods like <Foo />.type.staticMethod();
  // This should not be named constructor since this may not be the function
  // that created the descriptor, and it may not even be a constructor.
  factory.type = type;
  descriptorPrototype.type = type;

  proxyStaticMethods(factory, type);

  // Expose a unique constructor on the prototype is that this works with type
  // systems that compare constructor properties: <Foo />.constructor === Foo
  // This may be controversial since it requires a known factory function.
  descriptorPrototype.constructor = factory;

  return factory;

};

ReactDescriptor.cloneAndReplaceProps = function(oldDescriptor, newProps) {
  var newDescriptor = Object.create(oldDescriptor.constructor.prototype);
  // It's important that this property order matches the hidden class of the
  // original descriptor to maintain perf.
  newDescriptor._owner = oldDescriptor._owner;
  newDescriptor._context = oldDescriptor._context;

  if ("production" !== process.env.NODE_ENV) {
    newDescriptor._store = {
      validated: oldDescriptor._store.validated,
      props: newProps
    };
    if (useMutationMembrane) {
      Object.freeze(newDescriptor);
      return newDescriptor;
    }
  }

  newDescriptor.props = newProps;
  return newDescriptor;
};

/**
 * Checks if a value is a valid descriptor constructor.
 *
 * @param {*}
 * @return {boolean}
 * @public
 */
ReactDescriptor.isValidFactory = function(factory) {
  return typeof factory === 'function' &&
         factory.prototype instanceof ReactDescriptor;
};

/**
 * @param {?object} object
 * @return {boolean} True if `object` is a valid component.
 * @final
 */
ReactDescriptor.isValidDescriptor = function(object) {
  return object instanceof ReactDescriptor;
};

module.exports = ReactDescriptor;

}).call(this,require('_process'))
},{"./ReactContext":38,"./ReactCurrentOwner":39,"./merge":134,"./warning":147,"_process":3}],56:[function(require,module,exports){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDescriptorValidator
 */

/**
 * ReactDescriptorValidator provides a wrapper around a descriptor factory
 * which validates the props passed to the descriptor. This is intended to be
 * used only in DEV and could be replaced by a static type checker for languages
 * that support it.
 */

"use strict";

var ReactDescriptor = require("./ReactDescriptor");
var ReactPropTypeLocations = require("./ReactPropTypeLocations");
var ReactCurrentOwner = require("./ReactCurrentOwner");

var monitorCodeUse = require("./monitorCodeUse");

/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */
var ownerHasKeyUseWarning = {
  'react_key_warning': {},
  'react_numeric_key_warning': {}
};
var ownerHasMonitoredObjectMap = {};

var loggedTypeFailures = {};

var NUMERIC_PROPERTY_REGEX = /^\d+$/;

/**
 * Gets the current owner's displayName for use in warnings.
 *
 * @internal
 * @return {?string} Display name or undefined
 */
function getCurrentOwnerDisplayName() {
  var current = ReactCurrentOwner.current;
  return current && current.constructor.displayName || undefined;
}

/**
 * Warn if the component doesn't have an explicit key assigned to it.
 * This component is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it.
 *
 * @internal
 * @param {ReactComponent} component Component that requires a key.
 * @param {*} parentType component's parent's type.
 */
function validateExplicitKey(component, parentType) {
  if (component._store.validated || component.props.key != null) {
    return;
  }
  component._store.validated = true;

  warnAndMonitorForKeyUse(
    'react_key_warning',
    'Each child in an array should have a unique "key" prop.',
    component,
    parentType
  );
}

/**
 * Warn if the key is being defined as an object property but has an incorrect
 * value.
 *
 * @internal
 * @param {string} name Property name of the key.
 * @param {ReactComponent} component Component that requires a key.
 * @param {*} parentType component's parent's type.
 */
function validatePropertyKey(name, component, parentType) {
  if (!NUMERIC_PROPERTY_REGEX.test(name)) {
    return;
  }
  warnAndMonitorForKeyUse(
    'react_numeric_key_warning',
    'Child objects should have non-numeric keys so ordering is preserved.',
    component,
    parentType
  );
}

/**
 * Shared warning and monitoring code for the key warnings.
 *
 * @internal
 * @param {string} warningID The id used when logging.
 * @param {string} message The base warning that gets output.
 * @param {ReactComponent} component Component that requires a key.
 * @param {*} parentType component's parent's type.
 */
function warnAndMonitorForKeyUse(warningID, message, component, parentType) {
  var ownerName = getCurrentOwnerDisplayName();
  var parentName = parentType.displayName;

  var useName = ownerName || parentName;
  var memoizer = ownerHasKeyUseWarning[warningID];
  if (memoizer.hasOwnProperty(useName)) {
    return;
  }
  memoizer[useName] = true;

  message += ownerName ?
    (" Check the render method of " + ownerName + ".") :
    (" Check the renderComponent call using <" + parentName + ">.");

  // Usually the current owner is the offender, but if it accepts children as a
  // property, it may be the creator of the child that's responsible for
  // assigning it a key.
  var childOwnerName = null;
  if (component._owner && component._owner !== ReactCurrentOwner.current) {
    // Name of the component that originally created this child.
    childOwnerName = component._owner.constructor.displayName;

    message += (" It was passed a child from " + childOwnerName + ".");
  }

  message += ' See http://fb.me/react-warning-keys for more information.';
  monitorCodeUse(warningID, {
    component: useName,
    componentOwner: childOwnerName
  });
  console.warn(message);
}

/**
 * Log that we're using an object map. We're considering deprecating this
 * feature and replace it with proper Map and ImmutableMap data structures.
 *
 * @internal
 */
function monitorUseOfObjectMap() {
  var currentName = getCurrentOwnerDisplayName() || '';
  if (ownerHasMonitoredObjectMap.hasOwnProperty(currentName)) {
    return;
  }
  ownerHasMonitoredObjectMap[currentName] = true;
  monitorCodeUse('react_object_map_children');
}

/**
 * Ensure that every component either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {*} component Statically passed child of any type.
 * @param {*} parentType component's parent's type.
 * @return {boolean}
 */
function validateChildKeys(component, parentType) {
  if (Array.isArray(component)) {
    for (var i = 0; i < component.length; i++) {
      var child = component[i];
      if (ReactDescriptor.isValidDescriptor(child)) {
        validateExplicitKey(child, parentType);
      }
    }
  } else if (ReactDescriptor.isValidDescriptor(component)) {
    // This component was passed in a valid location.
    component._store.validated = true;
  } else if (component && typeof component === 'object') {
    monitorUseOfObjectMap();
    for (var name in component) {
      validatePropertyKey(name, component[name], parentType);
    }
  }
}

/**
 * Assert that the props are valid
 *
 * @param {string} componentName Name of the component for error messages.
 * @param {object} propTypes Map of prop name to a ReactPropType
 * @param {object} props
 * @param {string} location e.g. "prop", "context", "child context"
 * @private
 */
function checkPropTypes(componentName, propTypes, props, location) {
  for (var propName in propTypes) {
    if (propTypes.hasOwnProperty(propName)) {
      var error;
      // Prop type validation may throw. In case they do, we don't want to
      // fail the render phase where it didn't fail before. So we log it.
      // After these have been cleaned up, we'll let them throw.
      try {
        error = propTypes[propName](props, propName, componentName, location);
      } catch (ex) {
        error = ex;
      }
      if (error instanceof Error && !(error.message in loggedTypeFailures)) {
        // Only monitor this failure once because there tends to be a lot of the
        // same error.
        loggedTypeFailures[error.message] = true;
        // This will soon use the warning module
        monitorCodeUse(
          'react_failed_descriptor_type_check',
          { message: error.message }
        );
      }
    }
  }
}

var ReactDescriptorValidator = {

  /**
   * Wraps a descriptor factory function in another function which validates
   * the props and context of the descriptor and warns about any failed type
   * checks.
   *
   * @param {function} factory The original descriptor factory
   * @param {object?} propTypes A prop type definition set
   * @param {object?} contextTypes A context type definition set
   * @return {object} The component descriptor, which may be invalid.
   * @private
   */
  createFactory: function(factory, propTypes, contextTypes) {
    var validatedFactory = function(props, children) {
      var descriptor = factory.apply(this, arguments);

      for (var i = 1; i < arguments.length; i++) {
        validateChildKeys(arguments[i], descriptor.type);
      }

      var name = descriptor.type.displayName;
      if (propTypes) {
        checkPropTypes(
          name,
          propTypes,
          descriptor.props,
          ReactPropTypeLocations.prop
        );
      }
      if (contextTypes) {
        checkPropTypes(
          name,
          contextTypes,
          descriptor._context,
          ReactPropTypeLocations.context
        );
      }
      return descriptor;
    };

    validatedFactory.prototype = factory.prototype;
    validatedFactory.type = factory.type;

    // Copy static properties
    for (var key in factory) {
      if (factory.hasOwnProperty(key)) {
        validatedFactory[key] = factory[key];
      }
    }

    return validatedFactory;
  }

};

module.exports = ReactDescriptorValidator;

},{"./ReactCurrentOwner":39,"./ReactDescriptor":55,"./ReactPropTypeLocations":72,"./monitorCodeUse":138}],57:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactEmptyComponent
 */

"use strict";

var invariant = require("./invariant");

var component;
// This registry keeps track of the React IDs of the components that rendered to
// `null` (in reality a placeholder such as `noscript`)
var nullComponentIdsRegistry = {};

var ReactEmptyComponentInjection = {
  injectEmptyComponent: function(emptyComponent) {
    component = emptyComponent;
  }
};

/**
 * @return {ReactComponent} component The injected empty component.
 */
function getEmptyComponent() {
  ("production" !== process.env.NODE_ENV ? invariant(
    component,
    'Trying to return null from a render, but no null placeholder component ' +
    'was injected.'
  ) : invariant(component));
  return component();
}

/**
 * Mark the component as having rendered to null.
 * @param {string} id Component's `_rootNodeID`.
 */
function registerNullComponentID(id) {
  nullComponentIdsRegistry[id] = true;
}

/**
 * Unmark the component as having rendered to null: it renders to something now.
 * @param {string} id Component's `_rootNodeID`.
 */
function deregisterNullComponentID(id) {
  delete nullComponentIdsRegistry[id];
}

/**
 * @param {string} id Component's `_rootNodeID`.
 * @return {boolean} True if the component is rendered to null.
 */
function isNullComponentID(id) {
  return nullComponentIdsRegistry[id];
}

var ReactEmptyComponent = {
  deregisterNullComponentID: deregisterNullComponentID,
  getEmptyComponent: getEmptyComponent,
  injection: ReactEmptyComponentInjection,
  isNullComponentID: isNullComponentID,
  registerNullComponentID: registerNullComponentID
};

module.exports = ReactEmptyComponent;

}).call(this,require('_process'))
},{"./invariant":124,"_process":3}],58:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactErrorUtils
 * @typechecks
 */

"use strict";

var ReactErrorUtils = {
  /**
   * Creates a guarded version of a function. This is supposed to make debugging
   * of event handlers easier. To aid debugging with the browser's debugger,
   * this currently simply returns the original function.
   *
   * @param {function} func Function to be executed
   * @param {string} name The name of the guard
   * @return {function}
   */
  guard: function(func, name) {
    return func;
  }
};

module.exports = ReactErrorUtils;

},{}],59:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactEventEmitterMixin
 */

"use strict";

var EventPluginHub = require("./EventPluginHub");

function runEventQueueInBatch(events) {
  EventPluginHub.enqueueEvents(events);
  EventPluginHub.processEventQueue();
}

var ReactEventEmitterMixin = {

  /**
   * Streams a fired top-level event to `EventPluginHub` where plugins have the
   * opportunity to create `ReactEvent`s to be dispatched.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {object} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native environment event.
   */
  handleTopLevel: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var events = EventPluginHub.extractEvents(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent
    );

    runEventQueueInBatch(events);
  }
};

module.exports = ReactEventEmitterMixin;

},{"./EventPluginHub":21}],60:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactEventListener
 * @typechecks static-only
 */

"use strict";

var EventListener = require("./EventListener");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var PooledClass = require("./PooledClass");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var ReactUpdates = require("./ReactUpdates");

var getEventTarget = require("./getEventTarget");
var getUnboundedScrollPosition = require("./getUnboundedScrollPosition");
var mixInto = require("./mixInto");

/**
 * Finds the parent React component of `node`.
 *
 * @param {*} node
 * @return {?DOMEventTarget} Parent container, or `null` if the specified node
 *                           is not nested.
 */
function findParent(node) {
  // TODO: It may be a good idea to cache this to prevent unnecessary DOM
  // traversal, but caching is difficult to do correctly without using a
  // mutation observer to listen for all DOM changes.
  var nodeID = ReactMount.getID(node);
  var rootID = ReactInstanceHandles.getReactRootIDFromNodeID(nodeID);
  var container = ReactMount.findReactContainerForID(rootID);
  var parent = ReactMount.getFirstReactDOM(container);
  return parent;
}

// Used to store ancestor hierarchy in top level callback
function TopLevelCallbackBookKeeping(topLevelType, nativeEvent) {
  this.topLevelType = topLevelType;
  this.nativeEvent = nativeEvent;
  this.ancestors = [];
}
mixInto(TopLevelCallbackBookKeeping, {
  destructor: function() {
    this.topLevelType = null;
    this.nativeEvent = null;
    this.ancestors.length = 0;
  }
});
PooledClass.addPoolingTo(
  TopLevelCallbackBookKeeping,
  PooledClass.twoArgumentPooler
);

function handleTopLevelImpl(bookKeeping) {
  var topLevelTarget = ReactMount.getFirstReactDOM(
    getEventTarget(bookKeeping.nativeEvent)
  ) || window;

  // Loop through the hierarchy, in case there's any nested components.
  // It's important that we build the array of ancestors before calling any
  // event handlers, because event handlers can modify the DOM, leading to
  // inconsistencies with ReactMount's node cache. See #1105.
  var ancestor = topLevelTarget;
  while (ancestor) {
    bookKeeping.ancestors.push(ancestor);
    ancestor = findParent(ancestor);
  }

  for (var i = 0, l = bookKeeping.ancestors.length; i < l; i++) {
    topLevelTarget = bookKeeping.ancestors[i];
    var topLevelTargetID = ReactMount.getID(topLevelTarget) || '';
    ReactEventListener._handleTopLevel(
      bookKeeping.topLevelType,
      topLevelTarget,
      topLevelTargetID,
      bookKeeping.nativeEvent
    );
  }
}

function scrollValueMonitor(cb) {
  var scrollPosition = getUnboundedScrollPosition(window);
  cb(scrollPosition);
}

var ReactEventListener = {
  _enabled: true,
  _handleTopLevel: null,

  WINDOW_HANDLE: ExecutionEnvironment.canUseDOM ? window : null,

  setHandleTopLevel: function(handleTopLevel) {
    ReactEventListener._handleTopLevel = handleTopLevel;
  },

  setEnabled: function(enabled) {
    ReactEventListener._enabled = !!enabled;
  },

  isEnabled: function() {
    return ReactEventListener._enabled;
  },


  /**
   * Traps top-level events by using event bubbling.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} handle Element on which to attach listener.
   * @return {object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
  trapBubbledEvent: function(topLevelType, handlerBaseName, handle) {
    var element = handle;
    if (!element) {
      return;
    }
    return EventListener.listen(
      element,
      handlerBaseName,
      ReactEventListener.dispatchEvent.bind(null, topLevelType)
    );
  },

  /**
   * Traps a top-level event by using event capturing.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} handle Element on which to attach listener.
   * @return {object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
  trapCapturedEvent: function(topLevelType, handlerBaseName, handle) {
    var element = handle;
    if (!element) {
      return;
    }
    return EventListener.capture(
      element,
      handlerBaseName,
      ReactEventListener.dispatchEvent.bind(null, topLevelType)
    );
  },

  monitorScrollValue: function(refresh) {
    var callback = scrollValueMonitor.bind(null, refresh);
    EventListener.listen(window, 'scroll', callback);
    EventListener.listen(window, 'resize', callback);
  },

  dispatchEvent: function(topLevelType, nativeEvent) {
    if (!ReactEventListener._enabled) {
      return;
    }

    var bookKeeping = TopLevelCallbackBookKeeping.getPooled(
      topLevelType,
      nativeEvent
    );
    try {
      // Event queue being processed in the same cycle allows
      // `preventDefault`.
      ReactUpdates.batchedUpdates(handleTopLevelImpl, bookKeeping);
    } finally {
      TopLevelCallbackBookKeeping.release(bookKeeping);
    }
  }
};

module.exports = ReactEventListener;

},{"./EventListener":20,"./ExecutionEnvironment":25,"./PooledClass":30,"./ReactInstanceHandles":63,"./ReactMount":65,"./ReactUpdates":80,"./getEventTarget":115,"./getUnboundedScrollPosition":120,"./mixInto":137}],61:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactInjection
 */

"use strict";

var DOMProperty = require("./DOMProperty");
var EventPluginHub = require("./EventPluginHub");
var ReactComponent = require("./ReactComponent");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");
var ReactEmptyComponent = require("./ReactEmptyComponent");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactPerf = require("./ReactPerf");
var ReactRootIndex = require("./ReactRootIndex");
var ReactUpdates = require("./ReactUpdates");

var ReactInjection = {
  Component: ReactComponent.injection,
  CompositeComponent: ReactCompositeComponent.injection,
  DOMProperty: DOMProperty.injection,
  EmptyComponent: ReactEmptyComponent.injection,
  EventPluginHub: EventPluginHub.injection,
  DOM: ReactDOM.injection,
  EventEmitter: ReactBrowserEventEmitter.injection,
  Perf: ReactPerf.injection,
  RootIndex: ReactRootIndex.injection,
  Updates: ReactUpdates.injection
};

module.exports = ReactInjection;

},{"./DOMProperty":14,"./EventPluginHub":21,"./ReactBrowserEventEmitter":33,"./ReactComponent":35,"./ReactCompositeComponent":37,"./ReactDOM":40,"./ReactEmptyComponent":57,"./ReactPerf":69,"./ReactRootIndex":76,"./ReactUpdates":80}],62:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactInputSelection
 */

"use strict";

var ReactDOMSelection = require("./ReactDOMSelection");

var containsNode = require("./containsNode");
var focusNode = require("./focusNode");
var getActiveElement = require("./getActiveElement");

function isInDocument(node) {
  return containsNode(document.documentElement, node);
}

/**
 * @ReactInputSelection: React input selection module. Based on Selection.js,
 * but modified to be suitable for react and has a couple of bug fixes (doesn't
 * assume buttons have range selections allowed).
 * Input selection module for React.
 */
var ReactInputSelection = {

  hasSelectionCapabilities: function(elem) {
    return elem && (
      (elem.nodeName === 'INPUT' && elem.type === 'text') ||
      elem.nodeName === 'TEXTAREA' ||
      elem.contentEditable === 'true'
    );
  },

  getSelectionInformation: function() {
    var focusedElem = getActiveElement();
    return {
      focusedElem: focusedElem,
      selectionRange:
          ReactInputSelection.hasSelectionCapabilities(focusedElem) ?
          ReactInputSelection.getSelection(focusedElem) :
          null
    };
  },

  /**
   * @restoreSelection: If any selection information was potentially lost,
   * restore it. This is useful when performing operations that could remove dom
   * nodes and place them back in, resulting in focus being lost.
   */
  restoreSelection: function(priorSelectionInformation) {
    var curFocusedElem = getActiveElement();
    var priorFocusedElem = priorSelectionInformation.focusedElem;
    var priorSelectionRange = priorSelectionInformation.selectionRange;
    if (curFocusedElem !== priorFocusedElem &&
        isInDocument(priorFocusedElem)) {
      if (ReactInputSelection.hasSelectionCapabilities(priorFocusedElem)) {
        ReactInputSelection.setSelection(
          priorFocusedElem,
          priorSelectionRange
        );
      }
      focusNode(priorFocusedElem);
    }
  },

  /**
   * @getSelection: Gets the selection bounds of a focused textarea, input or
   * contentEditable node.
   * -@input: Look up selection bounds of this input
   * -@return {start: selectionStart, end: selectionEnd}
   */
  getSelection: function(input) {
    var selection;

    if ('selectionStart' in input) {
      // Modern browser with input or textarea.
      selection = {
        start: input.selectionStart,
        end: input.selectionEnd
      };
    } else if (document.selection && input.nodeName === 'INPUT') {
      // IE8 input.
      var range = document.selection.createRange();
      // There can only be one selection per document in IE, so it must
      // be in our element.
      if (range.parentElement() === input) {
        selection = {
          start: -range.moveStart('character', -input.value.length),
          end: -range.moveEnd('character', -input.value.length)
        };
      }
    } else {
      // Content editable or old IE textarea.
      selection = ReactDOMSelection.getOffsets(input);
    }

    return selection || {start: 0, end: 0};
  },

  /**
   * @setSelection: Sets the selection bounds of a textarea or input and focuses
   * the input.
   * -@input     Set selection bounds of this input or textarea
   * -@offsets   Object of same form that is returned from get*
   */
  setSelection: function(input, offsets) {
    var start = offsets.start;
    var end = offsets.end;
    if (typeof end === 'undefined') {
      end = start;
    }

    if ('selectionStart' in input) {
      input.selectionStart = start;
      input.selectionEnd = Math.min(end, input.value.length);
    } else if (document.selection && input.nodeName === 'INPUT') {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveStart('character', start);
      range.moveEnd('character', end - start);
      range.select();
    } else {
      ReactDOMSelection.setOffsets(input, offsets);
    }
  }
};

module.exports = ReactInputSelection;

},{"./ReactDOMSelection":49,"./containsNode":100,"./focusNode":110,"./getActiveElement":112}],63:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactInstanceHandles
 * @typechecks static-only
 */

"use strict";

var ReactRootIndex = require("./ReactRootIndex");

var invariant = require("./invariant");

var SEPARATOR = '.';
var SEPARATOR_LENGTH = SEPARATOR.length;

/**
 * Maximum depth of traversals before we consider the possibility of a bad ID.
 */
var MAX_TREE_DEPTH = 100;

/**
 * Creates a DOM ID prefix to use when mounting React components.
 *
 * @param {number} index A unique integer
 * @return {string} React root ID.
 * @internal
 */
function getReactRootIDString(index) {
  return SEPARATOR + index.toString(36);
}

/**
 * Checks if a character in the supplied ID is a separator or the end.
 *
 * @param {string} id A React DOM ID.
 * @param {number} index Index of the character to check.
 * @return {boolean} True if the character is a separator or end of the ID.
 * @private
 */
function isBoundary(id, index) {
  return id.charAt(index) === SEPARATOR || index === id.length;
}

/**
 * Checks if the supplied string is a valid React DOM ID.
 *
 * @param {string} id A React DOM ID, maybe.
 * @return {boolean} True if the string is a valid React DOM ID.
 * @private
 */
function isValidID(id) {
  return id === '' || (
    id.charAt(0) === SEPARATOR && id.charAt(id.length - 1) !== SEPARATOR
  );
}

/**
 * Checks if the first ID is an ancestor of or equal to the second ID.
 *
 * @param {string} ancestorID
 * @param {string} descendantID
 * @return {boolean} True if `ancestorID` is an ancestor of `descendantID`.
 * @internal
 */
function isAncestorIDOf(ancestorID, descendantID) {
  return (
    descendantID.indexOf(ancestorID) === 0 &&
    isBoundary(descendantID, ancestorID.length)
  );
}

/**
 * Gets the parent ID of the supplied React DOM ID, `id`.
 *
 * @param {string} id ID of a component.
 * @return {string} ID of the parent, or an empty string.
 * @private
 */
function getParentID(id) {
  return id ? id.substr(0, id.lastIndexOf(SEPARATOR)) : '';
}

/**
 * Gets the next DOM ID on the tree path from the supplied `ancestorID` to the
 * supplied `destinationID`. If they are equal, the ID is returned.
 *
 * @param {string} ancestorID ID of an ancestor node of `destinationID`.
 * @param {string} destinationID ID of the destination node.
 * @return {string} Next ID on the path from `ancestorID` to `destinationID`.
 * @private
 */
function getNextDescendantID(ancestorID, destinationID) {
  ("production" !== process.env.NODE_ENV ? invariant(
    isValidID(ancestorID) && isValidID(destinationID),
    'getNextDescendantID(%s, %s): Received an invalid React DOM ID.',
    ancestorID,
    destinationID
  ) : invariant(isValidID(ancestorID) && isValidID(destinationID)));
  ("production" !== process.env.NODE_ENV ? invariant(
    isAncestorIDOf(ancestorID, destinationID),
    'getNextDescendantID(...): React has made an invalid assumption about ' +
    'the DOM hierarchy. Expected `%s` to be an ancestor of `%s`.',
    ancestorID,
    destinationID
  ) : invariant(isAncestorIDOf(ancestorID, destinationID)));
  if (ancestorID === destinationID) {
    return ancestorID;
  }
  // Skip over the ancestor and the immediate separator. Traverse until we hit
  // another separator or we reach the end of `destinationID`.
  var start = ancestorID.length + SEPARATOR_LENGTH;
  for (var i = start; i < destinationID.length; i++) {
    if (isBoundary(destinationID, i)) {
      break;
    }
  }
  return destinationID.substr(0, i);
}

/**
 * Gets the nearest common ancestor ID of two IDs.
 *
 * Using this ID scheme, the nearest common ancestor ID is the longest common
 * prefix of the two IDs that immediately preceded a "marker" in both strings.
 *
 * @param {string} oneID
 * @param {string} twoID
 * @return {string} Nearest common ancestor ID, or the empty string if none.
 * @private
 */
function getFirstCommonAncestorID(oneID, twoID) {
  var minLength = Math.min(oneID.length, twoID.length);
  if (minLength === 0) {
    return '';
  }
  var lastCommonMarkerIndex = 0;
  // Use `<=` to traverse until the "EOL" of the shorter string.
  for (var i = 0; i <= minLength; i++) {
    if (isBoundary(oneID, i) && isBoundary(twoID, i)) {
      lastCommonMarkerIndex = i;
    } else if (oneID.charAt(i) !== twoID.charAt(i)) {
      break;
    }
  }
  var longestCommonID = oneID.substr(0, lastCommonMarkerIndex);
  ("production" !== process.env.NODE_ENV ? invariant(
    isValidID(longestCommonID),
    'getFirstCommonAncestorID(%s, %s): Expected a valid React DOM ID: %s',
    oneID,
    twoID,
    longestCommonID
  ) : invariant(isValidID(longestCommonID)));
  return longestCommonID;
}

/**
 * Traverses the parent path between two IDs (either up or down). The IDs must
 * not be the same, and there must exist a parent path between them. If the
 * callback returns `false`, traversal is stopped.
 *
 * @param {?string} start ID at which to start traversal.
 * @param {?string} stop ID at which to end traversal.
 * @param {function} cb Callback to invoke each ID with.
 * @param {?boolean} skipFirst Whether or not to skip the first node.
 * @param {?boolean} skipLast Whether or not to skip the last node.
 * @private
 */
function traverseParentPath(start, stop, cb, arg, skipFirst, skipLast) {
  start = start || '';
  stop = stop || '';
  ("production" !== process.env.NODE_ENV ? invariant(
    start !== stop,
    'traverseParentPath(...): Cannot traverse from and to the same ID, `%s`.',
    start
  ) : invariant(start !== stop));
  var traverseUp = isAncestorIDOf(stop, start);
  ("production" !== process.env.NODE_ENV ? invariant(
    traverseUp || isAncestorIDOf(start, stop),
    'traverseParentPath(%s, %s, ...): Cannot traverse from two IDs that do ' +
    'not have a parent path.',
    start,
    stop
  ) : invariant(traverseUp || isAncestorIDOf(start, stop)));
  // Traverse from `start` to `stop` one depth at a time.
  var depth = 0;
  var traverse = traverseUp ? getParentID : getNextDescendantID;
  for (var id = start; /* until break */; id = traverse(id, stop)) {
    var ret;
    if ((!skipFirst || id !== start) && (!skipLast || id !== stop)) {
      ret = cb(id, traverseUp, arg);
    }
    if (ret === false || id === stop) {
      // Only break //after// visiting `stop`.
      break;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      depth++ < MAX_TREE_DEPTH,
      'traverseParentPath(%s, %s, ...): Detected an infinite loop while ' +
      'traversing the React DOM ID tree. This may be due to malformed IDs: %s',
      start, stop
    ) : invariant(depth++ < MAX_TREE_DEPTH));
  }
}

/**
 * Manages the IDs assigned to DOM representations of React components. This
 * uses a specific scheme in order to traverse the DOM efficiently (e.g. in
 * order to simulate events).
 *
 * @internal
 */
var ReactInstanceHandles = {

  /**
   * Constructs a React root ID
   * @return {string} A React root ID.
   */
  createReactRootID: function() {
    return getReactRootIDString(ReactRootIndex.createReactRootIndex());
  },

  /**
   * Constructs a React ID by joining a root ID with a name.
   *
   * @param {string} rootID Root ID of a parent component.
   * @param {string} name A component's name (as flattened children).
   * @return {string} A React ID.
   * @internal
   */
  createReactID: function(rootID, name) {
    return rootID + name;
  },

  /**
   * Gets the DOM ID of the React component that is the root of the tree that
   * contains the React component with the supplied DOM ID.
   *
   * @param {string} id DOM ID of a React component.
   * @return {?string} DOM ID of the React component that is the root.
   * @internal
   */
  getReactRootIDFromNodeID: function(id) {
    if (id && id.charAt(0) === SEPARATOR && id.length > 1) {
      var index = id.indexOf(SEPARATOR, 1);
      return index > -1 ? id.substr(0, index) : id;
    }
    return null;
  },

  /**
   * Traverses the ID hierarchy and invokes the supplied `cb` on any IDs that
   * should would receive a `mouseEnter` or `mouseLeave` event.
   *
   * NOTE: Does not invoke the callback on the nearest common ancestor because
   * nothing "entered" or "left" that element.
   *
   * @param {string} leaveID ID being left.
   * @param {string} enterID ID being entered.
   * @param {function} cb Callback to invoke on each entered/left ID.
   * @param {*} upArg Argument to invoke the callback with on left IDs.
   * @param {*} downArg Argument to invoke the callback with on entered IDs.
   * @internal
   */
  traverseEnterLeave: function(leaveID, enterID, cb, upArg, downArg) {
    var ancestorID = getFirstCommonAncestorID(leaveID, enterID);
    if (ancestorID !== leaveID) {
      traverseParentPath(leaveID, ancestorID, cb, upArg, false, true);
    }
    if (ancestorID !== enterID) {
      traverseParentPath(ancestorID, enterID, cb, downArg, true, false);
    }
  },

  /**
   * Simulates the traversal of a two-phase, capture/bubble event dispatch.
   *
   * NOTE: This traversal happens on IDs without touching the DOM.
   *
   * @param {string} targetID ID of the target node.
   * @param {function} cb Callback to invoke.
   * @param {*} arg Argument to invoke the callback with.
   * @internal
   */
  traverseTwoPhase: function(targetID, cb, arg) {
    if (targetID) {
      traverseParentPath('', targetID, cb, arg, true, false);
      traverseParentPath(targetID, '', cb, arg, false, true);
    }
  },

  /**
   * Traverse a node ID, calling the supplied `cb` for each ancestor ID. For
   * example, passing `.0.$row-0.1` would result in `cb` getting called
   * with `.0`, `.0.$row-0`, and `.0.$row-0.1`.
   *
   * NOTE: This traversal happens on IDs without touching the DOM.
   *
   * @param {string} targetID ID of the target node.
   * @param {function} cb Callback to invoke.
   * @param {*} arg Argument to invoke the callback with.
   * @internal
   */
  traverseAncestors: function(targetID, cb, arg) {
    traverseParentPath('', targetID, cb, arg, true, false);
  },

  /**
   * Exposed for unit testing.
   * @private
   */
  _getFirstCommonAncestorID: getFirstCommonAncestorID,

  /**
   * Exposed for unit testing.
   * @private
   */
  _getNextDescendantID: getNextDescendantID,

  isAncestorIDOf: isAncestorIDOf,

  SEPARATOR: SEPARATOR

};

module.exports = ReactInstanceHandles;

}).call(this,require('_process'))
},{"./ReactRootIndex":76,"./invariant":124,"_process":3}],64:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMarkupChecksum
 */

"use strict";

var adler32 = require("./adler32");

var ReactMarkupChecksum = {
  CHECKSUM_ATTR_NAME: 'data-react-checksum',

  /**
   * @param {string} markup Markup string
   * @return {string} Markup string with checksum attribute attached
   */
  addChecksumToMarkup: function(markup) {
    var checksum = adler32(markup);
    return markup.replace(
      '>',
      ' ' + ReactMarkupChecksum.CHECKSUM_ATTR_NAME + '="' + checksum + '">'
    );
  },

  /**
   * @param {string} markup to use
   * @param {DOMElement} element root React element
   * @returns {boolean} whether or not the markup is the same
   */
  canReuseMarkup: function(markup, element) {
    var existingChecksum = element.getAttribute(
      ReactMarkupChecksum.CHECKSUM_ATTR_NAME
    );
    existingChecksum = existingChecksum && parseInt(existingChecksum, 10);
    var markupChecksum = adler32(markup);
    return markupChecksum === existingChecksum;
  }
};

module.exports = ReactMarkupChecksum;

},{"./adler32":99}],65:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMount
 */

"use strict";

var DOMProperty = require("./DOMProperty");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactDescriptor = require("./ReactDescriptor");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactPerf = require("./ReactPerf");

var containsNode = require("./containsNode");
var getReactRootElementInContainer = require("./getReactRootElementInContainer");
var instantiateReactComponent = require("./instantiateReactComponent");
var invariant = require("./invariant");
var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
var warning = require("./warning");

var SEPARATOR = ReactInstanceHandles.SEPARATOR;

var ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;
var nodeCache = {};

var ELEMENT_NODE_TYPE = 1;
var DOC_NODE_TYPE = 9;

/** Mapping from reactRootID to React component instance. */
var instancesByReactRootID = {};

/** Mapping from reactRootID to `container` nodes. */
var containersByReactRootID = {};

if ("production" !== process.env.NODE_ENV) {
  /** __DEV__-only mapping from reactRootID to root elements. */
  var rootElementsByReactRootID = {};
}

// Used to store breadth-first search state in findComponentRoot.
var findComponentRootReusableArray = [];

/**
 * @param {DOMElement} container DOM element that may contain a React component.
 * @return {?string} A "reactRoot" ID, if a React component is rendered.
 */
function getReactRootID(container) {
  var rootElement = getReactRootElementInContainer(container);
  return rootElement && ReactMount.getID(rootElement);
}

/**
 * Accessing node[ATTR_NAME] or calling getAttribute(ATTR_NAME) on a form
 * element can return its control whose name or ID equals ATTR_NAME. All
 * DOM nodes support `getAttributeNode` but this can also get called on
 * other objects so just return '' if we're given something other than a
 * DOM node (such as window).
 *
 * @param {?DOMElement|DOMWindow|DOMDocument|DOMTextNode} node DOM node.
 * @return {string} ID of the supplied `domNode`.
 */
function getID(node) {
  var id = internalGetID(node);
  if (id) {
    if (nodeCache.hasOwnProperty(id)) {
      var cached = nodeCache[id];
      if (cached !== node) {
        ("production" !== process.env.NODE_ENV ? invariant(
          !isValid(cached, id),
          'ReactMount: Two valid but unequal nodes with the same `%s`: %s',
          ATTR_NAME, id
        ) : invariant(!isValid(cached, id)));

        nodeCache[id] = node;
      }
    } else {
      nodeCache[id] = node;
    }
  }

  return id;
}

function internalGetID(node) {
  // If node is something like a window, document, or text node, none of
  // which support attributes or a .getAttribute method, gracefully return
  // the empty string, as if the attribute were missing.
  return node && node.getAttribute && node.getAttribute(ATTR_NAME) || '';
}

/**
 * Sets the React-specific ID of the given node.
 *
 * @param {DOMElement} node The DOM node whose ID will be set.
 * @param {string} id The value of the ID attribute.
 */
function setID(node, id) {
  var oldID = internalGetID(node);
  if (oldID !== id) {
    delete nodeCache[oldID];
  }
  node.setAttribute(ATTR_NAME, id);
  nodeCache[id] = node;
}

/**
 * Finds the node with the supplied React-generated DOM ID.
 *
 * @param {string} id A React-generated DOM ID.
 * @return {DOMElement} DOM node with the suppled `id`.
 * @internal
 */
function getNode(id) {
  if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
    nodeCache[id] = ReactMount.findReactNodeByID(id);
  }
  return nodeCache[id];
}

/**
 * A node is "valid" if it is contained by a currently mounted container.
 *
 * This means that the node does not have to be contained by a document in
 * order to be considered valid.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @param {string} id The expected ID of the node.
 * @return {boolean} Whether the node is contained by a mounted container.
 */
function isValid(node, id) {
  if (node) {
    ("production" !== process.env.NODE_ENV ? invariant(
      internalGetID(node) === id,
      'ReactMount: Unexpected modification of `%s`',
      ATTR_NAME
    ) : invariant(internalGetID(node) === id));

    var container = ReactMount.findReactContainerForID(id);
    if (container && containsNode(container, node)) {
      return true;
    }
  }

  return false;
}

/**
 * Causes the cache to forget about one React-specific ID.
 *
 * @param {string} id The ID to forget.
 */
function purgeID(id) {
  delete nodeCache[id];
}

var deepestNodeSoFar = null;
function findDeepestCachedAncestorImpl(ancestorID) {
  var ancestor = nodeCache[ancestorID];
  if (ancestor && isValid(ancestor, ancestorID)) {
    deepestNodeSoFar = ancestor;
  } else {
    // This node isn't populated in the cache, so presumably none of its
    // descendants are. Break out of the loop.
    return false;
  }
}

/**
 * Return the deepest cached node whose ID is a prefix of `targetID`.
 */
function findDeepestCachedAncestor(targetID) {
  deepestNodeSoFar = null;
  ReactInstanceHandles.traverseAncestors(
    targetID,
    findDeepestCachedAncestorImpl
  );

  var foundNode = deepestNodeSoFar;
  deepestNodeSoFar = null;
  return foundNode;
}

/**
 * Mounting is the process of initializing a React component by creatings its
 * representative DOM elements and inserting them into a supplied `container`.
 * Any prior content inside `container` is destroyed in the process.
 *
 *   ReactMount.renderComponent(
 *     component,
 *     document.getElementById('container')
 *   );
 *
 *   <div id="container">                   <-- Supplied `container`.
 *     <div data-reactid=".3">              <-- Rendered reactRoot of React
 *       // ...                                 component.
 *     </div>
 *   </div>
 *
 * Inside of `container`, the first element rendered is the "reactRoot".
 */
var ReactMount = {
  /** Exposed for debugging purposes **/
  _instancesByReactRootID: instancesByReactRootID,

  /**
   * This is a hook provided to support rendering React components while
   * ensuring that the apparent scroll position of its `container` does not
   * change.
   *
   * @param {DOMElement} container The `container` being rendered into.
   * @param {function} renderCallback This must be called once to do the render.
   */
  scrollMonitor: function(container, renderCallback) {
    renderCallback();
  },

  /**
   * Take a component that's already mounted into the DOM and replace its props
   * @param {ReactComponent} prevComponent component instance already in the DOM
   * @param {ReactComponent} nextComponent component instance to render
   * @param {DOMElement} container container to render into
   * @param {?function} callback function triggered on completion
   */
  _updateRootComponent: function(
      prevComponent,
      nextComponent,
      container,
      callback) {
    var nextProps = nextComponent.props;
    ReactMount.scrollMonitor(container, function() {
      prevComponent.replaceProps(nextProps, callback);
    });

    if ("production" !== process.env.NODE_ENV) {
      // Record the root element in case it later gets transplanted.
      rootElementsByReactRootID[getReactRootID(container)] =
        getReactRootElementInContainer(container);
    }

    return prevComponent;
  },

  /**
   * Register a component into the instance map and starts scroll value
   * monitoring
   * @param {ReactComponent} nextComponent component instance to render
   * @param {DOMElement} container container to render into
   * @return {string} reactRoot ID prefix
   */
  _registerComponent: function(nextComponent, container) {
    ("production" !== process.env.NODE_ENV ? invariant(
      container && (
        container.nodeType === ELEMENT_NODE_TYPE ||
        container.nodeType === DOC_NODE_TYPE
      ),
      '_registerComponent(...): Target container is not a DOM element.'
    ) : invariant(container && (
      container.nodeType === ELEMENT_NODE_TYPE ||
      container.nodeType === DOC_NODE_TYPE
    )));

    ReactBrowserEventEmitter.ensureScrollValueMonitoring();

    var reactRootID = ReactMount.registerContainer(container);
    instancesByReactRootID[reactRootID] = nextComponent;
    return reactRootID;
  },

  /**
   * Render a new component into the DOM.
   * @param {ReactComponent} nextComponent component instance to render
   * @param {DOMElement} container container to render into
   * @param {boolean} shouldReuseMarkup if we should skip the markup insertion
   * @return {ReactComponent} nextComponent
   */
  _renderNewRootComponent: ReactPerf.measure(
    'ReactMount',
    '_renderNewRootComponent',
    function(
        nextComponent,
        container,
        shouldReuseMarkup) {
      // Various parts of our code (such as ReactCompositeComponent's
      // _renderValidatedComponent) assume that calls to render aren't nested;
      // verify that that's the case.
      ("production" !== process.env.NODE_ENV ? warning(
        ReactCurrentOwner.current == null,
        '_renderNewRootComponent(): Render methods should be a pure function ' +
        'of props and state; triggering nested component updates from ' +
        'render is not allowed. If necessary, trigger nested updates in ' +
        'componentDidUpdate.'
      ) : null);

      var componentInstance = instantiateReactComponent(nextComponent);
      var reactRootID = ReactMount._registerComponent(
        componentInstance,
        container
      );
      componentInstance.mountComponentIntoNode(
        reactRootID,
        container,
        shouldReuseMarkup
      );

      if ("production" !== process.env.NODE_ENV) {
        // Record the root element in case it later gets transplanted.
        rootElementsByReactRootID[reactRootID] =
          getReactRootElementInContainer(container);
      }

      return componentInstance;
    }
  ),

  /**
   * Renders a React component into the DOM in the supplied `container`.
   *
   * If the React component was previously rendered into `container`, this will
   * perform an update on it and only mutate the DOM as necessary to reflect the
   * latest React component.
   *
   * @param {ReactDescriptor} nextDescriptor Component descriptor to render.
   * @param {DOMElement} container DOM element to render into.
   * @param {?function} callback function triggered on completion
   * @return {ReactComponent} Component instance rendered in `container`.
   */
  renderComponent: function(nextDescriptor, container, callback) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactDescriptor.isValidDescriptor(nextDescriptor),
      'renderComponent(): Invalid component descriptor.%s',
      (
        ReactDescriptor.isValidFactory(nextDescriptor) ?
          ' Instead of passing a component class, make sure to instantiate ' +
          'it first by calling it with props.' :
        // Check if it quacks like a descriptor
        typeof nextDescriptor.props !== "undefined" ?
          ' This may be caused by unintentionally loading two independent ' +
          'copies of React.' :
          ''
      )
    ) : invariant(ReactDescriptor.isValidDescriptor(nextDescriptor)));

    var prevComponent = instancesByReactRootID[getReactRootID(container)];

    if (prevComponent) {
      var prevDescriptor = prevComponent._descriptor;
      if (shouldUpdateReactComponent(prevDescriptor, nextDescriptor)) {
        return ReactMount._updateRootComponent(
          prevComponent,
          nextDescriptor,
          container,
          callback
        );
      } else {
        ReactMount.unmountComponentAtNode(container);
      }
    }

    var reactRootElement = getReactRootElementInContainer(container);
    var containerHasReactMarkup =
      reactRootElement && ReactMount.isRenderedByReact(reactRootElement);

    var shouldReuseMarkup = containerHasReactMarkup && !prevComponent;

    var component = ReactMount._renderNewRootComponent(
      nextDescriptor,
      container,
      shouldReuseMarkup
    );
    callback && callback.call(component);
    return component;
  },

  /**
   * Constructs a component instance of `constructor` with `initialProps` and
   * renders it into the supplied `container`.
   *
   * @param {function} constructor React component constructor.
   * @param {?object} props Initial props of the component instance.
   * @param {DOMElement} container DOM element to render into.
   * @return {ReactComponent} Component instance rendered in `container`.
   */
  constructAndRenderComponent: function(constructor, props, container) {
    return ReactMount.renderComponent(constructor(props), container);
  },

  /**
   * Constructs a component instance of `constructor` with `initialProps` and
   * renders it into a container node identified by supplied `id`.
   *
   * @param {function} componentConstructor React component constructor
   * @param {?object} props Initial props of the component instance.
   * @param {string} id ID of the DOM element to render into.
   * @return {ReactComponent} Component instance rendered in the container node.
   */
  constructAndRenderComponentByID: function(constructor, props, id) {
    var domNode = document.getElementById(id);
    ("production" !== process.env.NODE_ENV ? invariant(
      domNode,
      'Tried to get element with id of "%s" but it is not present on the page.',
      id
    ) : invariant(domNode));
    return ReactMount.constructAndRenderComponent(constructor, props, domNode);
  },

  /**
   * Registers a container node into which React components will be rendered.
   * This also creates the "reactRoot" ID that will be assigned to the element
   * rendered within.
   *
   * @param {DOMElement} container DOM element to register as a container.
   * @return {string} The "reactRoot" ID of elements rendered within.
   */
  registerContainer: function(container) {
    var reactRootID = getReactRootID(container);
    if (reactRootID) {
      // If one exists, make sure it is a valid "reactRoot" ID.
      reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID);
    }
    if (!reactRootID) {
      // No valid "reactRoot" ID found, create one.
      reactRootID = ReactInstanceHandles.createReactRootID();
    }
    containersByReactRootID[reactRootID] = container;
    return reactRootID;
  },

  /**
   * Unmounts and destroys the React component rendered in the `container`.
   *
   * @param {DOMElement} container DOM element containing a React component.
   * @return {boolean} True if a component was found in and unmounted from
   *                   `container`
   */
  unmountComponentAtNode: function(container) {
    // Various parts of our code (such as ReactCompositeComponent's
    // _renderValidatedComponent) assume that calls to render aren't nested;
    // verify that that's the case. (Strictly speaking, unmounting won't cause a
    // render but we still don't expect to be in a render call here.)
    ("production" !== process.env.NODE_ENV ? warning(
      ReactCurrentOwner.current == null,
      'unmountComponentAtNode(): Render methods should be a pure function of ' +
      'props and state; triggering nested component updates from render is ' +
      'not allowed. If necessary, trigger nested updates in ' +
      'componentDidUpdate.'
    ) : null);

    var reactRootID = getReactRootID(container);
    var component = instancesByReactRootID[reactRootID];
    if (!component) {
      return false;
    }
    ReactMount.unmountComponentFromNode(component, container);
    delete instancesByReactRootID[reactRootID];
    delete containersByReactRootID[reactRootID];
    if ("production" !== process.env.NODE_ENV) {
      delete rootElementsByReactRootID[reactRootID];
    }
    return true;
  },

  /**
   * Unmounts a component and removes it from the DOM.
   *
   * @param {ReactComponent} instance React component instance.
   * @param {DOMElement} container DOM element to unmount from.
   * @final
   * @internal
   * @see {ReactMount.unmountComponentAtNode}
   */
  unmountComponentFromNode: function(instance, container) {
    instance.unmountComponent();

    if (container.nodeType === DOC_NODE_TYPE) {
      container = container.documentElement;
    }

    // http://jsperf.com/emptying-a-node
    while (container.lastChild) {
      container.removeChild(container.lastChild);
    }
  },

  /**
   * Finds the container DOM element that contains React component to which the
   * supplied DOM `id` belongs.
   *
   * @param {string} id The ID of an element rendered by a React component.
   * @return {?DOMElement} DOM element that contains the `id`.
   */
  findReactContainerForID: function(id) {
    var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(id);
    var container = containersByReactRootID[reactRootID];

    if ("production" !== process.env.NODE_ENV) {
      var rootElement = rootElementsByReactRootID[reactRootID];
      if (rootElement && rootElement.parentNode !== container) {
        ("production" !== process.env.NODE_ENV ? invariant(
          // Call internalGetID here because getID calls isValid which calls
          // findReactContainerForID (this function).
          internalGetID(rootElement) === reactRootID,
          'ReactMount: Root element ID differed from reactRootID.'
        ) : invariant(// Call internalGetID here because getID calls isValid which calls
        // findReactContainerForID (this function).
        internalGetID(rootElement) === reactRootID));

        var containerChild = container.firstChild;
        if (containerChild &&
            reactRootID === internalGetID(containerChild)) {
          // If the container has a new child with the same ID as the old
          // root element, then rootElementsByReactRootID[reactRootID] is
          // just stale and needs to be updated. The case that deserves a
          // warning is when the container is empty.
          rootElementsByReactRootID[reactRootID] = containerChild;
        } else {
          console.warn(
            'ReactMount: Root element has been removed from its original ' +
            'container. New container:', rootElement.parentNode
          );
        }
      }
    }

    return container;
  },

  /**
   * Finds an element rendered by React with the supplied ID.
   *
   * @param {string} id ID of a DOM node in the React component.
   * @return {DOMElement} Root DOM node of the React component.
   */
  findReactNodeByID: function(id) {
    var reactRoot = ReactMount.findReactContainerForID(id);
    return ReactMount.findComponentRoot(reactRoot, id);
  },

  /**
   * True if the supplied `node` is rendered by React.
   *
   * @param {*} node DOM Element to check.
   * @return {boolean} True if the DOM Element appears to be rendered by React.
   * @internal
   */
  isRenderedByReact: function(node) {
    if (node.nodeType !== 1) {
      // Not a DOMElement, therefore not a React component
      return false;
    }
    var id = ReactMount.getID(node);
    return id ? id.charAt(0) === SEPARATOR : false;
  },

  /**
   * Traverses up the ancestors of the supplied node to find a node that is a
   * DOM representation of a React component.
   *
   * @param {*} node
   * @return {?DOMEventTarget}
   * @internal
   */
  getFirstReactDOM: function(node) {
    var current = node;
    while (current && current.parentNode !== current) {
      if (ReactMount.isRenderedByReact(current)) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  },

  /**
   * Finds a node with the supplied `targetID` inside of the supplied
   * `ancestorNode`.  Exploits the ID naming scheme to perform the search
   * quickly.
   *
   * @param {DOMEventTarget} ancestorNode Search from this root.
   * @pararm {string} targetID ID of the DOM representation of the component.
   * @return {DOMEventTarget} DOM node with the supplied `targetID`.
   * @internal
   */
  findComponentRoot: function(ancestorNode, targetID) {
    var firstChildren = findComponentRootReusableArray;
    var childIndex = 0;

    var deepestAncestor = findDeepestCachedAncestor(targetID) || ancestorNode;

    firstChildren[0] = deepestAncestor.firstChild;
    firstChildren.length = 1;

    while (childIndex < firstChildren.length) {
      var child = firstChildren[childIndex++];
      var targetChild;

      while (child) {
        var childID = ReactMount.getID(child);
        if (childID) {
          // Even if we find the node we're looking for, we finish looping
          // through its siblings to ensure they're cached so that we don't have
          // to revisit this node again. Otherwise, we make n^2 calls to getID
          // when visiting the many children of a single node in order.

          if (targetID === childID) {
            targetChild = child;
          } else if (ReactInstanceHandles.isAncestorIDOf(childID, targetID)) {
            // If we find a child whose ID is an ancestor of the given ID,
            // then we can be sure that we only want to search the subtree
            // rooted at this child, so we can throw out the rest of the
            // search state.
            firstChildren.length = childIndex = 0;
            firstChildren.push(child.firstChild);
          }

        } else {
          // If this child had no ID, then there's a chance that it was
          // injected automatically by the browser, as when a `<table>`
          // element sprouts an extra `<tbody>` child as a side effect of
          // `.innerHTML` parsing. Optimistically continue down this
          // branch, but not before examining the other siblings.
          firstChildren.push(child.firstChild);
        }

        child = child.nextSibling;
      }

      if (targetChild) {
        // Emptying firstChildren/findComponentRootReusableArray is
        // not necessary for correctness, but it helps the GC reclaim
        // any nodes that were left at the end of the search.
        firstChildren.length = 0;

        return targetChild;
      }
    }

    firstChildren.length = 0;

    ("production" !== process.env.NODE_ENV ? invariant(
      false,
      'findComponentRoot(..., %s): Unable to find element. This probably ' +
      'means the DOM was unexpectedly mutated (e.g., by the browser), ' +
      'usually due to forgetting a <tbody> when using tables, nesting <p> ' +
      'or <a> tags, or using non-SVG elements in an <svg> parent. Try ' +
      'inspecting the child nodes of the element with React ID `%s`.',
      targetID,
      ReactMount.getID(ancestorNode)
    ) : invariant(false));
  },


  /**
   * React ID utilities.
   */

  getReactRootID: getReactRootID,

  getID: getID,

  setID: setID,

  getNode: getNode,

  purgeID: purgeID
};

module.exports = ReactMount;

}).call(this,require('_process'))
},{"./DOMProperty":14,"./ReactBrowserEventEmitter":33,"./ReactCurrentOwner":39,"./ReactDescriptor":55,"./ReactInstanceHandles":63,"./ReactPerf":69,"./containsNode":100,"./getReactRootElementInContainer":118,"./instantiateReactComponent":123,"./invariant":124,"./shouldUpdateReactComponent":144,"./warning":147,"_process":3}],66:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMultiChild
 * @typechecks static-only
 */

"use strict";

var ReactComponent = require("./ReactComponent");
var ReactMultiChildUpdateTypes = require("./ReactMultiChildUpdateTypes");

var flattenChildren = require("./flattenChildren");
var instantiateReactComponent = require("./instantiateReactComponent");
var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");

/**
 * Updating children of a component may trigger recursive updates. The depth is
 * used to batch recursive updates to render markup more efficiently.
 *
 * @type {number}
 * @private
 */
var updateDepth = 0;

/**
 * Queue of update configuration objects.
 *
 * Each object has a `type` property that is in `ReactMultiChildUpdateTypes`.
 *
 * @type {array<object>}
 * @private
 */
var updateQueue = [];

/**
 * Queue of markup to be rendered.
 *
 * @type {array<string>}
 * @private
 */
var markupQueue = [];

/**
 * Enqueues markup to be rendered and inserted at a supplied index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {string} markup Markup that renders into an element.
 * @param {number} toIndex Destination index.
 * @private
 */
function enqueueMarkup(parentID, markup, toIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.INSERT_MARKUP,
    markupIndex: markupQueue.push(markup) - 1,
    textContent: null,
    fromIndex: null,
    toIndex: toIndex
  });
}

/**
 * Enqueues moving an existing element to another index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {number} fromIndex Source index of the existing element.
 * @param {number} toIndex Destination index of the element.
 * @private
 */
function enqueueMove(parentID, fromIndex, toIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.MOVE_EXISTING,
    markupIndex: null,
    textContent: null,
    fromIndex: fromIndex,
    toIndex: toIndex
  });
}

/**
 * Enqueues removing an element at an index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {number} fromIndex Index of the element to remove.
 * @private
 */
function enqueueRemove(parentID, fromIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.REMOVE_NODE,
    markupIndex: null,
    textContent: null,
    fromIndex: fromIndex,
    toIndex: null
  });
}

/**
 * Enqueues setting the text content.
 *
 * @param {string} parentID ID of the parent component.
 * @param {string} textContent Text content to set.
 * @private
 */
function enqueueTextContent(parentID, textContent) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.TEXT_CONTENT,
    markupIndex: null,
    textContent: textContent,
    fromIndex: null,
    toIndex: null
  });
}

/**
 * Processes any enqueued updates.
 *
 * @private
 */
function processQueue() {
  if (updateQueue.length) {
    ReactComponent.BackendIDOperations.dangerouslyProcessChildrenUpdates(
      updateQueue,
      markupQueue
    );
    clearQueue();
  }
}

/**
 * Clears any enqueued updates.
 *
 * @private
 */
function clearQueue() {
  updateQueue.length = 0;
  markupQueue.length = 0;
}

/**
 * ReactMultiChild are capable of reconciling multiple children.
 *
 * @class ReactMultiChild
 * @internal
 */
var ReactMultiChild = {

  /**
   * Provides common functionality for components that must reconcile multiple
   * children. This is used by `ReactDOMComponent` to mount, update, and
   * unmount child components.
   *
   * @lends {ReactMultiChild.prototype}
   */
  Mixin: {

    /**
     * Generates a "mount image" for each of the supplied children. In the case
     * of `ReactDOMComponent`, a mount image is a string of markup.
     *
     * @param {?object} nestedChildren Nested child maps.
     * @return {array} An array of mounted representations.
     * @internal
     */
    mountChildren: function(nestedChildren, transaction) {
      var children = flattenChildren(nestedChildren);
      var mountImages = [];
      var index = 0;
      this._renderedChildren = children;
      for (var name in children) {
        var child = children[name];
        if (children.hasOwnProperty(name)) {
          // The rendered children must be turned into instances as they're
          // mounted.
          var childInstance = instantiateReactComponent(child);
          children[name] = childInstance;
          // Inlined for performance, see `ReactInstanceHandles.createReactID`.
          var rootID = this._rootNodeID + name;
          var mountImage = childInstance.mountComponent(
            rootID,
            transaction,
            this._mountDepth + 1
          );
          childInstance._mountIndex = index;
          mountImages.push(mountImage);
          index++;
        }
      }
      return mountImages;
    },

    /**
     * Replaces any rendered children with a text content string.
     *
     * @param {string} nextContent String of content.
     * @internal
     */
    updateTextContent: function(nextContent) {
      updateDepth++;
      var errorThrown = true;
      try {
        var prevChildren = this._renderedChildren;
        // Remove any rendered children.
        for (var name in prevChildren) {
          if (prevChildren.hasOwnProperty(name)) {
            this._unmountChildByName(prevChildren[name], name);
          }
        }
        // Set new text content.
        this.setTextContent(nextContent);
        errorThrown = false;
      } finally {
        updateDepth--;
        if (!updateDepth) {
          errorThrown ? clearQueue() : processQueue();
        }
      }
    },

    /**
     * Updates the rendered children with new children.
     *
     * @param {?object} nextNestedChildren Nested child maps.
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    updateChildren: function(nextNestedChildren, transaction) {
      updateDepth++;
      var errorThrown = true;
      try {
        this._updateChildren(nextNestedChildren, transaction);
        errorThrown = false;
      } finally {
        updateDepth--;
        if (!updateDepth) {
          errorThrown ? clearQueue() : processQueue();
        }
      }
    },

    /**
     * Improve performance by isolating this hot code path from the try/catch
     * block in `updateChildren`.
     *
     * @param {?object} nextNestedChildren Nested child maps.
     * @param {ReactReconcileTransaction} transaction
     * @final
     * @protected
     */
    _updateChildren: function(nextNestedChildren, transaction) {
      var nextChildren = flattenChildren(nextNestedChildren);
      var prevChildren = this._renderedChildren;
      if (!nextChildren && !prevChildren) {
        return;
      }
      var name;
      // `nextIndex` will increment for each child in `nextChildren`, but
      // `lastIndex` will be the last index visited in `prevChildren`.
      var lastIndex = 0;
      var nextIndex = 0;
      for (name in nextChildren) {
        if (!nextChildren.hasOwnProperty(name)) {
          continue;
        }
        var prevChild = prevChildren && prevChildren[name];
        var prevDescriptor = prevChild && prevChild._descriptor;
        var nextDescriptor = nextChildren[name];
        if (shouldUpdateReactComponent(prevDescriptor, nextDescriptor)) {
          this.moveChild(prevChild, nextIndex, lastIndex);
          lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          prevChild.receiveComponent(nextDescriptor, transaction);
          prevChild._mountIndex = nextIndex;
        } else {
          if (prevChild) {
            // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            this._unmountChildByName(prevChild, name);
          }
          // The child must be instantiated before it's mounted.
          var nextChildInstance = instantiateReactComponent(nextDescriptor);
          this._mountChildByNameAtIndex(
            nextChildInstance, name, nextIndex, transaction
          );
        }
        nextIndex++;
      }
      // Remove children that are no longer present.
      for (name in prevChildren) {
        if (prevChildren.hasOwnProperty(name) &&
            !(nextChildren && nextChildren[name])) {
          this._unmountChildByName(prevChildren[name], name);
        }
      }
    },

    /**
     * Unmounts all rendered children. This should be used to clean up children
     * when this component is unmounted.
     *
     * @internal
     */
    unmountChildren: function() {
      var renderedChildren = this._renderedChildren;
      for (var name in renderedChildren) {
        var renderedChild = renderedChildren[name];
        // TODO: When is this not true?
        if (renderedChild.unmountComponent) {
          renderedChild.unmountComponent();
        }
      }
      this._renderedChildren = null;
    },

    /**
     * Moves a child component to the supplied index.
     *
     * @param {ReactComponent} child Component to move.
     * @param {number} toIndex Destination index of the element.
     * @param {number} lastIndex Last index visited of the siblings of `child`.
     * @protected
     */
    moveChild: function(child, toIndex, lastIndex) {
      // If the index of `child` is less than `lastIndex`, then it needs to
      // be moved. Otherwise, we do not need to move it because a child will be
      // inserted or moved before `child`.
      if (child._mountIndex < lastIndex) {
        enqueueMove(this._rootNodeID, child._mountIndex, toIndex);
      }
    },

    /**
     * Creates a child component.
     *
     * @param {ReactComponent} child Component to create.
     * @param {string} mountImage Markup to insert.
     * @protected
     */
    createChild: function(child, mountImage) {
      enqueueMarkup(this._rootNodeID, mountImage, child._mountIndex);
    },

    /**
     * Removes a child component.
     *
     * @param {ReactComponent} child Child to remove.
     * @protected
     */
    removeChild: function(child) {
      enqueueRemove(this._rootNodeID, child._mountIndex);
    },

    /**
     * Sets this text content string.
     *
     * @param {string} textContent Text content to set.
     * @protected
     */
    setTextContent: function(textContent) {
      enqueueTextContent(this._rootNodeID, textContent);
    },

    /**
     * Mounts a child with the supplied name.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to mount.
     * @param {string} name Name of the child.
     * @param {number} index Index at which to insert the child.
     * @param {ReactReconcileTransaction} transaction
     * @private
     */
    _mountChildByNameAtIndex: function(child, name, index, transaction) {
      // Inlined for performance, see `ReactInstanceHandles.createReactID`.
      var rootID = this._rootNodeID + name;
      var mountImage = child.mountComponent(
        rootID,
        transaction,
        this._mountDepth + 1
      );
      child._mountIndex = index;
      this.createChild(child, mountImage);
      this._renderedChildren = this._renderedChildren || {};
      this._renderedChildren[name] = child;
    },

    /**
     * Unmounts a rendered child by name.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to unmount.
     * @param {string} name Name of the child in `this._renderedChildren`.
     * @private
     */
    _unmountChildByName: function(child, name) {
      this.removeChild(child);
      child._mountIndex = null;
      child.unmountComponent();
      delete this._renderedChildren[name];
    }

  }

};

module.exports = ReactMultiChild;

},{"./ReactComponent":35,"./ReactMultiChildUpdateTypes":67,"./flattenChildren":109,"./instantiateReactComponent":123,"./shouldUpdateReactComponent":144}],67:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMultiChildUpdateTypes
 */

"use strict";

var keyMirror = require("./keyMirror");

/**
 * When a component's children are updated, a series of update configuration
 * objects are created in order to batch and serialize the required changes.
 *
 * Enumerates all the possible types of update configurations.
 *
 * @internal
 */
var ReactMultiChildUpdateTypes = keyMirror({
  INSERT_MARKUP: null,
  MOVE_EXISTING: null,
  REMOVE_NODE: null,
  TEXT_CONTENT: null
});

module.exports = ReactMultiChildUpdateTypes;

},{"./keyMirror":130}],68:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactOwner
 */

"use strict";

var emptyObject = require("./emptyObject");
var invariant = require("./invariant");

/**
 * ReactOwners are capable of storing references to owned components.
 *
 * All components are capable of //being// referenced by owner components, but
 * only ReactOwner components are capable of //referencing// owned components.
 * The named reference is known as a "ref".
 *
 * Refs are available when mounted and updated during reconciliation.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return (
 *         <div onClick={this.handleClick}>
 *           <CustomComponent ref="custom" />
 *         </div>
 *       );
 *     },
 *     handleClick: function() {
 *       this.refs.custom.handleClick();
 *     },
 *     componentDidMount: function() {
 *       this.refs.custom.initialize();
 *     }
 *   });
 *
 * Refs should rarely be used. When refs are used, they should only be done to
 * control data that is not handled by React's data flow.
 *
 * @class ReactOwner
 */
var ReactOwner = {

  /**
   * @param {?object} object
   * @return {boolean} True if `object` is a valid owner.
   * @final
   */
  isValidOwner: function(object) {
    return !!(
      object &&
      typeof object.attachRef === 'function' &&
      typeof object.detachRef === 'function'
    );
  },

  /**
   * Adds a component by ref to an owner component.
   *
   * @param {ReactComponent} component Component to reference.
   * @param {string} ref Name by which to refer to the component.
   * @param {ReactOwner} owner Component on which to record the ref.
   * @final
   * @internal
   */
  addComponentAsRefTo: function(component, ref, owner) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactOwner.isValidOwner(owner),
      'addComponentAsRefTo(...): Only a ReactOwner can have refs. This ' +
      'usually means that you\'re trying to add a ref to a component that ' +
      'doesn\'t have an owner (that is, was not created inside of another ' +
      'component\'s `render` method). Try rendering this component inside of ' +
      'a new top-level component which will hold the ref.'
    ) : invariant(ReactOwner.isValidOwner(owner)));
    owner.attachRef(ref, component);
  },

  /**
   * Removes a component by ref from an owner component.
   *
   * @param {ReactComponent} component Component to dereference.
   * @param {string} ref Name of the ref to remove.
   * @param {ReactOwner} owner Component on which the ref is recorded.
   * @final
   * @internal
   */
  removeComponentAsRefFrom: function(component, ref, owner) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactOwner.isValidOwner(owner),
      'removeComponentAsRefFrom(...): Only a ReactOwner can have refs. This ' +
      'usually means that you\'re trying to remove a ref to a component that ' +
      'doesn\'t have an owner (that is, was not created inside of another ' +
      'component\'s `render` method). Try rendering this component inside of ' +
      'a new top-level component which will hold the ref.'
    ) : invariant(ReactOwner.isValidOwner(owner)));
    // Check that `component` is still the current ref because we do not want to
    // detach the ref if another component stole it.
    if (owner.refs[ref] === component) {
      owner.detachRef(ref);
    }
  },

  /**
   * A ReactComponent must mix this in to have refs.
   *
   * @lends {ReactOwner.prototype}
   */
  Mixin: {

    construct: function() {
      this.refs = emptyObject;
    },

    /**
     * Lazily allocates the refs object and stores `component` as `ref`.
     *
     * @param {string} ref Reference name.
     * @param {component} component Component to store as `ref`.
     * @final
     * @private
     */
    attachRef: function(ref, component) {
      ("production" !== process.env.NODE_ENV ? invariant(
        component.isOwnedBy(this),
        'attachRef(%s, ...): Only a component\'s owner can store a ref to it.',
        ref
      ) : invariant(component.isOwnedBy(this)));
      var refs = this.refs === emptyObject ? (this.refs = {}) : this.refs;
      refs[ref] = component;
    },

    /**
     * Detaches a reference name.
     *
     * @param {string} ref Name to dereference.
     * @final
     * @private
     */
    detachRef: function(ref) {
      delete this.refs[ref];
    }

  }

};

module.exports = ReactOwner;

}).call(this,require('_process'))
},{"./emptyObject":107,"./invariant":124,"_process":3}],69:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPerf
 * @typechecks static-only
 */

"use strict";

/**
 * ReactPerf is a general AOP system designed to measure performance. This
 * module only has the hooks: see ReactDefaultPerf for the analysis tool.
 */
var ReactPerf = {
  /**
   * Boolean to enable/disable measurement. Set to false by default to prevent
   * accidental logging and perf loss.
   */
  enableMeasure: false,

  /**
   * Holds onto the measure function in use. By default, don't measure
   * anything, but we'll override this if we inject a measure function.
   */
  storedMeasure: _noMeasure,

  /**
   * Use this to wrap methods you want to measure. Zero overhead in production.
   *
   * @param {string} objName
   * @param {string} fnName
   * @param {function} func
   * @return {function}
   */
  measure: function(objName, fnName, func) {
    if ("production" !== process.env.NODE_ENV) {
      var measuredFunc = null;
      return function() {
        if (ReactPerf.enableMeasure) {
          if (!measuredFunc) {
            measuredFunc = ReactPerf.storedMeasure(objName, fnName, func);
          }
          return measuredFunc.apply(this, arguments);
        }
        return func.apply(this, arguments);
      };
    }
    return func;
  },

  injection: {
    /**
     * @param {function} measure
     */
    injectMeasure: function(measure) {
      ReactPerf.storedMeasure = measure;
    }
  }
};

/**
 * Simply passes through the measured function, without measuring it.
 *
 * @param {string} objName
 * @param {string} fnName
 * @param {function} func
 * @return {function}
 */
function _noMeasure(objName, fnName, func) {
  return func;
}

module.exports = ReactPerf;

}).call(this,require('_process'))
},{"_process":3}],70:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPropTransferer
 */

"use strict";

var emptyFunction = require("./emptyFunction");
var invariant = require("./invariant");
var joinClasses = require("./joinClasses");
var merge = require("./merge");

/**
 * Creates a transfer strategy that will merge prop values using the supplied
 * `mergeStrategy`. If a prop was previously unset, this just sets it.
 *
 * @param {function} mergeStrategy
 * @return {function}
 */
function createTransferStrategy(mergeStrategy) {
  return function(props, key, value) {
    if (!props.hasOwnProperty(key)) {
      props[key] = value;
    } else {
      props[key] = mergeStrategy(props[key], value);
    }
  };
}

var transferStrategyMerge = createTransferStrategy(function(a, b) {
  // `merge` overrides the first object's (`props[key]` above) keys using the
  // second object's (`value`) keys. An object's style's existing `propA` would
  // get overridden. Flip the order here.
  return merge(b, a);
});

/**
 * Transfer strategies dictate how props are transferred by `transferPropsTo`.
 * NOTE: if you add any more exceptions to this list you should be sure to
 * update `cloneWithProps()` accordingly.
 */
var TransferStrategies = {
  /**
   * Never transfer `children`.
   */
  children: emptyFunction,
  /**
   * Transfer the `className` prop by merging them.
   */
  className: createTransferStrategy(joinClasses),
  /**
   * Never transfer the `key` prop.
   */
  key: emptyFunction,
  /**
   * Never transfer the `ref` prop.
   */
  ref: emptyFunction,
  /**
   * Transfer the `style` prop (which is an object) by merging them.
   */
  style: transferStrategyMerge
};

/**
 * Mutates the first argument by transferring the properties from the second
 * argument.
 *
 * @param {object} props
 * @param {object} newProps
 * @return {object}
 */
function transferInto(props, newProps) {
  for (var thisKey in newProps) {
    if (!newProps.hasOwnProperty(thisKey)) {
      continue;
    }

    var transferStrategy = TransferStrategies[thisKey];

    if (transferStrategy && TransferStrategies.hasOwnProperty(thisKey)) {
      transferStrategy(props, thisKey, newProps[thisKey]);
    } else if (!props.hasOwnProperty(thisKey)) {
      props[thisKey] = newProps[thisKey];
    }
  }
  return props;
}

/**
 * ReactPropTransferer are capable of transferring props to another component
 * using a `transferPropsTo` method.
 *
 * @class ReactPropTransferer
 */
var ReactPropTransferer = {

  TransferStrategies: TransferStrategies,

  /**
   * Merge two props objects using TransferStrategies.
   *
   * @param {object} oldProps original props (they take precedence)
   * @param {object} newProps new props to merge in
   * @return {object} a new object containing both sets of props merged.
   */
  mergeProps: function(oldProps, newProps) {
    return transferInto(merge(oldProps), newProps);
  },

  /**
   * @lends {ReactPropTransferer.prototype}
   */
  Mixin: {

    /**
     * Transfer props from this component to a target component.
     *
     * Props that do not have an explicit transfer strategy will be transferred
     * only if the target component does not already have the prop set.
     *
     * This is usually used to pass down props to a returned root component.
     *
     * @param {ReactDescriptor} descriptor Component receiving the properties.
     * @return {ReactDescriptor} The supplied `component`.
     * @final
     * @protected
     */
    transferPropsTo: function(descriptor) {
      ("production" !== process.env.NODE_ENV ? invariant(
        descriptor._owner === this,
        '%s: You can\'t call transferPropsTo() on a component that you ' +
        'don\'t own, %s. This usually means you are calling ' +
        'transferPropsTo() on a component passed in as props or children.',
        this.constructor.displayName,
        descriptor.type.displayName
      ) : invariant(descriptor._owner === this));

      // Because descriptors are immutable we have to merge into the existing
      // props object rather than clone it.
      transferInto(descriptor.props, this.props);

      return descriptor;
    }

  }
};

module.exports = ReactPropTransferer;

}).call(this,require('_process'))
},{"./emptyFunction":106,"./invariant":124,"./joinClasses":129,"./merge":134,"_process":3}],71:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPropTypeLocationNames
 */

"use strict";

var ReactPropTypeLocationNames = {};

if ("production" !== process.env.NODE_ENV) {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };
}

module.exports = ReactPropTypeLocationNames;

}).call(this,require('_process'))
},{"_process":3}],72:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPropTypeLocations
 */

"use strict";

var keyMirror = require("./keyMirror");

var ReactPropTypeLocations = keyMirror({
  prop: null,
  context: null,
  childContext: null
});

module.exports = ReactPropTypeLocations;

},{"./keyMirror":130}],73:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPropTypes
 */

"use strict";

var ReactDescriptor = require("./ReactDescriptor");
var ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");

var emptyFunction = require("./emptyFunction");

/**
 * Collection of methods that allow declaration and validation of props that are
 * supplied to React components. Example usage:
 *
 *   var Props = require('ReactPropTypes');
 *   var MyArticle = React.createClass({
 *     propTypes: {
 *       // An optional string prop named "description".
 *       description: Props.string,
 *
 *       // A required enum prop named "category".
 *       category: Props.oneOf(['News','Photos']).isRequired,
 *
 *       // A prop named "dialog" that requires an instance of Dialog.
 *       dialog: Props.instanceOf(Dialog).isRequired
 *     },
 *     render: function() { ... }
 *   });
 *
 * A more formal specification of how these methods are used:
 *
 *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
 *   decl := ReactPropTypes.{type}(.isRequired)?
 *
 * Each and every declaration produces a function with the same signature. This
 * allows the creation of custom validation functions. For example:
 *
 *  var MyLink = React.createClass({
 *    propTypes: {
 *      // An optional string or URI prop named "href".
 *      href: function(props, propName, componentName) {
 *        var propValue = props[propName];
 *        if (propValue != null && typeof propValue !== 'string' &&
 *            !(propValue instanceof URI)) {
 *          return new Error(
 *            'Expected a string or an URI for ' + propName + ' in ' +
 *            componentName
 *          );
 *        }
 *      }
 *    },
 *    render: function() {...}
 *  });
 *
 * @internal
 */

var ANONYMOUS = '<<anonymous>>';

var ReactPropTypes = {
  array: createPrimitiveTypeChecker('array'),
  bool: createPrimitiveTypeChecker('boolean'),
  func: createPrimitiveTypeChecker('function'),
  number: createPrimitiveTypeChecker('number'),
  object: createPrimitiveTypeChecker('object'),
  string: createPrimitiveTypeChecker('string'),

  any: createAnyTypeChecker(),
  arrayOf: createArrayOfTypeChecker,
  component: createComponentTypeChecker(),
  instanceOf: createInstanceTypeChecker,
  objectOf: createObjectOfTypeChecker,
  oneOf: createEnumTypeChecker,
  oneOfType: createUnionTypeChecker,
  renderable: createRenderableTypeChecker(),
  shape: createShapeTypeChecker
};

function createChainableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location) {
    componentName = componentName || ANONYMOUS;
    if (props[propName] == null) {
      var locationName = ReactPropTypeLocationNames[location];
      if (isRequired) {
        return new Error(
          ("Required " + locationName + " `" + propName + "` was not specified in ")+
          ("`" + componentName + "`.")
        );
      }
    } else {
      return validate(props, propName, componentName, location);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

function createPrimitiveTypeChecker(expectedType) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== expectedType) {
      var locationName = ReactPropTypeLocationNames[location];
      // `propValue` being instance of, say, date/regexp, pass the 'object'
      // check, but we can offer a more precise error message here rather than
      // 'of type `object`'.
      var preciseType = getPreciseType(propValue);

      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type `" + preciseType + "` ") +
        ("supplied to `" + componentName + "`, expected `" + expectedType + "`.")
      );
    }
  }
  return createChainableTypeChecker(validate);
}

function createAnyTypeChecker() {
  return createChainableTypeChecker(emptyFunction.thatReturns());
}

function createArrayOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    if (!Array.isArray(propValue)) {
      var locationName = ReactPropTypeLocationNames[location];
      var propType = getPropType(propValue);
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type ") +
        ("`" + propType + "` supplied to `" + componentName + "`, expected an array.")
      );
    }
    for (var i = 0; i < propValue.length; i++) {
      var error = typeChecker(propValue, i, componentName, location);
      if (error instanceof Error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate);
}

function createComponentTypeChecker() {
  function validate(props, propName, componentName, location) {
    if (!ReactDescriptor.isValidDescriptor(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected a React component.")
      );
    }
  }
  return createChainableTypeChecker(validate);
}

function createInstanceTypeChecker(expectedClass) {
  function validate(props, propName, componentName, location) {
    if (!(props[propName] instanceof expectedClass)) {
      var locationName = ReactPropTypeLocationNames[location];
      var expectedClassName = expectedClass.name || ANONYMOUS;
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected instance of `" + expectedClassName + "`.")
      );
    }
  }
  return createChainableTypeChecker(validate);
}

function createEnumTypeChecker(expectedValues) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    for (var i = 0; i < expectedValues.length; i++) {
      if (propValue === expectedValues[i]) {
        return;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    var valuesString = JSON.stringify(expectedValues);
    return new Error(
      ("Invalid " + locationName + " `" + propName + "` of value `" + propValue + "` ") +
      ("supplied to `" + componentName + "`, expected one of " + valuesString + ".")
    );
  }
  return createChainableTypeChecker(validate);
}

function createObjectOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type ") +
        ("`" + propType + "` supplied to `" + componentName + "`, expected an object.")
      );
    }
    for (var key in propValue) {
      if (propValue.hasOwnProperty(key)) {
        var error = typeChecker(propValue, key, componentName, location);
        if (error instanceof Error) {
          return error;
        }
      }
    }
  }
  return createChainableTypeChecker(validate);
}

function createUnionTypeChecker(arrayOfTypeCheckers) {
  function validate(props, propName, componentName, location) {
    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (checker(props, propName, componentName, location) == null) {
        return;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    return new Error(
      ("Invalid " + locationName + " `" + propName + "` supplied to ") +
      ("`" + componentName + "`.")
    );
  }
  return createChainableTypeChecker(validate);
}

function createRenderableTypeChecker() {
  function validate(props, propName, componentName, location) {
    if (!isRenderable(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected a renderable prop.")
      );
    }
  }
  return createChainableTypeChecker(validate);
}

function createShapeTypeChecker(shapeTypes) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type `" + propType + "` ") +
        ("supplied to `" + componentName + "`, expected `object`.")
      );
    }
    for (var key in shapeTypes) {
      var checker = shapeTypes[key];
      if (!checker) {
        continue;
      }
      var error = checker(propValue, key, componentName, location);
      if (error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate, 'expected `object`');
}

function isRenderable(propValue) {
  switch(typeof propValue) {
    // TODO: this was probably written with the assumption that we're not
    // returning `this.props.component` directly from `render`. This is
    // currently not supported but we should, to make it consistent.
    case 'number':
    case 'string':
      return true;
    case 'boolean':
      return !propValue;
    case 'object':
      if (Array.isArray(propValue)) {
        return propValue.every(isRenderable);
      }
      if (ReactDescriptor.isValidDescriptor(propValue)) {
        return true;
      }
      for (var k in propValue) {
        if (!isRenderable(propValue[k])) {
          return false;
        }
      }
      return true;
    default:
      return false;
  }
}

// Equivalent of `typeof` but with special handling for array and regexp.
function getPropType(propValue) {
  var propType = typeof propValue;
  if (Array.isArray(propValue)) {
    return 'array';
  }
  if (propValue instanceof RegExp) {
    // Old webkits (at least until Android 4.0) return 'function' rather than
    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
    // passes PropTypes.object.
    return 'object';
  }
  return propType;
}

// This handles more types than `getPropType`. Only used for error messages.
// See `createPrimitiveTypeChecker`.
function getPreciseType(propValue) {
  var propType = getPropType(propValue);
  if (propType === 'object') {
    if (propValue instanceof Date) {
      return 'date';
    } else if (propValue instanceof RegExp) {
      return 'regexp';
    }
  }
  return propType;
}

module.exports = ReactPropTypes;

},{"./ReactDescriptor":55,"./ReactPropTypeLocationNames":71,"./emptyFunction":106}],74:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPutListenerQueue
 */

"use strict";

var PooledClass = require("./PooledClass");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");

var mixInto = require("./mixInto");

function ReactPutListenerQueue() {
  this.listenersToPut = [];
}

mixInto(ReactPutListenerQueue, {
  enqueuePutListener: function(rootNodeID, propKey, propValue) {
    this.listenersToPut.push({
      rootNodeID: rootNodeID,
      propKey: propKey,
      propValue: propValue
    });
  },

  putListeners: function() {
    for (var i = 0; i < this.listenersToPut.length; i++) {
      var listenerToPut = this.listenersToPut[i];
      ReactBrowserEventEmitter.putListener(
        listenerToPut.rootNodeID,
        listenerToPut.propKey,
        listenerToPut.propValue
      );
    }
  },

  reset: function() {
    this.listenersToPut.length = 0;
  },

  destructor: function() {
    this.reset();
  }
});

PooledClass.addPoolingTo(ReactPutListenerQueue);

module.exports = ReactPutListenerQueue;

},{"./PooledClass":30,"./ReactBrowserEventEmitter":33,"./mixInto":137}],75:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactReconcileTransaction
 * @typechecks static-only
 */

"use strict";

var CallbackQueue = require("./CallbackQueue");
var PooledClass = require("./PooledClass");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactInputSelection = require("./ReactInputSelection");
var ReactPutListenerQueue = require("./ReactPutListenerQueue");
var Transaction = require("./Transaction");

var mixInto = require("./mixInto");

/**
 * Ensures that, when possible, the selection range (currently selected text
 * input) is not disturbed by performing the transaction.
 */
var SELECTION_RESTORATION = {
  /**
   * @return {Selection} Selection information.
   */
  initialize: ReactInputSelection.getSelectionInformation,
  /**
   * @param {Selection} sel Selection information returned from `initialize`.
   */
  close: ReactInputSelection.restoreSelection
};

/**
 * Suppresses events (blur/focus) that could be inadvertently dispatched due to
 * high level DOM manipulations (like temporarily removing a text input from the
 * DOM).
 */
var EVENT_SUPPRESSION = {
  /**
   * @return {boolean} The enabled status of `ReactBrowserEventEmitter` before
   * the reconciliation.
   */
  initialize: function() {
    var currentlyEnabled = ReactBrowserEventEmitter.isEnabled();
    ReactBrowserEventEmitter.setEnabled(false);
    return currentlyEnabled;
  },

  /**
   * @param {boolean} previouslyEnabled Enabled status of
   *   `ReactBrowserEventEmitter` before the reconciliation occured. `close`
   *   restores the previous value.
   */
  close: function(previouslyEnabled) {
    ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
  }
};

/**
 * Provides a queue for collecting `componentDidMount` and
 * `componentDidUpdate` callbacks during the the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
  initialize: function() {
    this.reactMountReady.reset();
  },

  /**
   * After DOM is flushed, invoke all registered `onDOMReady` callbacks.
   */
  close: function() {
    this.reactMountReady.notifyAll();
  }
};

var PUT_LISTENER_QUEUEING = {
  initialize: function() {
    this.putListenerQueue.reset();
  },

  close: function() {
    this.putListenerQueue.putListeners();
  }
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [
  PUT_LISTENER_QUEUEING,
  SELECTION_RESTORATION,
  EVENT_SUPPRESSION,
  ON_DOM_READY_QUEUEING
];

/**
 * Currently:
 * - The order that these are listed in the transaction is critical:
 * - Suppresses events.
 * - Restores selection range.
 *
 * Future:
 * - Restore document/overflow scroll positions that were unintentionally
 *   modified via DOM insertions above the top viewport boundary.
 * - Implement/integrate with customized constraint based layout system and keep
 *   track of which dimensions must be remeasured.
 *
 * @class ReactReconcileTransaction
 */
function ReactReconcileTransaction() {
  this.reinitializeTransaction();
  // Only server-side rendering really needs this option (see
  // `ReactServerRendering`), but server-side uses
  // `ReactServerRenderingTransaction` instead. This option is here so that it's
  // accessible and defaults to false when `ReactDOMComponent` and
  // `ReactTextComponent` checks it in `mountComponent`.`
  this.renderToStaticMarkup = false;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.putListenerQueue = ReactPutListenerQueue.getPooled();
}

var Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array<object>} List of operation wrap proceedures.
   *   TODO: convert to array<TransactionWrapper>
   */
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
  getReactMountReady: function() {
    return this.reactMountReady;
  },

  getPutListenerQueue: function() {
    return this.putListenerQueue;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be resused.
   */
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;

    ReactPutListenerQueue.release(this.putListenerQueue);
    this.putListenerQueue = null;
  }
};


mixInto(ReactReconcileTransaction, Transaction.Mixin);
mixInto(ReactReconcileTransaction, Mixin);

PooledClass.addPoolingTo(ReactReconcileTransaction);

module.exports = ReactReconcileTransaction;

},{"./CallbackQueue":9,"./PooledClass":30,"./ReactBrowserEventEmitter":33,"./ReactInputSelection":62,"./ReactPutListenerQueue":74,"./Transaction":96,"./mixInto":137}],76:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactRootIndex
 * @typechecks
 */

"use strict";

var ReactRootIndexInjection = {
  /**
   * @param {function} _createReactRootIndex
   */
  injectCreateReactRootIndex: function(_createReactRootIndex) {
    ReactRootIndex.createReactRootIndex = _createReactRootIndex;
  }
};

var ReactRootIndex = {
  createReactRootIndex: null,
  injection: ReactRootIndexInjection
};

module.exports = ReactRootIndex;

},{}],77:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @typechecks static-only
 * @providesModule ReactServerRendering
 */
"use strict";

var ReactDescriptor = require("./ReactDescriptor");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMarkupChecksum = require("./ReactMarkupChecksum");
var ReactServerRenderingTransaction =
  require("./ReactServerRenderingTransaction");

var instantiateReactComponent = require("./instantiateReactComponent");
var invariant = require("./invariant");

/**
 * @param {ReactComponent} component
 * @return {string} the HTML markup
 */
function renderComponentToString(component) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactDescriptor.isValidDescriptor(component),
    'renderComponentToString(): You must pass a valid ReactComponent.'
  ) : invariant(ReactDescriptor.isValidDescriptor(component)));

  ("production" !== process.env.NODE_ENV ? invariant(
    !(arguments.length === 2 && typeof arguments[1] === 'function'),
    'renderComponentToString(): This function became synchronous and now ' +
    'returns the generated markup. Please remove the second parameter.'
  ) : invariant(!(arguments.length === 2 && typeof arguments[1] === 'function')));

  var transaction;
  try {
    var id = ReactInstanceHandles.createReactRootID();
    transaction = ReactServerRenderingTransaction.getPooled(false);

    return transaction.perform(function() {
      var componentInstance = instantiateReactComponent(component);
      var markup = componentInstance.mountComponent(id, transaction, 0);
      return ReactMarkupChecksum.addChecksumToMarkup(markup);
    }, null);
  } finally {
    ReactServerRenderingTransaction.release(transaction);
  }
}

/**
 * @param {ReactComponent} component
 * @return {string} the HTML markup, without the extra React ID and checksum
* (for generating static pages)
 */
function renderComponentToStaticMarkup(component) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactDescriptor.isValidDescriptor(component),
    'renderComponentToStaticMarkup(): You must pass a valid ReactComponent.'
  ) : invariant(ReactDescriptor.isValidDescriptor(component)));

  var transaction;
  try {
    var id = ReactInstanceHandles.createReactRootID();
    transaction = ReactServerRenderingTransaction.getPooled(true);

    return transaction.perform(function() {
      var componentInstance = instantiateReactComponent(component);
      return componentInstance.mountComponent(id, transaction, 0);
    }, null);
  } finally {
    ReactServerRenderingTransaction.release(transaction);
  }
}

module.exports = {
  renderComponentToString: renderComponentToString,
  renderComponentToStaticMarkup: renderComponentToStaticMarkup
};

}).call(this,require('_process'))
},{"./ReactDescriptor":55,"./ReactInstanceHandles":63,"./ReactMarkupChecksum":64,"./ReactServerRenderingTransaction":78,"./instantiateReactComponent":123,"./invariant":124,"_process":3}],78:[function(require,module,exports){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactServerRenderingTransaction
 * @typechecks
 */

"use strict";

var PooledClass = require("./PooledClass");
var CallbackQueue = require("./CallbackQueue");
var ReactPutListenerQueue = require("./ReactPutListenerQueue");
var Transaction = require("./Transaction");

var emptyFunction = require("./emptyFunction");
var mixInto = require("./mixInto");

/**
 * Provides a `CallbackQueue` queue for collecting `onDOMReady` callbacks
 * during the performing of the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
  initialize: function() {
    this.reactMountReady.reset();
  },

  close: emptyFunction
};

var PUT_LISTENER_QUEUEING = {
  initialize: function() {
    this.putListenerQueue.reset();
  },

  close: emptyFunction
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [
  PUT_LISTENER_QUEUEING,
  ON_DOM_READY_QUEUEING
];

/**
 * @class ReactServerRenderingTransaction
 * @param {boolean} renderToStaticMarkup
 */
function ReactServerRenderingTransaction(renderToStaticMarkup) {
  this.reinitializeTransaction();
  this.renderToStaticMarkup = renderToStaticMarkup;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.putListenerQueue = ReactPutListenerQueue.getPooled();
}

var Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array} Empty list of operation wrap proceedures.
   */
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
  getReactMountReady: function() {
    return this.reactMountReady;
  },

  getPutListenerQueue: function() {
    return this.putListenerQueue;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be resused.
   */
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;

    ReactPutListenerQueue.release(this.putListenerQueue);
    this.putListenerQueue = null;
  }
};


mixInto(ReactServerRenderingTransaction, Transaction.Mixin);
mixInto(ReactServerRenderingTransaction, Mixin);

PooledClass.addPoolingTo(ReactServerRenderingTransaction);

module.exports = ReactServerRenderingTransaction;

},{"./CallbackQueue":9,"./PooledClass":30,"./ReactPutListenerQueue":74,"./Transaction":96,"./emptyFunction":106,"./mixInto":137}],79:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactTextComponent
 * @typechecks static-only
 */

"use strict";

var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactComponent = require("./ReactComponent");
var ReactDescriptor = require("./ReactDescriptor");

var escapeTextForBrowser = require("./escapeTextForBrowser");
var mixInto = require("./mixInto");

/**
 * Text nodes violate a couple assumptions that React makes about components:
 *
 *  - When mounting text into the DOM, adjacent text nodes are merged.
 *  - Text nodes cannot be assigned a React root ID.
 *
 * This component is used to wrap strings in elements so that they can undergo
 * the same reconciliation that is applied to elements.
 *
 * TODO: Investigate representing React components in the DOM with text nodes.
 *
 * @class ReactTextComponent
 * @extends ReactComponent
 * @internal
 */
var ReactTextComponent = function(descriptor) {
  this.construct(descriptor);
};

mixInto(ReactTextComponent, ReactComponent.Mixin);
mixInto(ReactTextComponent, ReactBrowserComponentMixin);
mixInto(ReactTextComponent, {

  /**
   * Creates the markup for this text node. This node is not intended to have
   * any features besides containing text content.
   *
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {number} mountDepth number of components in the owner hierarchy
   * @return {string} Markup for this text node.
   * @internal
   */
  mountComponent: function(rootID, transaction, mountDepth) {
    ReactComponent.Mixin.mountComponent.call(
      this,
      rootID,
      transaction,
      mountDepth
    );

    var escapedText = escapeTextForBrowser(this.props);

    if (transaction.renderToStaticMarkup) {
      // Normally we'd wrap this in a `span` for the reasons stated above, but
      // since this is a situation where React won't take over (static pages),
      // we can simply return the text as it is.
      return escapedText;
    }

    return (
      '<span ' + DOMPropertyOperations.createMarkupForID(rootID) + '>' +
        escapedText +
      '</span>'
    );
  },

  /**
   * Updates this component by updating the text content.
   *
   * @param {object} nextComponent Contains the next text content.
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  receiveComponent: function(nextComponent, transaction) {
    var nextProps = nextComponent.props;
    if (nextProps !== this.props) {
      this.props = nextProps;
      ReactComponent.BackendIDOperations.updateTextContentByID(
        this._rootNodeID,
        nextProps
      );
    }
  }

});

module.exports = ReactDescriptor.createFactory(ReactTextComponent);

},{"./DOMPropertyOperations":15,"./ReactBrowserComponentMixin":32,"./ReactComponent":35,"./ReactDescriptor":55,"./escapeTextForBrowser":108,"./mixInto":137}],80:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactUpdates
 */

"use strict";

var CallbackQueue = require("./CallbackQueue");
var PooledClass = require("./PooledClass");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactPerf = require("./ReactPerf");
var Transaction = require("./Transaction");

var invariant = require("./invariant");
var mixInto = require("./mixInto");
var warning = require("./warning");

var dirtyComponents = [];

var batchingStrategy = null;

function ensureInjected() {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactUpdates.ReactReconcileTransaction && batchingStrategy,
    'ReactUpdates: must inject a reconcile transaction class and batching ' +
    'strategy'
  ) : invariant(ReactUpdates.ReactReconcileTransaction && batchingStrategy));
}

var NESTED_UPDATES = {
  initialize: function() {
    this.dirtyComponentsLength = dirtyComponents.length;
  },
  close: function() {
    if (this.dirtyComponentsLength !== dirtyComponents.length) {
      // Additional updates were enqueued by componentDidUpdate handlers or
      // similar; before our own UPDATE_QUEUEING wrapper closes, we want to run
      // these new updates so that if A's componentDidUpdate calls setState on
      // B, B will update before the callback A's updater provided when calling
      // setState.
      dirtyComponents.splice(0, this.dirtyComponentsLength);
      flushBatchedUpdates();
    } else {
      dirtyComponents.length = 0;
    }
  }
};

var UPDATE_QUEUEING = {
  initialize: function() {
    this.callbackQueue.reset();
  },
  close: function() {
    this.callbackQueue.notifyAll();
  }
};

var TRANSACTION_WRAPPERS = [NESTED_UPDATES, UPDATE_QUEUEING];

function ReactUpdatesFlushTransaction() {
  this.reinitializeTransaction();
  this.dirtyComponentsLength = null;
  this.callbackQueue = CallbackQueue.getPooled(null);
  this.reconcileTransaction =
    ReactUpdates.ReactReconcileTransaction.getPooled();
}

mixInto(ReactUpdatesFlushTransaction, Transaction.Mixin);
mixInto(ReactUpdatesFlushTransaction, {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  destructor: function() {
    this.dirtyComponentsLength = null;
    CallbackQueue.release(this.callbackQueue);
    this.callbackQueue = null;
    ReactUpdates.ReactReconcileTransaction.release(this.reconcileTransaction);
    this.reconcileTransaction = null;
  },

  perform: function(method, scope, a) {
    // Essentially calls `this.reconcileTransaction.perform(method, scope, a)`
    // with this transaction's wrappers around it.
    return Transaction.Mixin.perform.call(
      this,
      this.reconcileTransaction.perform,
      this.reconcileTransaction,
      method,
      scope,
      a
    );
  }
});

PooledClass.addPoolingTo(ReactUpdatesFlushTransaction);

function batchedUpdates(callback, a, b) {
  ensureInjected();
  batchingStrategy.batchedUpdates(callback, a, b);
}

/**
 * Array comparator for ReactComponents by owner depth
 *
 * @param {ReactComponent} c1 first component you're comparing
 * @param {ReactComponent} c2 second component you're comparing
 * @return {number} Return value usable by Array.prototype.sort().
 */
function mountDepthComparator(c1, c2) {
  return c1._mountDepth - c2._mountDepth;
}

function runBatchedUpdates(transaction) {
  var len = transaction.dirtyComponentsLength;
  ("production" !== process.env.NODE_ENV ? invariant(
    len === dirtyComponents.length,
    'Expected flush transaction\'s stored dirty-components length (%s) to ' +
    'match dirty-components array length (%s).',
    len,
    dirtyComponents.length
  ) : invariant(len === dirtyComponents.length));

  // Since reconciling a component higher in the owner hierarchy usually (not
  // always -- see shouldComponentUpdate()) will reconcile children, reconcile
  // them before their children by sorting the array.
  dirtyComponents.sort(mountDepthComparator);

  for (var i = 0; i < len; i++) {
    // If a component is unmounted before pending changes apply, ignore them
    // TODO: Queue unmounts in the same list to avoid this happening at all
    var component = dirtyComponents[i];
    if (component.isMounted()) {
      // If performUpdateIfNecessary happens to enqueue any new updates, we
      // shouldn't execute the callbacks until the next render happens, so
      // stash the callbacks first
      var callbacks = component._pendingCallbacks;
      component._pendingCallbacks = null;
      component.performUpdateIfNecessary(transaction.reconcileTransaction);

      if (callbacks) {
        for (var j = 0; j < callbacks.length; j++) {
          transaction.callbackQueue.enqueue(
            callbacks[j],
            component
          );
        }
      }
    }
  }
}

var flushBatchedUpdates = ReactPerf.measure(
  'ReactUpdates',
  'flushBatchedUpdates',
  function() {
    // ReactUpdatesFlushTransaction's wrappers will clear the dirtyComponents
    // array and perform any updates enqueued by mount-ready handlers (i.e.,
    // componentDidUpdate) but we need to check here too in order to catch
    // updates enqueued by setState callbacks.
    while (dirtyComponents.length) {
      var transaction = ReactUpdatesFlushTransaction.getPooled();
      transaction.perform(runBatchedUpdates, null, transaction);
      ReactUpdatesFlushTransaction.release(transaction);
    }
  }
);

/**
 * Mark a component as needing a rerender, adding an optional callback to a
 * list of functions which will be executed once the rerender occurs.
 */
function enqueueUpdate(component, callback) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !callback || typeof callback === "function",
    'enqueueUpdate(...): You called `setProps`, `replaceProps`, ' +
    '`setState`, `replaceState`, or `forceUpdate` with a callback that ' +
    'isn\'t callable.'
  ) : invariant(!callback || typeof callback === "function"));
  ensureInjected();

  // Various parts of our code (such as ReactCompositeComponent's
  // _renderValidatedComponent) assume that calls to render aren't nested;
  // verify that that's the case. (This is called by each top-level update
  // function, like setProps, setState, forceUpdate, etc.; creation and
  // destruction of top-level components is guarded in ReactMount.)
  ("production" !== process.env.NODE_ENV ? warning(
    ReactCurrentOwner.current == null,
    'enqueueUpdate(): Render methods should be a pure function of props ' +
    'and state; triggering nested component updates from render is not ' +
    'allowed. If necessary, trigger nested updates in ' +
    'componentDidUpdate.'
  ) : null);

  if (!batchingStrategy.isBatchingUpdates) {
    batchingStrategy.batchedUpdates(enqueueUpdate, component, callback);
    return;
  }

  dirtyComponents.push(component);

  if (callback) {
    if (component._pendingCallbacks) {
      component._pendingCallbacks.push(callback);
    } else {
      component._pendingCallbacks = [callback];
    }
  }
}

var ReactUpdatesInjection = {
  injectReconcileTransaction: function(ReconcileTransaction) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReconcileTransaction,
      'ReactUpdates: must provide a reconcile transaction class'
    ) : invariant(ReconcileTransaction));
    ReactUpdates.ReactReconcileTransaction = ReconcileTransaction;
  },

  injectBatchingStrategy: function(_batchingStrategy) {
    ("production" !== process.env.NODE_ENV ? invariant(
      _batchingStrategy,
      'ReactUpdates: must provide a batching strategy'
    ) : invariant(_batchingStrategy));
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof _batchingStrategy.batchedUpdates === 'function',
      'ReactUpdates: must provide a batchedUpdates() function'
    ) : invariant(typeof _batchingStrategy.batchedUpdates === 'function'));
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof _batchingStrategy.isBatchingUpdates === 'boolean',
      'ReactUpdates: must provide an isBatchingUpdates boolean attribute'
    ) : invariant(typeof _batchingStrategy.isBatchingUpdates === 'boolean'));
    batchingStrategy = _batchingStrategy;
  }
};

var ReactUpdates = {
  /**
   * React references `ReactReconcileTransaction` using this property in order
   * to allow dependency injection.
   *
   * @internal
   */
  ReactReconcileTransaction: null,

  batchedUpdates: batchedUpdates,
  enqueueUpdate: enqueueUpdate,
  flushBatchedUpdates: flushBatchedUpdates,
  injection: ReactUpdatesInjection
};

module.exports = ReactUpdates;

}).call(this,require('_process'))
},{"./CallbackQueue":9,"./PooledClass":30,"./ReactCurrentOwner":39,"./ReactPerf":69,"./Transaction":96,"./invariant":124,"./mixInto":137,"./warning":147,"_process":3}],81:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SVGDOMPropertyConfig
 */

/*jslint bitwise: true*/

"use strict";

var DOMProperty = require("./DOMProperty");

var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;

var SVGDOMPropertyConfig = {
  Properties: {
    cx: MUST_USE_ATTRIBUTE,
    cy: MUST_USE_ATTRIBUTE,
    d: MUST_USE_ATTRIBUTE,
    dx: MUST_USE_ATTRIBUTE,
    dy: MUST_USE_ATTRIBUTE,
    fill: MUST_USE_ATTRIBUTE,
    fillOpacity: MUST_USE_ATTRIBUTE,
    fontFamily: MUST_USE_ATTRIBUTE,
    fontSize: MUST_USE_ATTRIBUTE,
    fx: MUST_USE_ATTRIBUTE,
    fy: MUST_USE_ATTRIBUTE,
    gradientTransform: MUST_USE_ATTRIBUTE,
    gradientUnits: MUST_USE_ATTRIBUTE,
    markerEnd: MUST_USE_ATTRIBUTE,
    markerMid: MUST_USE_ATTRIBUTE,
    markerStart: MUST_USE_ATTRIBUTE,
    offset: MUST_USE_ATTRIBUTE,
    opacity: MUST_USE_ATTRIBUTE,
    patternContentUnits: MUST_USE_ATTRIBUTE,
    patternUnits: MUST_USE_ATTRIBUTE,
    points: MUST_USE_ATTRIBUTE,
    preserveAspectRatio: MUST_USE_ATTRIBUTE,
    r: MUST_USE_ATTRIBUTE,
    rx: MUST_USE_ATTRIBUTE,
    ry: MUST_USE_ATTRIBUTE,
    spreadMethod: MUST_USE_ATTRIBUTE,
    stopColor: MUST_USE_ATTRIBUTE,
    stopOpacity: MUST_USE_ATTRIBUTE,
    stroke: MUST_USE_ATTRIBUTE,
    strokeDasharray: MUST_USE_ATTRIBUTE,
    strokeLinecap: MUST_USE_ATTRIBUTE,
    strokeOpacity: MUST_USE_ATTRIBUTE,
    strokeWidth: MUST_USE_ATTRIBUTE,
    textAnchor: MUST_USE_ATTRIBUTE,
    transform: MUST_USE_ATTRIBUTE,
    version: MUST_USE_ATTRIBUTE,
    viewBox: MUST_USE_ATTRIBUTE,
    x1: MUST_USE_ATTRIBUTE,
    x2: MUST_USE_ATTRIBUTE,
    x: MUST_USE_ATTRIBUTE,
    y1: MUST_USE_ATTRIBUTE,
    y2: MUST_USE_ATTRIBUTE,
    y: MUST_USE_ATTRIBUTE
  },
  DOMAttributeNames: {
    fillOpacity: 'fill-opacity',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    gradientTransform: 'gradientTransform',
    gradientUnits: 'gradientUnits',
    markerEnd: 'marker-end',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    patternContentUnits: 'patternContentUnits',
    patternUnits: 'patternUnits',
    preserveAspectRatio: 'preserveAspectRatio',
    spreadMethod: 'spreadMethod',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strokeDasharray: 'stroke-dasharray',
    strokeLinecap: 'stroke-linecap',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    textAnchor: 'text-anchor',
    viewBox: 'viewBox'
  }
};

module.exports = SVGDOMPropertyConfig;

},{"./DOMProperty":14}],82:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SelectEventPlugin
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var ReactInputSelection = require("./ReactInputSelection");
var SyntheticEvent = require("./SyntheticEvent");

var getActiveElement = require("./getActiveElement");
var isTextInputElement = require("./isTextInputElement");
var keyOf = require("./keyOf");
var shallowEqual = require("./shallowEqual");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  select: {
    phasedRegistrationNames: {
      bubbled: keyOf({onSelect: null}),
      captured: keyOf({onSelectCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topContextMenu,
      topLevelTypes.topFocus,
      topLevelTypes.topKeyDown,
      topLevelTypes.topMouseDown,
      topLevelTypes.topMouseUp,
      topLevelTypes.topSelectionChange
    ]
  }
};

var activeElement = null;
var activeElementID = null;
var lastSelection = null;
var mouseDown = false;

/**
 * Get an object which is a unique representation of the current selection.
 *
 * The return value will not be consistent across nodes or browsers, but
 * two identical selections on the same node will return identical objects.
 *
 * @param {DOMElement} node
 * @param {object}
 */
function getSelection(node) {
  if ('selectionStart' in node &&
      ReactInputSelection.hasSelectionCapabilities(node)) {
    return {
      start: node.selectionStart,
      end: node.selectionEnd
    };
  } else if (document.selection) {
    var range = document.selection.createRange();
    return {
      parentElement: range.parentElement(),
      text: range.text,
      top: range.boundingTop,
      left: range.boundingLeft
    };
  } else {
    var selection = window.getSelection();
    return {
      anchorNode: selection.anchorNode,
      anchorOffset: selection.anchorOffset,
      focusNode: selection.focusNode,
      focusOffset: selection.focusOffset
    };
  }
}

/**
 * Poll selection to see whether it's changed.
 *
 * @param {object} nativeEvent
 * @return {?SyntheticEvent}
 */
function constructSelectEvent(nativeEvent) {
  // Ensure we have the right element, and that the user is not dragging a
  // selection (this matches native `select` event behavior). In HTML5, select
  // fires only on input and textarea thus if there's no focused element we
  // won't dispatch.
  if (mouseDown ||
      activeElement == null ||
      activeElement != getActiveElement()) {
    return;
  }

  // Only fire when selection has actually changed.
  var currentSelection = getSelection(activeElement);
  if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
    lastSelection = currentSelection;

    var syntheticEvent = SyntheticEvent.getPooled(
      eventTypes.select,
      activeElementID,
      nativeEvent
    );

    syntheticEvent.type = 'select';
    syntheticEvent.target = activeElement;

    EventPropagators.accumulateTwoPhaseDispatches(syntheticEvent);

    return syntheticEvent;
  }
}

/**
 * This plugin creates an `onSelect` event that normalizes select events
 * across form elements.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - contentEditable
 *
 * This differs from native browser implementations in the following ways:
 * - Fires on contentEditable fields as well as inputs.
 * - Fires for collapsed selection.
 * - Fires after user input.
 */
var SelectEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    switch (topLevelType) {
      // Track the input node that has focus.
      case topLevelTypes.topFocus:
        if (isTextInputElement(topLevelTarget) ||
            topLevelTarget.contentEditable === 'true') {
          activeElement = topLevelTarget;
          activeElementID = topLevelTargetID;
          lastSelection = null;
        }
        break;
      case topLevelTypes.topBlur:
        activeElement = null;
        activeElementID = null;
        lastSelection = null;
        break;

      // Don't fire the event while the user is dragging. This matches the
      // semantics of the native select event.
      case topLevelTypes.topMouseDown:
        mouseDown = true;
        break;
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topMouseUp:
        mouseDown = false;
        return constructSelectEvent(nativeEvent);

      // Chrome and IE fire non-standard event when selection is changed (and
      // sometimes when it hasn't).
      // Firefox doesn't support selectionchange, so check selection status
      // after each key entry. The selection changes after keydown and before
      // keyup, but we check on keydown as well in the case of holding down a
      // key, when multiple keydown events are fired but only one keyup is.
      case topLevelTypes.topSelectionChange:
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyUp:
        return constructSelectEvent(nativeEvent);
    }
  }
};

module.exports = SelectEventPlugin;

},{"./EventConstants":19,"./EventPropagators":24,"./ReactInputSelection":62,"./SyntheticEvent":88,"./getActiveElement":112,"./isTextInputElement":127,"./keyOf":131,"./shallowEqual":143}],83:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ServerReactRootIndex
 * @typechecks
 */

"use strict";

/**
 * Size of the reactRoot ID space. We generate random numbers for React root
 * IDs and if there's a collision the events and DOM update system will
 * get confused. In the future we need a way to generate GUIDs but for
 * now this will work on a smaller scale.
 */
var GLOBAL_MOUNT_POINT_MAX = Math.pow(2, 53);

var ServerReactRootIndex = {
  createReactRootIndex: function() {
    return Math.ceil(Math.random() * GLOBAL_MOUNT_POINT_MAX);
  }
};

module.exports = ServerReactRootIndex;

},{}],84:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SimpleEventPlugin
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPluginUtils = require("./EventPluginUtils");
var EventPropagators = require("./EventPropagators");
var SyntheticClipboardEvent = require("./SyntheticClipboardEvent");
var SyntheticEvent = require("./SyntheticEvent");
var SyntheticFocusEvent = require("./SyntheticFocusEvent");
var SyntheticKeyboardEvent = require("./SyntheticKeyboardEvent");
var SyntheticMouseEvent = require("./SyntheticMouseEvent");
var SyntheticDragEvent = require("./SyntheticDragEvent");
var SyntheticTouchEvent = require("./SyntheticTouchEvent");
var SyntheticUIEvent = require("./SyntheticUIEvent");
var SyntheticWheelEvent = require("./SyntheticWheelEvent");

var invariant = require("./invariant");
var keyOf = require("./keyOf");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  blur: {
    phasedRegistrationNames: {
      bubbled: keyOf({onBlur: true}),
      captured: keyOf({onBlurCapture: true})
    }
  },
  click: {
    phasedRegistrationNames: {
      bubbled: keyOf({onClick: true}),
      captured: keyOf({onClickCapture: true})
    }
  },
  contextMenu: {
    phasedRegistrationNames: {
      bubbled: keyOf({onContextMenu: true}),
      captured: keyOf({onContextMenuCapture: true})
    }
  },
  copy: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCopy: true}),
      captured: keyOf({onCopyCapture: true})
    }
  },
  cut: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCut: true}),
      captured: keyOf({onCutCapture: true})
    }
  },
  doubleClick: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDoubleClick: true}),
      captured: keyOf({onDoubleClickCapture: true})
    }
  },
  drag: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDrag: true}),
      captured: keyOf({onDragCapture: true})
    }
  },
  dragEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragEnd: true}),
      captured: keyOf({onDragEndCapture: true})
    }
  },
  dragEnter: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragEnter: true}),
      captured: keyOf({onDragEnterCapture: true})
    }
  },
  dragExit: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragExit: true}),
      captured: keyOf({onDragExitCapture: true})
    }
  },
  dragLeave: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragLeave: true}),
      captured: keyOf({onDragLeaveCapture: true})
    }
  },
  dragOver: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragOver: true}),
      captured: keyOf({onDragOverCapture: true})
    }
  },
  dragStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragStart: true}),
      captured: keyOf({onDragStartCapture: true})
    }
  },
  drop: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDrop: true}),
      captured: keyOf({onDropCapture: true})
    }
  },
  focus: {
    phasedRegistrationNames: {
      bubbled: keyOf({onFocus: true}),
      captured: keyOf({onFocusCapture: true})
    }
  },
  input: {
    phasedRegistrationNames: {
      bubbled: keyOf({onInput: true}),
      captured: keyOf({onInputCapture: true})
    }
  },
  keyDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyDown: true}),
      captured: keyOf({onKeyDownCapture: true})
    }
  },
  keyPress: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyPress: true}),
      captured: keyOf({onKeyPressCapture: true})
    }
  },
  keyUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyUp: true}),
      captured: keyOf({onKeyUpCapture: true})
    }
  },
  load: {
    phasedRegistrationNames: {
      bubbled: keyOf({onLoad: true}),
      captured: keyOf({onLoadCapture: true})
    }
  },
  error: {
    phasedRegistrationNames: {
      bubbled: keyOf({onError: true}),
      captured: keyOf({onErrorCapture: true})
    }
  },
  // Note: We do not allow listening to mouseOver events. Instead, use the
  // onMouseEnter/onMouseLeave created by `EnterLeaveEventPlugin`.
  mouseDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseDown: true}),
      captured: keyOf({onMouseDownCapture: true})
    }
  },
  mouseMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseMove: true}),
      captured: keyOf({onMouseMoveCapture: true})
    }
  },
  mouseOut: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseOut: true}),
      captured: keyOf({onMouseOutCapture: true})
    }
  },
  mouseOver: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseOver: true}),
      captured: keyOf({onMouseOverCapture: true})
    }
  },
  mouseUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseUp: true}),
      captured: keyOf({onMouseUpCapture: true})
    }
  },
  paste: {
    phasedRegistrationNames: {
      bubbled: keyOf({onPaste: true}),
      captured: keyOf({onPasteCapture: true})
    }
  },
  reset: {
    phasedRegistrationNames: {
      bubbled: keyOf({onReset: true}),
      captured: keyOf({onResetCapture: true})
    }
  },
  scroll: {
    phasedRegistrationNames: {
      bubbled: keyOf({onScroll: true}),
      captured: keyOf({onScrollCapture: true})
    }
  },
  submit: {
    phasedRegistrationNames: {
      bubbled: keyOf({onSubmit: true}),
      captured: keyOf({onSubmitCapture: true})
    }
  },
  touchCancel: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchCancel: true}),
      captured: keyOf({onTouchCancelCapture: true})
    }
  },
  touchEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchEnd: true}),
      captured: keyOf({onTouchEndCapture: true})
    }
  },
  touchMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchMove: true}),
      captured: keyOf({onTouchMoveCapture: true})
    }
  },
  touchStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchStart: true}),
      captured: keyOf({onTouchStartCapture: true})
    }
  },
  wheel: {
    phasedRegistrationNames: {
      bubbled: keyOf({onWheel: true}),
      captured: keyOf({onWheelCapture: true})
    }
  }
};

var topLevelEventsToDispatchConfig = {
  topBlur:        eventTypes.blur,
  topClick:       eventTypes.click,
  topContextMenu: eventTypes.contextMenu,
  topCopy:        eventTypes.copy,
  topCut:         eventTypes.cut,
  topDoubleClick: eventTypes.doubleClick,
  topDrag:        eventTypes.drag,
  topDragEnd:     eventTypes.dragEnd,
  topDragEnter:   eventTypes.dragEnter,
  topDragExit:    eventTypes.dragExit,
  topDragLeave:   eventTypes.dragLeave,
  topDragOver:    eventTypes.dragOver,
  topDragStart:   eventTypes.dragStart,
  topDrop:        eventTypes.drop,
  topError:       eventTypes.error,
  topFocus:       eventTypes.focus,
  topInput:       eventTypes.input,
  topKeyDown:     eventTypes.keyDown,
  topKeyPress:    eventTypes.keyPress,
  topKeyUp:       eventTypes.keyUp,
  topLoad:        eventTypes.load,
  topMouseDown:   eventTypes.mouseDown,
  topMouseMove:   eventTypes.mouseMove,
  topMouseOut:    eventTypes.mouseOut,
  topMouseOver:   eventTypes.mouseOver,
  topMouseUp:     eventTypes.mouseUp,
  topPaste:       eventTypes.paste,
  topReset:       eventTypes.reset,
  topScroll:      eventTypes.scroll,
  topSubmit:      eventTypes.submit,
  topTouchCancel: eventTypes.touchCancel,
  topTouchEnd:    eventTypes.touchEnd,
  topTouchMove:   eventTypes.touchMove,
  topTouchStart:  eventTypes.touchStart,
  topWheel:       eventTypes.wheel
};

for (var topLevelType in topLevelEventsToDispatchConfig) {
  topLevelEventsToDispatchConfig[topLevelType].dependencies = [topLevelType];
}

var SimpleEventPlugin = {

  eventTypes: eventTypes,

  /**
   * Same as the default implementation, except cancels the event when return
   * value is false.
   *
   * @param {object} Event to be dispatched.
   * @param {function} Application-level callback.
   * @param {string} domID DOM ID to pass to the callback.
   */
  executeDispatch: function(event, listener, domID) {
    var returnValue = EventPluginUtils.executeDispatch(event, listener, domID);
    if (returnValue === false) {
      event.stopPropagation();
      event.preventDefault();
    }
  },

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
    if (!dispatchConfig) {
      return null;
    }
    var EventConstructor;
    switch (topLevelType) {
      case topLevelTypes.topInput:
      case topLevelTypes.topLoad:
      case topLevelTypes.topError:
      case topLevelTypes.topReset:
      case topLevelTypes.topSubmit:
        // HTML Events
        // @see http://www.w3.org/TR/html5/index.html#events-0
        EventConstructor = SyntheticEvent;
        break;
      case topLevelTypes.topKeyPress:
        // FireFox creates a keypress event for function keys too. This removes
        // the unwanted keypress events.
        if (nativeEvent.charCode === 0) {
          return null;
        }
        /* falls through */
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyUp:
        EventConstructor = SyntheticKeyboardEvent;
        break;
      case topLevelTypes.topBlur:
      case topLevelTypes.topFocus:
        EventConstructor = SyntheticFocusEvent;
        break;
      case topLevelTypes.topClick:
        // Firefox creates a click event on right mouse clicks. This removes the
        // unwanted click events.
        if (nativeEvent.button === 2) {
          return null;
        }
        /* falls through */
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topDoubleClick:
      case topLevelTypes.topMouseDown:
      case topLevelTypes.topMouseMove:
      case topLevelTypes.topMouseOut:
      case topLevelTypes.topMouseOver:
      case topLevelTypes.topMouseUp:
        EventConstructor = SyntheticMouseEvent;
        break;
      case topLevelTypes.topDrag:
      case topLevelTypes.topDragEnd:
      case topLevelTypes.topDragEnter:
      case topLevelTypes.topDragExit:
      case topLevelTypes.topDragLeave:
      case topLevelTypes.topDragOver:
      case topLevelTypes.topDragStart:
      case topLevelTypes.topDrop:
        EventConstructor = SyntheticDragEvent;
        break;
      case topLevelTypes.topTouchCancel:
      case topLevelTypes.topTouchEnd:
      case topLevelTypes.topTouchMove:
      case topLevelTypes.topTouchStart:
        EventConstructor = SyntheticTouchEvent;
        break;
      case topLevelTypes.topScroll:
        EventConstructor = SyntheticUIEvent;
        break;
      case topLevelTypes.topWheel:
        EventConstructor = SyntheticWheelEvent;
        break;
      case topLevelTypes.topCopy:
      case topLevelTypes.topCut:
      case topLevelTypes.topPaste:
        EventConstructor = SyntheticClipboardEvent;
        break;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      EventConstructor,
      'SimpleEventPlugin: Unhandled event type, `%s`.',
      topLevelType
    ) : invariant(EventConstructor));
    var event = EventConstructor.getPooled(
      dispatchConfig,
      topLevelTargetID,
      nativeEvent
    );
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  }

};

module.exports = SimpleEventPlugin;

}).call(this,require('_process'))
},{"./EventConstants":19,"./EventPluginUtils":23,"./EventPropagators":24,"./SyntheticClipboardEvent":85,"./SyntheticDragEvent":87,"./SyntheticEvent":88,"./SyntheticFocusEvent":89,"./SyntheticKeyboardEvent":91,"./SyntheticMouseEvent":92,"./SyntheticTouchEvent":93,"./SyntheticUIEvent":94,"./SyntheticWheelEvent":95,"./invariant":124,"./keyOf":131,"_process":3}],85:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticClipboardEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/clipboard-apis/
 */
var ClipboardEventInterface = {
  clipboardData: function(event) {
    return (
      'clipboardData' in event ?
        event.clipboardData :
        window.clipboardData
    );
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticClipboardEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(SyntheticClipboardEvent, ClipboardEventInterface);

module.exports = SyntheticClipboardEvent;


},{"./SyntheticEvent":88}],86:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticCompositionEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#events-compositionevents
 */
var CompositionEventInterface = {
  data: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticCompositionEvent(
  dispatchConfig,
  dispatchMarker,
  nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(
  SyntheticCompositionEvent,
  CompositionEventInterface
);

module.exports = SyntheticCompositionEvent;


},{"./SyntheticEvent":88}],87:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticDragEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticMouseEvent = require("./SyntheticMouseEvent");

/**
 * @interface DragEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var DragEventInterface = {
  dataTransfer: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticDragEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticMouseEvent.augmentClass(SyntheticDragEvent, DragEventInterface);

module.exports = SyntheticDragEvent;

},{"./SyntheticMouseEvent":92}],88:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticEvent
 * @typechecks static-only
 */

"use strict";

var PooledClass = require("./PooledClass");

var emptyFunction = require("./emptyFunction");
var getEventTarget = require("./getEventTarget");
var merge = require("./merge");
var mergeInto = require("./mergeInto");

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var EventInterface = {
  type: null,
  target: getEventTarget,
  // currentTarget is set when dispatching; no use in copying it here
  currentTarget: emptyFunction.thatReturnsNull,
  eventPhase: null,
  bubbles: null,
  cancelable: null,
  timeStamp: function(event) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: null,
  isTrusted: null
};

/**
 * Synthetic events are dispatched by event plugins, typically in response to a
 * top-level event delegation handler.
 *
 * These systems should generally use pooling to reduce the frequency of garbage
 * collection. The system should check `isPersistent` to determine whether the
 * event should be released into the pool after being dispatched. Users that
 * need a persisted event should invoke `persist`.
 *
 * Synthetic events (and subclasses) implement the DOM Level 3 Events API by
 * normalizing browser quirks. Subclasses do not necessarily have to implement a
 * DOM interface; custom application-specific events can also subclass this.
 *
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 */
function SyntheticEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  this.dispatchConfig = dispatchConfig;
  this.dispatchMarker = dispatchMarker;
  this.nativeEvent = nativeEvent;

  var Interface = this.constructor.Interface;
  for (var propName in Interface) {
    if (!Interface.hasOwnProperty(propName)) {
      continue;
    }
    var normalize = Interface[propName];
    if (normalize) {
      this[propName] = normalize(nativeEvent);
    } else {
      this[propName] = nativeEvent[propName];
    }
  }

  var defaultPrevented = nativeEvent.defaultPrevented != null ?
    nativeEvent.defaultPrevented :
    nativeEvent.returnValue === false;
  if (defaultPrevented) {
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  } else {
    this.isDefaultPrevented = emptyFunction.thatReturnsFalse;
  }
  this.isPropagationStopped = emptyFunction.thatReturnsFalse;
}

mergeInto(SyntheticEvent.prototype, {

  preventDefault: function() {
    this.defaultPrevented = true;
    var event = this.nativeEvent;
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  },

  stopPropagation: function() {
    var event = this.nativeEvent;
    event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
    this.isPropagationStopped = emptyFunction.thatReturnsTrue;
  },

  /**
   * We release all dispatched `SyntheticEvent`s after each event loop, adding
   * them back into the pool. This allows a way to hold onto a reference that
   * won't be added back into the pool.
   */
  persist: function() {
    this.isPersistent = emptyFunction.thatReturnsTrue;
  },

  /**
   * Checks if this event should be released back into the pool.
   *
   * @return {boolean} True if this should not be released, false otherwise.
   */
  isPersistent: emptyFunction.thatReturnsFalse,

  /**
   * `PooledClass` looks for `destructor` on each instance it releases.
   */
  destructor: function() {
    var Interface = this.constructor.Interface;
    for (var propName in Interface) {
      this[propName] = null;
    }
    this.dispatchConfig = null;
    this.dispatchMarker = null;
    this.nativeEvent = null;
  }

});

SyntheticEvent.Interface = EventInterface;

/**
 * Helper to reduce boilerplate when creating subclasses.
 *
 * @param {function} Class
 * @param {?object} Interface
 */
SyntheticEvent.augmentClass = function(Class, Interface) {
  var Super = this;

  var prototype = Object.create(Super.prototype);
  mergeInto(prototype, Class.prototype);
  Class.prototype = prototype;
  Class.prototype.constructor = Class;

  Class.Interface = merge(Super.Interface, Interface);
  Class.augmentClass = Super.augmentClass;

  PooledClass.addPoolingTo(Class, PooledClass.threeArgumentPooler);
};

PooledClass.addPoolingTo(SyntheticEvent, PooledClass.threeArgumentPooler);

module.exports = SyntheticEvent;

},{"./PooledClass":30,"./emptyFunction":106,"./getEventTarget":115,"./merge":134,"./mergeInto":136}],89:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticFocusEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");

/**
 * @interface FocusEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var FocusEventInterface = {
  relatedTarget: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);

module.exports = SyntheticFocusEvent;

},{"./SyntheticUIEvent":94}],90:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticInputEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105
 *      /#events-inputevents
 */
var InputEventInterface = {
  data: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticInputEvent(
  dispatchConfig,
  dispatchMarker,
  nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(
  SyntheticInputEvent,
  InputEventInterface
);

module.exports = SyntheticInputEvent;


},{"./SyntheticEvent":88}],91:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticKeyboardEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");

var getEventKey = require("./getEventKey");
var getEventModifierState = require("./getEventModifierState");

/**
 * @interface KeyboardEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var KeyboardEventInterface = {
  key: getEventKey,
  location: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  repeat: null,
  locale: null,
  getModifierState: getEventModifierState,
  // Legacy Interface
  charCode: function(event) {
    // `charCode` is the result of a KeyPress event and represents the value of
    // the actual printable character.

    // KeyPress is deprecated but its replacement is not yet final and not
    // implemented in any major browser.
    if (event.type === 'keypress') {
      // IE8 does not implement "charCode", but "keyCode" has the correct value.
      return 'charCode' in event ? event.charCode : event.keyCode;
    }
    return 0;
  },
  keyCode: function(event) {
    // `keyCode` is the result of a KeyDown/Up event and represents the value of
    // physical keyboard key.

    // The actual meaning of the value depends on the users' keyboard layout
    // which cannot be detected. Assuming that it is a US keyboard layout
    // provides a surprisingly accurate mapping for US and European users.
    // Due to this, it is left to the user to implement at this time.
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  },
  which: function(event) {
    // `which` is an alias for either `keyCode` or `charCode` depending on the
    // type of the event. There is no need to determine the type of the event
    // as `keyCode` and `charCode` are either aliased or default to zero.
    return event.keyCode || event.charCode;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticKeyboardEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticKeyboardEvent, KeyboardEventInterface);

module.exports = SyntheticKeyboardEvent;

},{"./SyntheticUIEvent":94,"./getEventKey":113,"./getEventModifierState":114}],92:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticMouseEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");
var ViewportMetrics = require("./ViewportMetrics");

var getEventModifierState = require("./getEventModifierState");

/**
 * @interface MouseEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var MouseEventInterface = {
  screenX: null,
  screenY: null,
  clientX: null,
  clientY: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  getModifierState: getEventModifierState,
  button: function(event) {
    // Webkit, Firefox, IE9+
    // which:  1 2 3
    // button: 0 1 2 (standard)
    var button = event.button;
    if ('which' in event) {
      return button;
    }
    // IE<9
    // which:  undefined
    // button: 0 0 0
    // button: 1 4 2 (onmouseup)
    return button === 2 ? 2 : button === 4 ? 1 : 0;
  },
  buttons: null,
  relatedTarget: function(event) {
    return event.relatedTarget || (
      event.fromElement === event.srcElement ?
        event.toElement :
        event.fromElement
    );
  },
  // "Proprietary" Interface.
  pageX: function(event) {
    return 'pageX' in event ?
      event.pageX :
      event.clientX + ViewportMetrics.currentScrollLeft;
  },
  pageY: function(event) {
    return 'pageY' in event ?
      event.pageY :
      event.clientY + ViewportMetrics.currentScrollTop;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticMouseEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticMouseEvent, MouseEventInterface);

module.exports = SyntheticMouseEvent;

},{"./SyntheticUIEvent":94,"./ViewportMetrics":97,"./getEventModifierState":114}],93:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticTouchEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");

var getEventModifierState = require("./getEventModifierState");

/**
 * @interface TouchEvent
 * @see http://www.w3.org/TR/touch-events/
 */
var TouchEventInterface = {
  touches: null,
  targetTouches: null,
  changedTouches: null,
  altKey: null,
  metaKey: null,
  ctrlKey: null,
  shiftKey: null,
  getModifierState: getEventModifierState
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);

module.exports = SyntheticTouchEvent;

},{"./SyntheticUIEvent":94,"./getEventModifierState":114}],94:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticUIEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticEvent = require("./SyntheticEvent");

var getEventTarget = require("./getEventTarget");

/**
 * @interface UIEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var UIEventInterface = {
  view: function(event) {
    if (event.view) {
      return event.view;
    }

    var target = getEventTarget(event);
    if (target != null && target.window === target) {
      // target is a window object
      return target;
    }

    var doc = target.ownerDocument;
    // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
    if (doc) {
      return doc.defaultView || doc.parentWindow;
    } else {
      return window;
    }
  },
  detail: function(event) {
    return event.detail || 0;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticUIEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(SyntheticUIEvent, UIEventInterface);

module.exports = SyntheticUIEvent;

},{"./SyntheticEvent":88,"./getEventTarget":115}],95:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticWheelEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticMouseEvent = require("./SyntheticMouseEvent");

/**
 * @interface WheelEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var WheelEventInterface = {
  deltaX: function(event) {
    return (
      'deltaX' in event ? event.deltaX :
      // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
      'wheelDeltaX' in event ? -event.wheelDeltaX : 0
    );
  },
  deltaY: function(event) {
    return (
      'deltaY' in event ? event.deltaY :
      // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
      'wheelDeltaY' in event ? -event.wheelDeltaY :
      // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
      'wheelDelta' in event ? -event.wheelDelta : 0
    );
  },
  deltaZ: null,

  // Browsers without "deltaMode" is reporting in raw wheel delta where one
  // notch on the scroll is always +/- 120, roughly equivalent to pixels.
  // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
  // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
  deltaMode: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticMouseEvent}
 */
function SyntheticWheelEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticMouseEvent.augmentClass(SyntheticWheelEvent, WheelEventInterface);

module.exports = SyntheticWheelEvent;

},{"./SyntheticMouseEvent":92}],96:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule Transaction
 */

"use strict";

var invariant = require("./invariant");

/**
 * `Transaction` creates a black box that is able to wrap any method such that
 * certain invariants are maintained before and after the method is invoked
 * (Even if an exception is thrown while invoking the wrapped method). Whoever
 * instantiates a transaction can provide enforcers of the invariants at
 * creation time. The `Transaction` class itself will supply one additional
 * automatic invariant for you - the invariant that any transaction instance
 * should not be run while it is already being run. You would typically create a
 * single instance of a `Transaction` for reuse multiple times, that potentially
 * is used to wrap several different methods. Wrappers are extremely simple -
 * they only require implementing two methods.
 *
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 *
 * Use cases:
 * - Preserving the input selection ranges before/after reconciliation.
 *   Restoring selection even in the event of an unexpected error.
 * - Deactivating events while rearranging the DOM, preventing blurs/focuses,
 *   while guaranteeing that afterwards, the event system is reactivated.
 * - Flushing a queue of collected DOM mutations to the main UI thread after a
 *   reconciliation takes place in a worker thread.
 * - Invoking any collected `componentDidUpdate` callbacks after rendering new
 *   content.
 * - (Future use case): Wrapping particular flushes of the `ReactWorker` queue
 *   to preserve the `scrollTop` (an automatic scroll aware DOM).
 * - (Future use case): Layout calculations before and after DOM upates.
 *
 * Transactional plugin API:
 * - A module that has an `initialize` method that returns any precomputation.
 * - and a `close` method that accepts the precomputation. `close` is invoked
 *   when the wrapped process is completed, or has failed.
 *
 * @param {Array<TransactionalWrapper>} transactionWrapper Wrapper modules
 * that implement `initialize` and `close`.
 * @return {Transaction} Single transaction for reuse in thread.
 *
 * @class Transaction
 */
var Mixin = {
  /**
   * Sets up this instance so that it is prepared for collecting metrics. Does
   * so such that this setup method may be used on an instance that is already
   * initialized, in a way that does not consume additional memory upon reuse.
   * That can be useful if you decide to make your subclass of this mixin a
   * "PooledClass".
   */
  reinitializeTransaction: function() {
    this.transactionWrappers = this.getTransactionWrappers();
    if (!this.wrapperInitData) {
      this.wrapperInitData = [];
    } else {
      this.wrapperInitData.length = 0;
    }
    this._isInTransaction = false;
  },

  _isInTransaction: false,

  /**
   * @abstract
   * @return {Array<TransactionWrapper>} Array of transaction wrappers.
   */
  getTransactionWrappers: null,

  isInTransaction: function() {
    return !!this._isInTransaction;
  },

  /**
   * Executes the function within a safety window. Use this for the top level
   * methods that result in large amounts of computation/mutations that would
   * need to be safety checked.
   *
   * @param {function} method Member of scope to call.
   * @param {Object} scope Scope to invoke from.
   * @param {Object?=} args... Arguments to pass to the method (optional).
   *                           Helps prevent need to bind in many cases.
   * @return Return value from `method`.
   */
  perform: function(method, scope, a, b, c, d, e, f) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !this.isInTransaction(),
      'Transaction.perform(...): Cannot initialize a transaction when there ' +
      'is already an outstanding transaction.'
    ) : invariant(!this.isInTransaction()));
    var errorThrown;
    var ret;
    try {
      this._isInTransaction = true;
      // Catching errors makes debugging more difficult, so we start with
      // errorThrown set to true before setting it to false after calling
      // close -- if it's still set to true in the finally block, it means
      // one of these calls threw.
      errorThrown = true;
      this.initializeAll(0);
      ret = method.call(scope, a, b, c, d, e, f);
      errorThrown = false;
    } finally {
      try {
        if (errorThrown) {
          // If `method` throws, prefer to show that stack trace over any thrown
          // by invoking `closeAll`.
          try {
            this.closeAll(0);
          } catch (err) {
          }
        } else {
          // Since `method` didn't throw, we don't want to silence the exception
          // here.
          this.closeAll(0);
        }
      } finally {
        this._isInTransaction = false;
      }
    }
    return ret;
  },

  initializeAll: function(startIndex) {
    var transactionWrappers = this.transactionWrappers;
    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      try {
        // Catching errors makes debugging more difficult, so we start with the
        // OBSERVED_ERROR state before overwriting it with the real return value
        // of initialize -- if it's still set to OBSERVED_ERROR in the finally
        // block, it means wrapper.initialize threw.
        this.wrapperInitData[i] = Transaction.OBSERVED_ERROR;
        this.wrapperInitData[i] = wrapper.initialize ?
          wrapper.initialize.call(this) :
          null;
      } finally {
        if (this.wrapperInitData[i] === Transaction.OBSERVED_ERROR) {
          // The initializer for wrapper i threw an error; initialize the
          // remaining wrappers but silence any exceptions from them to ensure
          // that the first error is the one to bubble up.
          try {
            this.initializeAll(i + 1);
          } catch (err) {
          }
        }
      }
    }
  },

  /**
   * Invokes each of `this.transactionWrappers.close[i]` functions, passing into
   * them the respective return values of `this.transactionWrappers.init[i]`
   * (`close`rs that correspond to initializers that failed will not be
   * invoked).
   */
  closeAll: function(startIndex) {
    ("production" !== process.env.NODE_ENV ? invariant(
      this.isInTransaction(),
      'Transaction.closeAll(): Cannot close transaction when none are open.'
    ) : invariant(this.isInTransaction()));
    var transactionWrappers = this.transactionWrappers;
    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      var initData = this.wrapperInitData[i];
      var errorThrown;
      try {
        // Catching errors makes debugging more difficult, so we start with
        // errorThrown set to true before setting it to false after calling
        // close -- if it's still set to true in the finally block, it means
        // wrapper.close threw.
        errorThrown = true;
        if (initData !== Transaction.OBSERVED_ERROR) {
          wrapper.close && wrapper.close.call(this, initData);
        }
        errorThrown = false;
      } finally {
        if (errorThrown) {
          // The closer for wrapper i threw an error; close the remaining
          // wrappers but silence any exceptions from them to ensure that the
          // first error is the one to bubble up.
          try {
            this.closeAll(i + 1);
          } catch (e) {
          }
        }
      }
    }
    this.wrapperInitData.length = 0;
  }
};

var Transaction = {

  Mixin: Mixin,

  /**
   * Token to look for to determine if an error occured.
   */
  OBSERVED_ERROR: {}

};

module.exports = Transaction;

}).call(this,require('_process'))
},{"./invariant":124,"_process":3}],97:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ViewportMetrics
 */

"use strict";

var getUnboundedScrollPosition = require("./getUnboundedScrollPosition");

var ViewportMetrics = {

  currentScrollLeft: 0,

  currentScrollTop: 0,

  refreshScrollValues: function() {
    var scrollPosition = getUnboundedScrollPosition(window);
    ViewportMetrics.currentScrollLeft = scrollPosition.x;
    ViewportMetrics.currentScrollTop = scrollPosition.y;
  }

};

module.exports = ViewportMetrics;

},{"./getUnboundedScrollPosition":120}],98:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule accumulate
 */

"use strict";

var invariant = require("./invariant");

/**
 * Accumulates items that must not be null or undefined.
 *
 * This is used to conserve memory by avoiding array allocations.
 *
 * @return {*|array<*>} An accumulation of items.
 */
function accumulate(current, next) {
  ("production" !== process.env.NODE_ENV ? invariant(
    next != null,
    'accumulate(...): Accumulated items must be not be null or undefined.'
  ) : invariant(next != null));
  if (current == null) {
    return next;
  } else {
    // Both are not empty. Warning: Never call x.concat(y) when you are not
    // certain that x is an Array (x could be a string with concat method).
    var currentIsArray = Array.isArray(current);
    var nextIsArray = Array.isArray(next);
    if (currentIsArray) {
      return current.concat(next);
    } else {
      if (nextIsArray) {
        return [current].concat(next);
      } else {
        return [current, next];
      }
    }
  }
}

module.exports = accumulate;

}).call(this,require('_process'))
},{"./invariant":124,"_process":3}],99:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule adler32
 */

/* jslint bitwise:true */

"use strict";

var MOD = 65521;

// This is a clean-room implementation of adler32 designed for detecting
// if markup is not what we expect it to be. It does not need to be
// cryptographically strong, only reasonable good at detecting if markup
// generated on the server is different than that on the client.
function adler32(data) {
  var a = 1;
  var b = 0;
  for (var i = 0; i < data.length; i++) {
    a = (a + data.charCodeAt(i)) % MOD;
    b = (b + a) % MOD;
  }
  return a | (b << 16);
}

module.exports = adler32;

},{}],100:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule containsNode
 * @typechecks
 */

var isTextNode = require("./isTextNode");

/*jslint bitwise:true */

/**
 * Checks if a given DOM node contains or is another DOM node.
 *
 * @param {?DOMNode} outerNode Outer DOM node.
 * @param {?DOMNode} innerNode Inner DOM node.
 * @return {boolean} True if `outerNode` contains or is `innerNode`.
 */
function containsNode(outerNode, innerNode) {
  if (!outerNode || !innerNode) {
    return false;
  } else if (outerNode === innerNode) {
    return true;
  } else if (isTextNode(outerNode)) {
    return false;
  } else if (isTextNode(innerNode)) {
    return containsNode(outerNode, innerNode.parentNode);
  } else if (outerNode.contains) {
    return outerNode.contains(innerNode);
  } else if (outerNode.compareDocumentPosition) {
    return !!(outerNode.compareDocumentPosition(innerNode) & 16);
  } else {
    return false;
  }
}

module.exports = containsNode;

},{"./isTextNode":128}],101:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule copyProperties
 */

/**
 * Copy properties from one or more objects (up to 5) into the first object.
 * This is a shallow copy. It mutates the first object and also returns it.
 *
 * NOTE: `arguments` has a very significant performance penalty, which is why
 * we don't support unlimited arguments.
 */
function copyProperties(obj, a, b, c, d, e, f) {
  obj = obj || {};

  if ("production" !== process.env.NODE_ENV) {
    if (f) {
      throw new Error('Too many arguments passed to copyProperties');
    }
  }

  var args = [a, b, c, d, e];
  var ii = 0, v;
  while (args[ii]) {
    v = args[ii++];
    for (var k in v) {
      obj[k] = v[k];
    }

    // IE ignores toString in object iteration.. See:
    // webreflection.blogspot.com/2007/07/quick-fix-internet-explorer-and.html
    if (v.hasOwnProperty && v.hasOwnProperty('toString') &&
        (typeof v.toString != 'undefined') && (obj.toString !== v.toString)) {
      obj.toString = v.toString;
    }
  }

  return obj;
}

module.exports = copyProperties;

}).call(this,require('_process'))
},{"_process":3}],102:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule createArrayFrom
 * @typechecks
 */

var toArray = require("./toArray");

/**
 * Perform a heuristic test to determine if an object is "array-like".
 *
 *   A monk asked Joshu, a Zen master, "Has a dog Buddha nature?"
 *   Joshu replied: "Mu."
 *
 * This function determines if its argument has "array nature": it returns
 * true if the argument is an actual array, an `arguments' object, or an
 * HTMLCollection (e.g. node.childNodes or node.getElementsByTagName()).
 *
 * It will return false for other array-like objects like Filelist.
 *
 * @param {*} obj
 * @return {boolean}
 */
function hasArrayNature(obj) {
  return (
    // not null/false
    !!obj &&
    // arrays are objects, NodeLists are functions in Safari
    (typeof obj == 'object' || typeof obj == 'function') &&
    // quacks like an array
    ('length' in obj) &&
    // not window
    !('setInterval' in obj) &&
    // no DOM node should be considered an array-like
    // a 'select' element has 'length' and 'item' properties on IE8
    (typeof obj.nodeType != 'number') &&
    (
      // a real array
      (// HTMLCollection/NodeList
      (Array.isArray(obj) ||
      // arguments
      ('callee' in obj) || 'item' in obj))
    )
  );
}

/**
 * Ensure that the argument is an array by wrapping it in an array if it is not.
 * Creates a copy of the argument if it is already an array.
 *
 * This is mostly useful idiomatically:
 *
 *   var createArrayFrom = require('createArrayFrom');
 *
 *   function takesOneOrMoreThings(things) {
 *     things = createArrayFrom(things);
 *     ...
 *   }
 *
 * This allows you to treat `things' as an array, but accept scalars in the API.
 *
 * If you need to convert an array-like object, like `arguments`, into an array
 * use toArray instead.
 *
 * @param {*} obj
 * @return {array}
 */
function createArrayFrom(obj) {
  if (!hasArrayNature(obj)) {
    return [obj];
  } else if (Array.isArray(obj)) {
    return obj.slice();
  } else {
    return toArray(obj);
  }
}

module.exports = createArrayFrom;

},{"./toArray":145}],103:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule createFullPageComponent
 * @typechecks
 */

"use strict";

// Defeat circular references by requiring this directly.
var ReactCompositeComponent = require("./ReactCompositeComponent");

var invariant = require("./invariant");

/**
 * Create a component that will throw an exception when unmounted.
 *
 * Components like <html> <head> and <body> can't be removed or added
 * easily in a cross-browser way, however it's valuable to be able to
 * take advantage of React's reconciliation for styling and <title>
 * management. So we just document it and throw in dangerous cases.
 *
 * @param {function} componentClass convenience constructor to wrap
 * @return {function} convenience constructor of new component
 */
function createFullPageComponent(componentClass) {
  var FullPageComponent = ReactCompositeComponent.createClass({
    displayName: 'ReactFullPageComponent' + (
      componentClass.type.displayName || ''
    ),

    componentWillUnmount: function() {
      ("production" !== process.env.NODE_ENV ? invariant(
        false,
        '%s tried to unmount. Because of cross-browser quirks it is ' +
        'impossible to unmount some top-level components (eg <html>, <head>, ' +
        'and <body>) reliably and efficiently. To fix this, have a single ' +
        'top-level component that never unmounts render these elements.',
        this.constructor.displayName
      ) : invariant(false));
    },

    render: function() {
      return this.transferPropsTo(componentClass(null, this.props.children));
    }
  });

  return FullPageComponent;
}

module.exports = createFullPageComponent;

}).call(this,require('_process'))
},{"./ReactCompositeComponent":37,"./invariant":124,"_process":3}],104:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule createNodesFromMarkup
 * @typechecks
 */

/*jslint evil: true, sub: true */

var ExecutionEnvironment = require("./ExecutionEnvironment");

var createArrayFrom = require("./createArrayFrom");
var getMarkupWrap = require("./getMarkupWrap");
var invariant = require("./invariant");

/**
 * Dummy container used to render all markup.
 */
var dummyNode =
  ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;

/**
 * Pattern used by `getNodeName`.
 */
var nodeNamePattern = /^\s*<(\w+)/;

/**
 * Extracts the `nodeName` of the first element in a string of markup.
 *
 * @param {string} markup String of markup.
 * @return {?string} Node name of the supplied markup.
 */
function getNodeName(markup) {
  var nodeNameMatch = markup.match(nodeNamePattern);
  return nodeNameMatch && nodeNameMatch[1].toLowerCase();
}

/**
 * Creates an array containing the nodes rendered from the supplied markup. The
 * optionally supplied `handleScript` function will be invoked once for each
 * <script> element that is rendered. If no `handleScript` function is supplied,
 * an exception is thrown if any <script> elements are rendered.
 *
 * @param {string} markup A string of valid HTML markup.
 * @param {?function} handleScript Invoked once for each rendered <script>.
 * @return {array<DOMElement|DOMTextNode>} An array of rendered nodes.
 */
function createNodesFromMarkup(markup, handleScript) {
  var node = dummyNode;
  ("production" !== process.env.NODE_ENV ? invariant(!!dummyNode, 'createNodesFromMarkup dummy not initialized') : invariant(!!dummyNode));
  var nodeName = getNodeName(markup);

  var wrap = nodeName && getMarkupWrap(nodeName);
  if (wrap) {
    node.innerHTML = wrap[1] + markup + wrap[2];

    var wrapDepth = wrap[0];
    while (wrapDepth--) {
      node = node.lastChild;
    }
  } else {
    node.innerHTML = markup;
  }

  var scripts = node.getElementsByTagName('script');
  if (scripts.length) {
    ("production" !== process.env.NODE_ENV ? invariant(
      handleScript,
      'createNodesFromMarkup(...): Unexpected <script> element rendered.'
    ) : invariant(handleScript));
    createArrayFrom(scripts).forEach(handleScript);
  }

  var nodes = createArrayFrom(node.childNodes);
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
  return nodes;
}

module.exports = createNodesFromMarkup;

}).call(this,require('_process'))
},{"./ExecutionEnvironment":25,"./createArrayFrom":102,"./getMarkupWrap":116,"./invariant":124,"_process":3}],105:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule dangerousStyleValue
 * @typechecks static-only
 */

"use strict";

var CSSProperty = require("./CSSProperty");

var isUnitlessNumber = CSSProperty.isUnitlessNumber;

/**
 * Convert a value into the proper css writable value. The style name `name`
 * should be logical (no hyphens), as specified
 * in `CSSProperty.isUnitlessNumber`.
 *
 * @param {string} name CSS property name such as `topMargin`.
 * @param {*} value CSS property value such as `10px`.
 * @return {string} Normalized style value with dimensions applied.
 */
function dangerousStyleValue(name, value) {
  // Note that we've removed escapeTextForBrowser() calls here since the
  // whole string will be escaped when the attribute is injected into
  // the markup. If you provide unsafe user data here they can inject
  // arbitrary CSS which may be problematic (I couldn't repro this):
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
  // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
  // This is not an XSS hole but instead a potential CSS injection issue
  // which has lead to a greater discussion about how we're going to
  // trust URLs moving forward. See #2115901

  var isEmpty = value == null || typeof value === 'boolean' || value === '';
  if (isEmpty) {
    return '';
  }

  var isNonNumeric = isNaN(value);
  if (isNonNumeric || value === 0 ||
      isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name]) {
    return '' + value; // cast to string
  }

  if (typeof value === 'string') {
    value = value.trim();
  }
  return value + 'px';
}

module.exports = dangerousStyleValue;

},{"./CSSProperty":7}],106:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule emptyFunction
 */

var copyProperties = require("./copyProperties");

function makeEmptyFunction(arg) {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
function emptyFunction() {}

copyProperties(emptyFunction, {
  thatReturns: makeEmptyFunction,
  thatReturnsFalse: makeEmptyFunction(false),
  thatReturnsTrue: makeEmptyFunction(true),
  thatReturnsNull: makeEmptyFunction(null),
  thatReturnsThis: function() { return this; },
  thatReturnsArgument: function(arg) { return arg; }
});

module.exports = emptyFunction;

},{"./copyProperties":101}],107:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule emptyObject
 */

"use strict";

var emptyObject = {};

if ("production" !== process.env.NODE_ENV) {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;

}).call(this,require('_process'))
},{"_process":3}],108:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule escapeTextForBrowser
 * @typechecks static-only
 */

"use strict";

var ESCAPE_LOOKUP = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  "\"": "&quot;",
  "'": "&#x27;"
};

var ESCAPE_REGEX = /[&><"']/g;

function escaper(match) {
  return ESCAPE_LOOKUP[match];
}

/**
 * Escapes text to prevent scripting attacks.
 *
 * @param {*} text Text value to escape.
 * @return {string} An escaped string.
 */
function escapeTextForBrowser(text) {
  return ('' + text).replace(ESCAPE_REGEX, escaper);
}

module.exports = escapeTextForBrowser;

},{}],109:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule flattenChildren
 */

"use strict";

var traverseAllChildren = require("./traverseAllChildren");
var warning = require("./warning");

/**
 * @param {function} traverseContext Context passed through traversal.
 * @param {?ReactComponent} child React child component.
 * @param {!string} name String name of key path to child.
 */
function flattenSingleChildIntoContext(traverseContext, child, name) {
  // We found a component instance.
  var result = traverseContext;
  var keyUnique = !result.hasOwnProperty(name);
  ("production" !== process.env.NODE_ENV ? warning(
    keyUnique,
    'flattenChildren(...): Encountered two children with the same key, ' +
    '`%s`. Child keys must be unique; when two children share a key, only ' +
    'the first child will be used.',
    name
  ) : null);
  if (keyUnique && child != null) {
    result[name] = child;
  }
}

/**
 * Flattens children that are typically specified as `props.children`. Any null
 * children will not be included in the resulting object.
 * @return {!object} flattened children keyed by name.
 */
function flattenChildren(children) {
  if (children == null) {
    return children;
  }
  var result = {};
  traverseAllChildren(children, flattenSingleChildIntoContext, result);
  return result;
}

module.exports = flattenChildren;

}).call(this,require('_process'))
},{"./traverseAllChildren":146,"./warning":147,"_process":3}],110:[function(require,module,exports){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule focusNode
 */

"use strict";

/**
 * IE8 throws if an input/textarea is disabled and we try to focus it.
 * Focus only when necessary.
 *
 * @param {DOMElement} node input/textarea to focus
 */
function focusNode(node) {
  if (!node.disabled) {
    node.focus();
  }
}

module.exports = focusNode;

},{}],111:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule forEachAccumulated
 */

"use strict";

/**
 * @param {array} an "accumulation" of items which is either an Array or
 * a single item. Useful when paired with the `accumulate` module. This is a
 * simple utility that allows us to reason about a collection of items, but
 * handling the case when there is exactly one item (and we do not need to
 * allocate an array).
 */
var forEachAccumulated = function(arr, cb, scope) {
  if (Array.isArray(arr)) {
    arr.forEach(cb, scope);
  } else if (arr) {
    cb.call(scope, arr);
  }
};

module.exports = forEachAccumulated;

},{}],112:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getActiveElement
 * @typechecks
 */

/**
 * Same as document.activeElement but wraps in a try-catch block. In IE it is
 * not safe to call document.activeElement if there is nothing focused.
 *
 * The activeElement will be null only if the document body is not yet defined.
 */
function getActiveElement() /*?DOMElement*/ {
  try {
    return document.activeElement || document.body;
  } catch (e) {
    return document.body;
  }
}

module.exports = getActiveElement;

},{}],113:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getEventKey
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

/**
 * Normalization of deprecated HTML5 `key` values
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var normalizeKey = {
  'Esc': 'Escape',
  'Spacebar': ' ',
  'Left': 'ArrowLeft',
  'Up': 'ArrowUp',
  'Right': 'ArrowRight',
  'Down': 'ArrowDown',
  'Del': 'Delete',
  'Win': 'OS',
  'Menu': 'ContextMenu',
  'Apps': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'MozPrintableKey': 'Unidentified'
};

/**
 * Translation from legacy `which`/`keyCode` to HTML5 `key`
 * Only special keys supported, all others depend on keyboard layout or browser
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var translateToKey = {
  8: 'Backspace',
  9: 'Tab',
  12: 'Clear',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  19: 'Pause',
  20: 'CapsLock',
  27: 'Escape',
  32: ' ',
  33: 'PageUp',
  34: 'PageDown',
  35: 'End',
  36: 'Home',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  45: 'Insert',
  46: 'Delete',
  112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4', 116: 'F5', 117: 'F6',
  118: 'F7', 119: 'F8', 120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12',
  144: 'NumLock',
  145: 'ScrollLock',
  224: 'Meta'
};

/**
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `key` property.
 */
function getEventKey(nativeEvent) {
  if (nativeEvent.key) {
    // Normalize inconsistent values reported by browsers due to
    // implementations of a working draft specification.

    // FireFox implements `key` but returns `MozPrintableKey` for all
    // printable characters (normalized to `Unidentified`), ignore it.
    var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
    if (key !== 'Unidentified') {
      return key;
    }
  }

  // Browser does not implement `key`, polyfill as much of it as we can.
  if (nativeEvent.type === 'keypress') {
    // Create the character from the `charCode` ourselves and use as an almost
    // perfect replacement.
    var charCode = 'charCode' in nativeEvent ?
      nativeEvent.charCode :
      nativeEvent.keyCode;

    // The enter-key is technically both printable and non-printable and can
    // thus be captured by `keypress`, no other non-printable key should.
    return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
  }
  if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
    // While user keyboard layout determines the actual meaning of each
    // `keyCode` value, almost all function keys have a universal value.
    return translateToKey[nativeEvent.keyCode] || 'Unidentified';
  }

  ("production" !== process.env.NODE_ENV ? invariant(false, "Unexpected keyboard event type: %s", nativeEvent.type) : invariant(false));
}

module.exports = getEventKey;

}).call(this,require('_process'))
},{"./invariant":124,"_process":3}],114:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getEventModifierState
 * @typechecks static-only
 */

"use strict";

/**
 * Translation from modifier key to the associated property in the event.
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#keys-Modifiers
 */

var modifierKeyToProp = {
  'Alt': 'altKey',
  'Control': 'ctrlKey',
  'Meta': 'metaKey',
  'Shift': 'shiftKey'
};

// IE8 does not implement getModifierState so we simply map it to the only
// modifier keys exposed by the event itself, does not support Lock-keys.
// Currently, all major browsers except Chrome seems to support Lock-keys.
function modifierStateGetter(keyArg) {
  /*jshint validthis:true */
  var syntheticEvent = this;
  var nativeEvent = syntheticEvent.nativeEvent;
  if (nativeEvent.getModifierState) {
    return nativeEvent.getModifierState(keyArg);
  }
  var keyProp = modifierKeyToProp[keyArg];
  return keyProp ? !!nativeEvent[keyProp] : false;
}

function getEventModifierState(nativeEvent) {
  return modifierStateGetter;
}

module.exports = getEventModifierState;

},{}],115:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getEventTarget
 * @typechecks static-only
 */

"use strict";

/**
 * Gets the target node from a native browser event by accounting for
 * inconsistencies in browser DOM APIs.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {DOMEventTarget} Target node.
 */
function getEventTarget(nativeEvent) {
  var target = nativeEvent.target || nativeEvent.srcElement || window;
  // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
  // @see http://www.quirksmode.org/js/events_properties.html
  return target.nodeType === 3 ? target.parentNode : target;
}

module.exports = getEventTarget;

},{}],116:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getMarkupWrap
 */

var ExecutionEnvironment = require("./ExecutionEnvironment");

var invariant = require("./invariant");

/**
 * Dummy container used to detect which wraps are necessary.
 */
var dummyNode =
  ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;

/**
 * Some browsers cannot use `innerHTML` to render certain elements standalone,
 * so we wrap them, render the wrapped nodes, then extract the desired node.
 *
 * In IE8, certain elements cannot render alone, so wrap all elements ('*').
 */
var shouldWrap = {
  // Force wrapping for SVG elements because if they get created inside a <div>,
  // they will be initialized in the wrong namespace (and will not display).
  'circle': true,
  'defs': true,
  'ellipse': true,
  'g': true,
  'line': true,
  'linearGradient': true,
  'path': true,
  'polygon': true,
  'polyline': true,
  'radialGradient': true,
  'rect': true,
  'stop': true,
  'text': true
};

var selectWrap = [1, '<select multiple="true">', '</select>'];
var tableWrap = [1, '<table>', '</table>'];
var trWrap = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

var svgWrap = [1, '<svg>', '</svg>'];

var markupWrap = {
  '*': [1, '?<div>', '</div>'],

  'area': [1, '<map>', '</map>'],
  'col': [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  'legend': [1, '<fieldset>', '</fieldset>'],
  'param': [1, '<object>', '</object>'],
  'tr': [2, '<table><tbody>', '</tbody></table>'],

  'optgroup': selectWrap,
  'option': selectWrap,

  'caption': tableWrap,
  'colgroup': tableWrap,
  'tbody': tableWrap,
  'tfoot': tableWrap,
  'thead': tableWrap,

  'td': trWrap,
  'th': trWrap,

  'circle': svgWrap,
  'defs': svgWrap,
  'ellipse': svgWrap,
  'g': svgWrap,
  'line': svgWrap,
  'linearGradient': svgWrap,
  'path': svgWrap,
  'polygon': svgWrap,
  'polyline': svgWrap,
  'radialGradient': svgWrap,
  'rect': svgWrap,
  'stop': svgWrap,
  'text': svgWrap
};

/**
 * Gets the markup wrap configuration for the supplied `nodeName`.
 *
 * NOTE: This lazily detects which wraps are necessary for the current browser.
 *
 * @param {string} nodeName Lowercase `nodeName`.
 * @return {?array} Markup wrap configuration, if applicable.
 */
function getMarkupWrap(nodeName) {
  ("production" !== process.env.NODE_ENV ? invariant(!!dummyNode, 'Markup wrapping node not initialized') : invariant(!!dummyNode));
  if (!markupWrap.hasOwnProperty(nodeName)) {
    nodeName = '*';
  }
  if (!shouldWrap.hasOwnProperty(nodeName)) {
    if (nodeName === '*') {
      dummyNode.innerHTML = '<link />';
    } else {
      dummyNode.innerHTML = '<' + nodeName + '></' + nodeName + '>';
    }
    shouldWrap[nodeName] = !dummyNode.firstChild;
  }
  return shouldWrap[nodeName] ? markupWrap[nodeName] : null;
}


module.exports = getMarkupWrap;

}).call(this,require('_process'))
},{"./ExecutionEnvironment":25,"./invariant":124,"_process":3}],117:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getNodeForCharacterOffset
 */

"use strict";

/**
 * Given any node return the first leaf node without children.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {DOMElement|DOMTextNode}
 */
function getLeafNode(node) {
  while (node && node.firstChild) {
    node = node.firstChild;
  }
  return node;
}

/**
 * Get the next sibling within a container. This will walk up the
 * DOM if a node's siblings have been exhausted.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {?DOMElement|DOMTextNode}
 */
function getSiblingNode(node) {
  while (node) {
    if (node.nextSibling) {
      return node.nextSibling;
    }
    node = node.parentNode;
  }
}

/**
 * Get object describing the nodes which contain characters at offset.
 *
 * @param {DOMElement|DOMTextNode} root
 * @param {number} offset
 * @return {?object}
 */
function getNodeForCharacterOffset(root, offset) {
  var node = getLeafNode(root);
  var nodeStart = 0;
  var nodeEnd = 0;

  while (node) {
    if (node.nodeType == 3) {
      nodeEnd = nodeStart + node.textContent.length;

      if (nodeStart <= offset && nodeEnd >= offset) {
        return {
          node: node,
          offset: offset - nodeStart
        };
      }

      nodeStart = nodeEnd;
    }

    node = getLeafNode(getSiblingNode(node));
  }
}

module.exports = getNodeForCharacterOffset;

},{}],118:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getReactRootElementInContainer
 */

"use strict";

var DOC_NODE_TYPE = 9;

/**
 * @param {DOMElement|DOMDocument} container DOM element that may contain
 *                                           a React component
 * @return {?*} DOM element that may have the reactRoot ID, or null.
 */
function getReactRootElementInContainer(container) {
  if (!container) {
    return null;
  }

  if (container.nodeType === DOC_NODE_TYPE) {
    return container.documentElement;
  } else {
    return container.firstChild;
  }
}

module.exports = getReactRootElementInContainer;

},{}],119:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getTextContentAccessor
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var contentKey = null;

/**
 * Gets the key used to access text content on a DOM node.
 *
 * @return {?string} Key used to access text content.
 * @internal
 */
function getTextContentAccessor() {
  if (!contentKey && ExecutionEnvironment.canUseDOM) {
    // Prefer textContent to innerText because many browsers support both but
    // SVG <text> elements don't support innerText even when <div> does.
    contentKey = 'textContent' in document.documentElement ?
      'textContent' :
      'innerText';
  }
  return contentKey;
}

module.exports = getTextContentAccessor;

},{"./ExecutionEnvironment":25}],120:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getUnboundedScrollPosition
 * @typechecks
 */

"use strict";

/**
 * Gets the scroll position of the supplied element or window.
 *
 * The return values are unbounded, unlike `getScrollPosition`. This means they
 * may be negative or exceed the element boundaries (which is possible using
 * inertial scrolling).
 *
 * @param {DOMWindow|DOMElement} scrollable
 * @return {object} Map with `x` and `y` keys.
 */
function getUnboundedScrollPosition(scrollable) {
  if (scrollable === window) {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    };
  }
  return {
    x: scrollable.scrollLeft,
    y: scrollable.scrollTop
  };
}

module.exports = getUnboundedScrollPosition;

},{}],121:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule hyphenate
 * @typechecks
 */

var _uppercasePattern = /([A-Z])/g;

/**
 * Hyphenates a camelcased string, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *
 * For CSS style names, use `hyphenateStyleName` instead which works properly
 * with all vendor prefixes, including `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenate(string) {
  return string.replace(_uppercasePattern, '-$1').toLowerCase();
}

module.exports = hyphenate;

},{}],122:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule hyphenateStyleName
 * @typechecks
 */

"use strict";

var hyphenate = require("./hyphenate");

var msPattern = /^ms-/;

/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *   > hyphenate('MozTransition')
 *   < "-moz-transition"
 *   > hyphenate('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenateStyleName(string) {
  return hyphenate(string).replace(msPattern, '-ms-');
}

module.exports = hyphenateStyleName;

},{"./hyphenate":121}],123:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule instantiateReactComponent
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

/**
 * Validate a `componentDescriptor`. This should be exposed publicly in a follow
 * up diff.
 *
 * @param {object} descriptor
 * @return {boolean} Returns true if this is a valid descriptor of a Component.
 */
function isValidComponentDescriptor(descriptor) {
  return (
    descriptor &&
    typeof descriptor.type === 'function' &&
    typeof descriptor.type.prototype.mountComponent === 'function' &&
    typeof descriptor.type.prototype.receiveComponent === 'function'
  );
}

/**
 * Given a `componentDescriptor` create an instance that will actually be
 * mounted. Currently it just extracts an existing clone from composite
 * components but this is an implementation detail which will change.
 *
 * @param {object} descriptor
 * @return {object} A new instance of componentDescriptor's constructor.
 * @protected
 */
function instantiateReactComponent(descriptor) {

  // TODO: Make warning
  // if (__DEV__) {
    ("production" !== process.env.NODE_ENV ? invariant(
      isValidComponentDescriptor(descriptor),
      'Only React Components are valid for mounting.'
    ) : invariant(isValidComponentDescriptor(descriptor)));
  // }

  return new descriptor.type(descriptor);
}

module.exports = instantiateReactComponent;

}).call(this,require('_process'))
},{"./invariant":124,"_process":3}],124:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== process.env.NODE_ENV) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))
},{"_process":3}],125:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isEventSupported
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var useHasFeature;
if (ExecutionEnvironment.canUseDOM) {
  useHasFeature =
    document.implementation &&
    document.implementation.hasFeature &&
    // always returns true in newer browsers as per the standard.
    // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
    document.implementation.hasFeature('', '') !== true;
}

/**
 * Checks if an event is supported in the current execution environment.
 *
 * NOTE: This will not work correctly for non-generic events such as `change`,
 * `reset`, `load`, `error`, and `select`.
 *
 * Borrows from Modernizr.
 *
 * @param {string} eventNameSuffix Event name, e.g. "click".
 * @param {?boolean} capture Check if the capture phase is supported.
 * @return {boolean} True if the event is supported.
 * @internal
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */
function isEventSupported(eventNameSuffix, capture) {
  if (!ExecutionEnvironment.canUseDOM ||
      capture && !('addEventListener' in document)) {
    return false;
  }

  var eventName = 'on' + eventNameSuffix;
  var isSupported = eventName in document;

  if (!isSupported) {
    var element = document.createElement('div');
    element.setAttribute(eventName, 'return;');
    isSupported = typeof element[eventName] === 'function';
  }

  if (!isSupported && useHasFeature && eventNameSuffix === 'wheel') {
    // This is the only way to test support for the `wheel` event in IE9+.
    isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
  }

  return isSupported;
}

module.exports = isEventSupported;

},{"./ExecutionEnvironment":25}],126:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isNode
 * @typechecks
 */

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM node.
 */
function isNode(object) {
  return !!(object && (
    typeof Node === 'function' ? object instanceof Node :
      typeof object === 'object' &&
      typeof object.nodeType === 'number' &&
      typeof object.nodeName === 'string'
  ));
}

module.exports = isNode;

},{}],127:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isTextInputElement
 */

"use strict";

/**
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
 */
var supportedInputTypes = {
  'color': true,
  'date': true,
  'datetime': true,
  'datetime-local': true,
  'email': true,
  'month': true,
  'number': true,
  'password': true,
  'range': true,
  'search': true,
  'tel': true,
  'text': true,
  'time': true,
  'url': true,
  'week': true
};

function isTextInputElement(elem) {
  return elem && (
    (elem.nodeName === 'INPUT' && supportedInputTypes[elem.type]) ||
    elem.nodeName === 'TEXTAREA'
  );
}

module.exports = isTextInputElement;

},{}],128:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isTextNode
 * @typechecks
 */

var isNode = require("./isNode");

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM text node.
 */
function isTextNode(object) {
  return isNode(object) && object.nodeType == 3;
}

module.exports = isTextNode;

},{"./isNode":126}],129:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule joinClasses
 * @typechecks static-only
 */

"use strict";

/**
 * Combines multiple className strings into one.
 * http://jsperf.com/joinclasses-args-vs-array
 *
 * @param {...?string} classes
 * @return {string}
 */
function joinClasses(className/*, ... */) {
  if (!className) {
    className = '';
  }
  var nextClass;
  var argLength = arguments.length;
  if (argLength > 1) {
    for (var ii = 1; ii < argLength; ii++) {
      nextClass = arguments[ii];
      nextClass && (className += ' ' + nextClass);
    }
  }
  return className;
}

module.exports = joinClasses;

},{}],130:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule keyMirror
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

/**
 * Constructs an enumeration with keys equal to their value.
 *
 * For example:
 *
 *   var COLORS = keyMirror({blue: null, red: null});
 *   var myColor = COLORS.blue;
 *   var isColorValid = !!COLORS[myColor];
 *
 * The last line could not be performed if the values of the generated enum were
 * not equal to their keys.
 *
 *   Input:  {key1: val1, key2: val2}
 *   Output: {key1: key1, key2: key2}
 *
 * @param {object} obj
 * @return {object}
 */
var keyMirror = function(obj) {
  var ret = {};
  var key;
  ("production" !== process.env.NODE_ENV ? invariant(
    obj instanceof Object && !Array.isArray(obj),
    'keyMirror(...): Argument must be an object.'
  ) : invariant(obj instanceof Object && !Array.isArray(obj)));
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = key;
  }
  return ret;
};

module.exports = keyMirror;

}).call(this,require('_process'))
},{"./invariant":124,"_process":3}],131:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule keyOf
 */

/**
 * Allows extraction of a minified key. Let's the build system minify keys
 * without loosing the ability to dynamically use key strings as values
 * themselves. Pass in an object with a single key/val pair and it will return
 * you the string key of that single record. Suppose you want to grab the
 * value for a key 'className' inside of an object. Key/val minification may
 * have aliased that key to be 'xa12'. keyOf({className: null}) will return
 * 'xa12' in that case. Resolve keys you want to use once at startup time, then
 * reuse those resolutions.
 */
var keyOf = function(oneKeyObj) {
  var key;
  for (key in oneKeyObj) {
    if (!oneKeyObj.hasOwnProperty(key)) {
      continue;
    }
    return key;
  }
  return null;
};


module.exports = keyOf;

},{}],132:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mapObject
 */

"use strict";

/**
 * For each key/value pair, invokes callback func and constructs a resulting
 * object which contains, for every key in obj, values that are the result of
 * of invoking the function:
 *
 *   func(value, key, iteration)
 *
 * Grepable names:
 *
 *   function objectMap()
 *   function objMap()
 *
 * @param {?object} obj Object to map keys over
 * @param {function} func Invoked for each key/val pair.
 * @param {?*} context
 * @return {?object} Result of mapping or null if obj is falsey
 */
function mapObject(obj, func, context) {
  if (!obj) {
    return null;
  }
  var i = 0;
  var ret = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret[key] = func.call(context, obj[key], key, i++);
    }
  }
  return ret;
}

module.exports = mapObject;

},{}],133:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule memoizeStringOnly
 * @typechecks static-only
 */

"use strict";

/**
 * Memoizes the return value of a function that accepts one string argument.
 *
 * @param {function} callback
 * @return {function}
 */
function memoizeStringOnly(callback) {
  var cache = {};
  return function(string) {
    if (cache.hasOwnProperty(string)) {
      return cache[string];
    } else {
      return cache[string] = callback.call(this, string);
    }
  };
}

module.exports = memoizeStringOnly;

},{}],134:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule merge
 */

"use strict";

var mergeInto = require("./mergeInto");

/**
 * Shallow merges two structures into a return value, without mutating either.
 *
 * @param {?object} one Optional object with properties to merge from.
 * @param {?object} two Optional object with properties to merge from.
 * @return {object} The shallow extension of one by two.
 */
var merge = function(one, two) {
  var result = {};
  mergeInto(result, one);
  mergeInto(result, two);
  return result;
};

module.exports = merge;

},{"./mergeInto":136}],135:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mergeHelpers
 *
 * requiresPolyfills: Array.isArray
 */

"use strict";

var invariant = require("./invariant");
var keyMirror = require("./keyMirror");

/**
 * Maximum number of levels to traverse. Will catch circular structures.
 * @const
 */
var MAX_MERGE_DEPTH = 36;

/**
 * We won't worry about edge cases like new String('x') or new Boolean(true).
 * Functions are considered terminals, and arrays are not.
 * @param {*} o The item/object/value to test.
 * @return {boolean} true iff the argument is a terminal.
 */
var isTerminal = function(o) {
  return typeof o !== 'object' || o === null;
};

var mergeHelpers = {

  MAX_MERGE_DEPTH: MAX_MERGE_DEPTH,

  isTerminal: isTerminal,

  /**
   * Converts null/undefined values into empty object.
   *
   * @param {?Object=} arg Argument to be normalized (nullable optional)
   * @return {!Object}
   */
  normalizeMergeArg: function(arg) {
    return arg === undefined || arg === null ? {} : arg;
  },

  /**
   * If merging Arrays, a merge strategy *must* be supplied. If not, it is
   * likely the caller's fault. If this function is ever called with anything
   * but `one` and `two` being `Array`s, it is the fault of the merge utilities.
   *
   * @param {*} one Array to merge into.
   * @param {*} two Array to merge from.
   */
  checkMergeArrayArgs: function(one, two) {
    ("production" !== process.env.NODE_ENV ? invariant(
      Array.isArray(one) && Array.isArray(two),
      'Tried to merge arrays, instead got %s and %s.',
      one,
      two
    ) : invariant(Array.isArray(one) && Array.isArray(two)));
  },

  /**
   * @param {*} one Object to merge into.
   * @param {*} two Object to merge from.
   */
  checkMergeObjectArgs: function(one, two) {
    mergeHelpers.checkMergeObjectArg(one);
    mergeHelpers.checkMergeObjectArg(two);
  },

  /**
   * @param {*} arg
   */
  checkMergeObjectArg: function(arg) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !isTerminal(arg) && !Array.isArray(arg),
      'Tried to merge an object, instead got %s.',
      arg
    ) : invariant(!isTerminal(arg) && !Array.isArray(arg)));
  },

  /**
   * @param {*} arg
   */
  checkMergeIntoObjectArg: function(arg) {
    ("production" !== process.env.NODE_ENV ? invariant(
      (!isTerminal(arg) || typeof arg === 'function') && !Array.isArray(arg),
      'Tried to merge into an object, instead got %s.',
      arg
    ) : invariant((!isTerminal(arg) || typeof arg === 'function') && !Array.isArray(arg)));
  },

  /**
   * Checks that a merge was not given a circular object or an object that had
   * too great of depth.
   *
   * @param {number} Level of recursion to validate against maximum.
   */
  checkMergeLevel: function(level) {
    ("production" !== process.env.NODE_ENV ? invariant(
      level < MAX_MERGE_DEPTH,
      'Maximum deep merge depth exceeded. You may be attempting to merge ' +
      'circular structures in an unsupported way.'
    ) : invariant(level < MAX_MERGE_DEPTH));
  },

  /**
   * Checks that the supplied merge strategy is valid.
   *
   * @param {string} Array merge strategy.
   */
  checkArrayStrategy: function(strategy) {
    ("production" !== process.env.NODE_ENV ? invariant(
      strategy === undefined || strategy in mergeHelpers.ArrayStrategies,
      'You must provide an array strategy to deep merge functions to ' +
      'instruct the deep merge how to resolve merging two arrays.'
    ) : invariant(strategy === undefined || strategy in mergeHelpers.ArrayStrategies));
  },

  /**
   * Set of possible behaviors of merge algorithms when encountering two Arrays
   * that must be merged together.
   * - `clobber`: The left `Array` is ignored.
   * - `indexByIndex`: The result is achieved by recursively deep merging at
   *   each index. (not yet supported.)
   */
  ArrayStrategies: keyMirror({
    Clobber: true,
    IndexByIndex: true
  })

};

module.exports = mergeHelpers;

}).call(this,require('_process'))
},{"./invariant":124,"./keyMirror":130,"_process":3}],136:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mergeInto
 * @typechecks static-only
 */

"use strict";

var mergeHelpers = require("./mergeHelpers");

var checkMergeObjectArg = mergeHelpers.checkMergeObjectArg;
var checkMergeIntoObjectArg = mergeHelpers.checkMergeIntoObjectArg;

/**
 * Shallow merges two structures by mutating the first parameter.
 *
 * @param {object|function} one Object to be merged into.
 * @param {?object} two Optional object with properties to merge from.
 */
function mergeInto(one, two) {
  checkMergeIntoObjectArg(one);
  if (two != null) {
    checkMergeObjectArg(two);
    for (var key in two) {
      if (!two.hasOwnProperty(key)) {
        continue;
      }
      one[key] = two[key];
    }
  }
}

module.exports = mergeInto;

},{"./mergeHelpers":135}],137:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mixInto
 */

"use strict";

/**
 * Simply copies properties to the prototype.
 */
var mixInto = function(constructor, methodBag) {
  var methodName;
  for (methodName in methodBag) {
    if (!methodBag.hasOwnProperty(methodName)) {
      continue;
    }
    constructor.prototype[methodName] = methodBag[methodName];
  }
};

module.exports = mixInto;

},{}],138:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule monitorCodeUse
 */

"use strict";

var invariant = require("./invariant");

/**
 * Provides open-source compatible instrumentation for monitoring certain API
 * uses before we're ready to issue a warning or refactor. It accepts an event
 * name which may only contain the characters [a-z0-9_] and an optional data
 * object with further information.
 */

function monitorCodeUse(eventName, data) {
  ("production" !== process.env.NODE_ENV ? invariant(
    eventName && !/[^a-z0-9_]/.test(eventName),
    'You must provide an eventName using only the characters [a-z0-9_]'
  ) : invariant(eventName && !/[^a-z0-9_]/.test(eventName)));
}

module.exports = monitorCodeUse;

}).call(this,require('_process'))
},{"./invariant":124,"_process":3}],139:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule onlyChild
 */
"use strict";

var ReactDescriptor = require("./ReactDescriptor");

var invariant = require("./invariant");

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection. The current implementation of this
 * function assumes that a single child gets passed without a wrapper, but the
 * purpose of this helper function is to abstract away the particular structure
 * of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactComponent} The first and only `ReactComponent` contained in the
 * structure.
 */
function onlyChild(children) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactDescriptor.isValidDescriptor(children),
    'onlyChild must be passed a children with exactly one child.'
  ) : invariant(ReactDescriptor.isValidDescriptor(children)));
  return children;
}

module.exports = onlyChild;

}).call(this,require('_process'))
},{"./ReactDescriptor":55,"./invariant":124,"_process":3}],140:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule performance
 * @typechecks
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var performance;

if (ExecutionEnvironment.canUseDOM) {
  performance =
    window.performance ||
    window.msPerformance ||
    window.webkitPerformance;
}

module.exports = performance || {};

},{"./ExecutionEnvironment":25}],141:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule performanceNow
 * @typechecks
 */

var performance = require("./performance");

/**
 * Detect if we can use `window.performance.now()` and gracefully fallback to
 * `Date.now()` if it doesn't exist. We need to support Firefox < 15 for now
 * because of Facebook's testing infrastructure.
 */
if (!performance || !performance.now) {
  performance = Date;
}

var performanceNow = performance.now.bind(performance);

module.exports = performanceNow;

},{"./performance":140}],142:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule setInnerHTML
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

/**
 * Set the innerHTML property of a node, ensuring that whitespace is preserved
 * even in IE8.
 *
 * @param {DOMElement} node
 * @param {string} html
 * @internal
 */
var setInnerHTML = function(node, html) {
  node.innerHTML = html;
};

if (ExecutionEnvironment.canUseDOM) {
  // IE8: When updating a just created node with innerHTML only leading
  // whitespace is removed. When updating an existing node with innerHTML
  // whitespace in root TextNodes is also collapsed.
  // @see quirksmode.org/bugreports/archives/2004/11/innerhtml_and_t.html

  // Feature detection; only IE8 is known to behave improperly like this.
  var testElement = document.createElement('div');
  testElement.innerHTML = ' ';
  if (testElement.innerHTML === '') {
    setInnerHTML = function(node, html) {
      // Magic theory: IE8 supposedly differentiates between added and updated
      // nodes when processing innerHTML, innerHTML on updated nodes suffers
      // from worse whitespace behavior. Re-adding a node like this triggers
      // the initial and more favorable whitespace behavior.
      // TODO: What to do on a detached node?
      if (node.parentNode) {
        node.parentNode.replaceChild(node, node);
      }

      // We also implement a workaround for non-visible tags disappearing into
      // thin air on IE8, this only happens if there is no visible text
      // in-front of the non-visible tags. Piggyback on the whitespace fix
      // and simply check if any non-visible tags appear in the source.
      if (html.match(/^[ \r\n\t\f]/) ||
          html[0] === '<' && (
            html.indexOf('<noscript') !== -1 ||
            html.indexOf('<script') !== -1 ||
            html.indexOf('<style') !== -1 ||
            html.indexOf('<meta') !== -1 ||
            html.indexOf('<link') !== -1)) {
        // Recover leading whitespace by temporarily prepending any character.
        // \uFEFF has the potential advantage of being zero-width/invisible.
        node.innerHTML = '\uFEFF' + html;

        // deleteData leaves an empty `TextNode` which offsets the index of all
        // children. Definitely want to avoid this.
        var textNode = node.firstChild;
        if (textNode.data.length === 1) {
          node.removeChild(textNode);
        } else {
          textNode.deleteData(0, 1);
        }
      } else {
        node.innerHTML = html;
      }
    };
  }
}

module.exports = setInnerHTML;

},{"./ExecutionEnvironment":25}],143:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule shallowEqual
 */

"use strict";

/**
 * Performs equality by iterating through keys on an object and returning
 * false when any key has values which are not strictly equal between
 * objA and objB. Returns true when the values of all keys are strictly equal.
 *
 * @return {boolean}
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  var key;
  // Test for A's keys different from B.
  for (key in objA) {
    if (objA.hasOwnProperty(key) &&
        (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
      return false;
    }
  }
  // Test for B'a keys missing from A.
  for (key in objB) {
    if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

module.exports = shallowEqual;

},{}],144:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule shouldUpdateReactComponent
 * @typechecks static-only
 */

"use strict";

/**
 * Given a `prevDescriptor` and `nextDescriptor`, determines if the existing
 * instance should be updated as opposed to being destroyed or replaced by a new
 * instance. Both arguments are descriptors. This ensures that this logic can
 * operate on stateless trees without any backing instance.
 *
 * @param {?object} prevDescriptor
 * @param {?object} nextDescriptor
 * @return {boolean} True if the existing instance should be updated.
 * @protected
 */
function shouldUpdateReactComponent(prevDescriptor, nextDescriptor) {
  if (prevDescriptor && nextDescriptor &&
      prevDescriptor.type === nextDescriptor.type && (
        (prevDescriptor.props && prevDescriptor.props.key) ===
        (nextDescriptor.props && nextDescriptor.props.key)
      ) && prevDescriptor._owner === nextDescriptor._owner) {
    return true;
  }
  return false;
}

module.exports = shouldUpdateReactComponent;

},{}],145:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule toArray
 * @typechecks
 */

var invariant = require("./invariant");

/**
 * Convert array-like objects to arrays.
 *
 * This API assumes the caller knows the contents of the data type. For less
 * well defined inputs use createArrayFrom.
 *
 * @param {object|function|filelist} obj
 * @return {array}
 */
function toArray(obj) {
  var length = obj.length;

  // Some browse builtin objects can report typeof 'function' (e.g. NodeList in
  // old versions of Safari).
  ("production" !== process.env.NODE_ENV ? invariant(
    !Array.isArray(obj) &&
    (typeof obj === 'object' || typeof obj === 'function'),
    'toArray: Array-like object expected'
  ) : invariant(!Array.isArray(obj) &&
  (typeof obj === 'object' || typeof obj === 'function')));

  ("production" !== process.env.NODE_ENV ? invariant(
    typeof length === 'number',
    'toArray: Object needs a length property'
  ) : invariant(typeof length === 'number'));

  ("production" !== process.env.NODE_ENV ? invariant(
    length === 0 ||
    (length - 1) in obj,
    'toArray: Object should have keys for indices'
  ) : invariant(length === 0 ||
  (length - 1) in obj));

  // Old IE doesn't give collections access to hasOwnProperty. Assume inputs
  // without method will throw during the slice call and skip straight to the
  // fallback.
  if (obj.hasOwnProperty) {
    try {
      return Array.prototype.slice.call(obj);
    } catch (e) {
      // IE < 9 does not support Array#slice on collections objects
    }
  }

  // Fall back to copying key by key. This assumes all keys have a value,
  // so will not preserve sparsely populated inputs.
  var ret = Array(length);
  for (var ii = 0; ii < length; ii++) {
    ret[ii] = obj[ii];
  }
  return ret;
}

module.exports = toArray;

}).call(this,require('_process'))
},{"./invariant":124,"_process":3}],146:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule traverseAllChildren
 */

"use strict";

var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactTextComponent = require("./ReactTextComponent");

var invariant = require("./invariant");

var SEPARATOR = ReactInstanceHandles.SEPARATOR;
var SUBSEPARATOR = ':';

/**
 * TODO: Test that:
 * 1. `mapChildren` transforms strings and numbers into `ReactTextComponent`.
 * 2. it('should fail when supplied duplicate key', function() {
 * 3. That a single child and an array with one item have the same key pattern.
 * });
 */

var userProvidedKeyEscaperLookup = {
  '=': '=0',
  '.': '=1',
  ':': '=2'
};

var userProvidedKeyEscapeRegex = /[=.:]/g;

function userProvidedKeyEscaper(match) {
  return userProvidedKeyEscaperLookup[match];
}

/**
 * Generate a key string that identifies a component within a set.
 *
 * @param {*} component A component that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
function getComponentKey(component, index) {
  if (component && component.props && component.props.key != null) {
    // Explicit key
    return wrapUserProvidedKey(component.props.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}

/**
 * Escape a component key so that it is safe to use in a reactid.
 *
 * @param {*} key Component key to be escaped.
 * @return {string} An escaped string.
 */
function escapeUserProvidedKey(text) {
  return ('' + text).replace(
    userProvidedKeyEscapeRegex,
    userProvidedKeyEscaper
  );
}

/**
 * Wrap a `key` value explicitly provided by the user to distinguish it from
 * implicitly-generated keys generated by a component's index in its parent.
 *
 * @param {string} key Value of a user-provided `key` attribute
 * @return {string}
 */
function wrapUserProvidedKey(key) {
  return '$' + escapeUserProvidedKey(key);
}

/**
 * @param {?*} children Children tree container.
 * @param {!string} nameSoFar Name of the key path so far.
 * @param {!number} indexSoFar Number of children encountered until this point.
 * @param {!function} callback Callback to invoke with each child found.
 * @param {?*} traverseContext Used to pass information throughout the traversal
 * process.
 * @return {!number} The number of children in this subtree.
 */
var traverseAllChildrenImpl =
  function(children, nameSoFar, indexSoFar, callback, traverseContext) {
    var subtreeCount = 0;  // Count of children found in the current subtree.
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var nextName = (
          nameSoFar +
          (nameSoFar ? SUBSEPARATOR : SEPARATOR) +
          getComponentKey(child, i)
        );
        var nextIndex = indexSoFar + subtreeCount;
        subtreeCount += traverseAllChildrenImpl(
          child,
          nextName,
          nextIndex,
          callback,
          traverseContext
        );
      }
    } else {
      var type = typeof children;
      var isOnlyChild = nameSoFar === '';
      // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows
      var storageName =
        isOnlyChild ? SEPARATOR + getComponentKey(children, 0) : nameSoFar;
      if (children == null || type === 'boolean') {
        // All of the above are perceived as null.
        callback(traverseContext, null, storageName, indexSoFar);
        subtreeCount = 1;
      } else if (children.type && children.type.prototype &&
                 children.type.prototype.mountComponentIntoNode) {
        callback(traverseContext, children, storageName, indexSoFar);
        subtreeCount = 1;
      } else {
        if (type === 'object') {
          ("production" !== process.env.NODE_ENV ? invariant(
            !children || children.nodeType !== 1,
            'traverseAllChildren(...): Encountered an invalid child; DOM ' +
            'elements are not valid children of React components.'
          ) : invariant(!children || children.nodeType !== 1));
          for (var key in children) {
            if (children.hasOwnProperty(key)) {
              subtreeCount += traverseAllChildrenImpl(
                children[key],
                (
                  nameSoFar + (nameSoFar ? SUBSEPARATOR : SEPARATOR) +
                  wrapUserProvidedKey(key) + SUBSEPARATOR +
                  getComponentKey(children[key], 0)
                ),
                indexSoFar + subtreeCount,
                callback,
                traverseContext
              );
            }
          }
        } else if (type === 'string') {
          var normalizedText = ReactTextComponent(children);
          callback(traverseContext, normalizedText, storageName, indexSoFar);
          subtreeCount += 1;
        } else if (type === 'number') {
          var normalizedNumber = ReactTextComponent('' + children);
          callback(traverseContext, normalizedNumber, storageName, indexSoFar);
          subtreeCount += 1;
        }
      }
    }
    return subtreeCount;
  };

/**
 * Traverses children that are typically specified as `props.children`, but
 * might also be specified through attributes:
 *
 * - `traverseAllChildren(this.props.children, ...)`
 * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
 *
 * The `traverseContext` is an optional argument that is passed through the
 * entire traversal. It can be used to store accumulations or anything else that
 * the callback might find relevant.
 *
 * @param {?*} children Children tree object.
 * @param {!function} callback To invoke upon traversing each child.
 * @param {?*} traverseContext Context for traversal.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', 0, callback, traverseContext);
}

module.exports = traverseAllChildren;

}).call(this,require('_process'))
},{"./ReactInstanceHandles":63,"./ReactTextComponent":79,"./invariant":124,"_process":3}],147:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule warning
 */

"use strict";

var emptyFunction = require("./emptyFunction");

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if ("production" !== process.env.NODE_ENV) {
  warning = function(condition, format ) {var args=Array.prototype.slice.call(arguments,2);
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (!condition) {
      var argIndex = 0;
      console.warn('Warning: ' + format.replace(/%s/g, function()  {return args[argIndex++];}));
    }
  };
}

module.exports = warning;

}).call(this,require('_process'))
},{"./emptyFunction":106,"_process":3}],148:[function(require,module,exports){
// transit-js 0.8.734
// http://transit-format.org
// 
// Copyright 2014 Cognitect. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License..
var COMPILED = !0, goog = goog || {};
goog.global = this;
goog.isDef = function(a) {
  return void 0 !== a;
};
goog.exportPath_ = function(a, b, c) {
  a = a.split(".");
  c = c || goog.global;
  a[0] in c || !c.execScript || c.execScript("var " + a[0]);
  for (var d;a.length && (d = a.shift());) {
    !a.length && goog.isDef(b) ? c[d] = b : c = c[d] ? c[d] : c[d] = {};
  }
};
goog.define = function(a, b) {
  var c = b;
  COMPILED || (goog.global.CLOSURE_UNCOMPILED_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_UNCOMPILED_DEFINES, a) ? c = goog.global.CLOSURE_UNCOMPILED_DEFINES[a] : goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, a) && (c = goog.global.CLOSURE_DEFINES[a]));
  goog.exportPath_(a, c);
};
goog.DEBUG = !0;
goog.LOCALE = "en";
goog.TRUSTED_SITE = !0;
goog.STRICT_MODE_COMPATIBLE = !1;
goog.provide = function(a) {
  if (!COMPILED && goog.isProvided_(a)) {
    throw Error('Namespace "' + a + '" already declared.');
  }
  goog.constructNamespace_(a);
};
goog.constructNamespace_ = function(a, b) {
  if (!COMPILED) {
    delete goog.implicitNamespaces_[a];
    for (var c = a;(c = c.substring(0, c.lastIndexOf("."))) && !goog.getObjectByName(c);) {
      goog.implicitNamespaces_[c] = !0;
    }
  }
  goog.exportPath_(a, b);
};
goog.module = function(a) {
  if (!goog.isString(a) || !a) {
    throw Error("Invalid module identifier");
  }
  if (!goog.isInModuleLoader_()) {
    throw Error("Module " + a + " has been loaded incorrectly.");
  }
  if (goog.moduleLoaderState_.moduleName) {
    throw Error("goog.module may only be called once per module.");
  }
  goog.moduleLoaderState_.moduleName = a;
  if (!COMPILED) {
    if (goog.isProvided_(a)) {
      throw Error('Namespace "' + a + '" already declared.');
    }
    delete goog.implicitNamespaces_[a];
  }
};
goog.module.get = function(a) {
  return goog.module.getInternal_(a);
};
goog.module.getInternal_ = function(a) {
  if (!COMPILED) {
    return goog.isProvided_(a) ? a in goog.loadedModules_ ? goog.loadedModules_[a] : goog.getObjectByName(a) : null;
  }
};
goog.moduleLoaderState_ = null;
goog.isInModuleLoader_ = function() {
  return null != goog.moduleLoaderState_;
};
goog.module.declareTestMethods = function() {
  if (!goog.isInModuleLoader_()) {
    throw Error("goog.module.declareTestMethods must be called from within a goog.module");
  }
  goog.moduleLoaderState_.declareTestMethods = !0;
};
goog.module.declareLegacyNamespace = function() {
  if (!COMPILED && !goog.isInModuleLoader_()) {
    throw Error("goog.module.declareLegacyNamespace must be called from within a goog.module");
  }
  if (!COMPILED && !goog.moduleLoaderState_.moduleName) {
    throw Error("goog.module must be called prior to goog.module.declareLegacyNamespace.");
  }
  goog.moduleLoaderState_.declareLegacyNamespace = !0;
};
goog.setTestOnly = function(a) {
  if (COMPILED && !goog.DEBUG) {
    throw (a = a || "", Error("Importing test-only code into non-debug environment" + (a ? ": " + a : ".")));
  }
};
goog.forwardDeclare = function(a) {
};
COMPILED || (goog.isProvided_ = function(a) {
  return a in goog.loadedModules_ || !goog.implicitNamespaces_[a] && goog.isDefAndNotNull(goog.getObjectByName(a));
}, goog.implicitNamespaces_ = {"goog.module":!0});
goog.getObjectByName = function(a, b) {
  for (var c = a.split("."), d = b || goog.global, e;e = c.shift();) {
    if (goog.isDefAndNotNull(d[e])) {
      d = d[e];
    } else {
      return null;
    }
  }
  return d;
};
goog.globalize = function(a, b) {
  var c = b || goog.global, d;
  for (d in a) {
    c[d] = a[d];
  }
};
goog.addDependency = function(a, b, c, d) {
  if (goog.DEPENDENCIES_ENABLED) {
    var e;
    a = a.replace(/\\/g, "/");
    for (var f = goog.dependencies_, g = 0;e = b[g];g++) {
      f.nameToPath[e] = a, f.pathIsModule[a] = !!d;
    }
    for (d = 0;b = c[d];d++) {
      a in f.requires || (f.requires[a] = {}), f.requires[a][b] = !0;
    }
  }
};
goog.ENABLE_DEBUG_LOADER = !0;
goog.logToConsole_ = function(a) {
  goog.global.console && goog.global.console.error(a);
};
goog.require = function(a) {
  if (!COMPILED) {
    if (goog.isProvided_(a)) {
      return goog.isInModuleLoader_() ? goog.module.getInternal_(a) : null;
    }
    if (goog.ENABLE_DEBUG_LOADER) {
      var b = goog.getPathFromDeps_(a);
      if (b) {
        return goog.included_[b] = !0, goog.writeScripts_(), null;
      }
    }
    a = "goog.require could not find: " + a;
    goog.logToConsole_(a);
    throw Error(a);
  }
};
goog.basePath = "";
goog.nullFunction = function() {
};
goog.identityFunction = function(a, b) {
  return a;
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(a) {
  a.getInstance = function() {
    if (a.instance_) {
      return a.instance_;
    }
    goog.DEBUG && (goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = a);
    return a.instance_ = new a;
  };
};
goog.instantiatedSingletons_ = [];
goog.LOAD_MODULE_USING_EVAL = !0;
goog.SEAL_MODULE_EXPORTS = goog.DEBUG;
goog.loadedModules_ = {};
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;
goog.DEPENDENCIES_ENABLED && (goog.included_ = {}, goog.dependencies_ = {pathIsModule:{}, nameToPath:{}, requires:{}, visited:{}, written:{}}, goog.inHtmlDocument_ = function() {
  var a = goog.global.document;
  return "undefined" != typeof a && "write" in a;
}, goog.findBasePath_ = function() {
  if (goog.global.CLOSURE_BASE_PATH) {
    goog.basePath = goog.global.CLOSURE_BASE_PATH;
  } else {
    if (goog.inHtmlDocument_()) {
      for (var a = goog.global.document.getElementsByTagName("script"), b = a.length - 1;0 <= b;--b) {
        var c = a[b].src, d = c.lastIndexOf("?"), d = -1 == d ? c.length : d;
        if ("base.js" == c.substr(d - 7, 7)) {
          goog.basePath = c.substr(0, d - 7);
          break;
        }
      }
    }
  }
}, goog.importScript_ = function(a, b) {
  (goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_)(a, b) && (goog.dependencies_.written[a] = !0);
}, goog.IS_OLD_IE_ = goog.global.document && goog.global.document.all && !goog.global.atob, goog.importModule_ = function(a) {
  goog.importScript_("", 'goog.retrieveAndExecModule_("' + a + '");') && (goog.dependencies_.written[a] = !0);
}, goog.queuedModules_ = [], goog.retrieveAndExecModule_ = function(a) {
  for (var b;-1 != (b = a.indexOf("/./"));) {
    a = a.substr(0, b) + a.substr(b + 2);
  }
  for (;-1 != (b = a.indexOf("/../"));) {
    var c = a.lastIndexOf("/", b - 1);
    a = a.substr(0, c) + a.substr(b + 3);
  }
  b = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
  var d = null, c = new goog.global.XMLHttpRequest;
  c.onload = function() {
    d = this.responseText;
  };
  c.open("get", a, !1);
  c.send();
  d = c.responseText;
  if (null != d) {
    c = goog.wrapModule_(a, d), goog.IS_OLD_IE_ ? goog.queuedModules_.push(c) : b(a, c), goog.dependencies_.written[a] = !0;
  } else {
    throw Error("load of " + a + "failed");
  }
}, goog.wrapModule_ = function(a, b) {
  return goog.LOAD_MODULE_USING_EVAL && goog.isDef(goog.global.JSON) ? "goog.loadModule(" + goog.global.JSON.stringify(b + "\n//# sourceURL=" + a + "\n") + ");" : 'goog.loadModule(function(exports) {"use strict";' + b + "\n;return exports});\n//# sourceURL=" + a + "\n";
}, goog.loadQueuedModules_ = function() {
  var a = goog.queuedModules_.length;
  if (0 < a) {
    var b = goog.queuedModules_;
    goog.queuedModules_ = [];
    for (var c = 0;c < a;c++) {
      goog.globalEval(b[c]);
    }
  }
}, goog.loadModule = function(a) {
  try {
    goog.moduleLoaderState_ = {moduleName:void 0, declareTestMethods:!1};
    var b;
    if (goog.isFunction(a)) {
      b = a.call(goog.global, {});
    } else {
      if (goog.isString(a)) {
        b = goog.loadModuleFromSource_.call(goog.global, a);
      } else {
        throw Error("Invalid module definition");
      }
    }
    var c = goog.moduleLoaderState_.moduleName;
    if (!goog.isString(c) || !c) {
      throw Error('Invalid module name "' + c + '"');
    }
    goog.moduleLoaderState_.declareLegacyNamespace ? goog.constructNamespace_(c, b) : goog.SEAL_MODULE_EXPORTS && Object.seal && Object.seal(b);
    goog.loadedModules_[c] = b;
    if (goog.moduleLoaderState_.declareTestMethods) {
      for (var d in b) {
        if (0 === d.indexOf("test", 0) || "tearDown" == d || "setup" == d) {
          goog.global[d] = b[d];
        }
      }
    }
  } finally {
    goog.moduleLoaderState_ = null;
  }
}, goog.loadModuleFromSource_ = function(a) {
  eval(a);
  return{};
}, goog.writeScriptTag_ = function(a, b) {
  if (goog.inHtmlDocument_()) {
    var c = goog.global.document;
    if ("complete" == c.readyState) {
      if (/\bdeps.js$/.test(a)) {
        return!1;
      }
      throw Error('Cannot write "' + a + '" after document load');
    }
    var d = goog.IS_OLD_IE_;
    void 0 === b ? d ? (d = " onreadystatechange='goog.onScriptLoad_(this, " + ++goog.lastNonModuleScriptIndex_ + ")' ", c.write('<script type="text/javascript" src="' + a + '"' + d + ">\x3c/script>")) : c.write('<script type="text/javascript" src="' + a + '">\x3c/script>') : c.write('<script type="text/javascript">' + b + "\x3c/script>");
    return!0;
  }
  return!1;
}, goog.lastNonModuleScriptIndex_ = 0, goog.onScriptLoad_ = function(a, b) {
  "complete" == a.readyState && goog.lastNonModuleScriptIndex_ == b && goog.loadQueuedModules_();
  return!0;
}, goog.writeScripts_ = function() {
  function a(e) {
    if (!(e in d.written)) {
      if (!(e in d.visited) && (d.visited[e] = !0, e in d.requires)) {
        for (var f in d.requires[e]) {
          if (!goog.isProvided_(f)) {
            if (f in d.nameToPath) {
              a(d.nameToPath[f]);
            } else {
              throw Error("Undefined nameToPath for " + f);
            }
          }
        }
      }
      e in c || (c[e] = !0, b.push(e));
    }
  }
  var b = [], c = {}, d = goog.dependencies_, e;
  for (e in goog.included_) {
    d.written[e] || a(e);
  }
  for (var f = 0;f < b.length;f++) {
    e = b[f], goog.dependencies_.written[e] = !0;
  }
  var g = goog.moduleLoaderState_;
  goog.moduleLoaderState_ = null;
  for (f = 0;f < b.length;f++) {
    if (e = b[f]) {
      d.pathIsModule[e] ? goog.importModule_(goog.basePath + e) : goog.importScript_(goog.basePath + e);
    } else {
      throw (goog.moduleLoaderState_ = g, Error("Undefined script input"));
    }
  }
  goog.moduleLoaderState_ = g;
}, goog.getPathFromDeps_ = function(a) {
  return a in goog.dependencies_.nameToPath ? goog.dependencies_.nameToPath[a] : null;
}, goog.findBasePath_(), goog.global.CLOSURE_NO_DEPS || goog.importScript_(goog.basePath + "deps.js"));
goog.typeOf = function(a) {
  var b = typeof a;
  if ("object" == b) {
    if (a) {
      if (a instanceof Array) {
        return "array";
      }
      if (a instanceof Object) {
        return b;
      }
      var c = Object.prototype.toString.call(a);
      if ("[object Window]" == c) {
        return "object";
      }
      if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) {
        return "array";
      }
      if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) {
        return "function";
      }
    } else {
      return "null";
    }
  } else {
    if ("function" == b && "undefined" == typeof a.call) {
      return "object";
    }
  }
  return b;
};
goog.isNull = function(a) {
  return null === a;
};
goog.isDefAndNotNull = function(a) {
  return null != a;
};
goog.isArray = function(a) {
  return "array" == goog.typeOf(a);
};
goog.isArrayLike = function(a) {
  var b = goog.typeOf(a);
  return "array" == b || "object" == b && "number" == typeof a.length;
};
goog.isDateLike = function(a) {
  return goog.isObject(a) && "function" == typeof a.getFullYear;
};
goog.isString = function(a) {
  return "string" == typeof a;
};
goog.isBoolean = function(a) {
  return "boolean" == typeof a;
};
goog.isNumber = function(a) {
  return "number" == typeof a;
};
goog.isFunction = function(a) {
  return "function" == goog.typeOf(a);
};
goog.isObject = function(a) {
  var b = typeof a;
  return "object" == b && null != a || "function" == b;
};
goog.getUid = function(a) {
  return a[goog.UID_PROPERTY_] || (a[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};
goog.hasUid = function(a) {
  return!!a[goog.UID_PROPERTY_];
};
goog.removeUid = function(a) {
  "removeAttribute" in a && a.removeAttribute(goog.UID_PROPERTY_);
  try {
    delete a[goog.UID_PROPERTY_];
  } catch (b) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + (1E9 * Math.random() >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(a) {
  var b = goog.typeOf(a);
  if ("object" == b || "array" == b) {
    if (a.clone) {
      return a.clone();
    }
    var b = "array" == b ? [] : {}, c;
    for (c in a) {
      b[c] = goog.cloneObject(a[c]);
    }
    return b;
  }
  return a;
};
goog.bindNative_ = function(a, b, c) {
  return a.call.apply(a.bind, arguments);
};
goog.bindJs_ = function(a, b, c) {
  if (!a) {
    throw Error();
  }
  if (2 < arguments.length) {
    var d = Array.prototype.slice.call(arguments, 2);
    return function() {
      var c = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(c, d);
      return a.apply(b, c);
    };
  }
  return function() {
    return a.apply(b, arguments);
  };
};
goog.bind = function(a, b, c) {
  Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? goog.bind = goog.bindNative_ : goog.bind = goog.bindJs_;
  return goog.bind.apply(null, arguments);
};
goog.partial = function(a, b) {
  var c = Array.prototype.slice.call(arguments, 1);
  return function() {
    var b = c.slice();
    b.push.apply(b, arguments);
    return a.apply(this, b);
  };
};
goog.mixin = function(a, b) {
  for (var c in b) {
    a[c] = b[c];
  }
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return+new Date;
};
goog.globalEval = function(a) {
  if (goog.global.execScript) {
    goog.global.execScript(a, "JavaScript");
  } else {
    if (goog.global.eval) {
      if (null == goog.evalWorksForGlobals_ && (goog.global.eval("var _et_ = 1;"), "undefined" != typeof goog.global._et_ ? (delete goog.global._et_, goog.evalWorksForGlobals_ = !0) : goog.evalWorksForGlobals_ = !1), goog.evalWorksForGlobals_) {
        goog.global.eval(a);
      } else {
        var b = goog.global.document, c = b.createElement("script");
        c.type = "text/javascript";
        c.defer = !1;
        c.appendChild(b.createTextNode(a));
        b.body.appendChild(c);
        b.body.removeChild(c);
      }
    } else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.getCssName = function(a, b) {
  var c = function(a) {
    return goog.cssNameMapping_[a] || a;
  }, d = function(a) {
    a = a.split("-");
    for (var b = [], d = 0;d < a.length;d++) {
      b.push(c(a[d]));
    }
    return b.join("-");
  }, d = goog.cssNameMapping_ ? "BY_WHOLE" == goog.cssNameMappingStyle_ ? c : d : function(a) {
    return a;
  };
  return b ? a + "-" + d(b) : d(a);
};
goog.setCssNameMapping = function(a, b) {
  goog.cssNameMapping_ = a;
  goog.cssNameMappingStyle_ = b;
};
!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING && (goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING);
goog.getMsg = function(a, b) {
  b && (a = a.replace(/\{\$([^}]+)}/g, function(a, d) {
    return d in b ? b[d] : a;
  }));
  return a;
};
goog.getMsgWithFallback = function(a, b) {
  return a;
};
goog.exportSymbol = function(a, b, c) {
  goog.exportPath_(a, b, c);
};
goog.exportProperty = function(a, b, c) {
  a[b] = c;
};
goog.inherits = function(a, b) {
  function c() {
  }
  c.prototype = b.prototype;
  a.superClass_ = b.prototype;
  a.prototype = new c;
  a.prototype.constructor = a;
  a.base = function(a, c, f) {
    var g = Array.prototype.slice.call(arguments, 2);
    return b.prototype[c].apply(a, g);
  };
};
goog.base = function(a, b, c) {
  var d = arguments.callee.caller;
  if (goog.STRICT_MODE_COMPATIBLE || goog.DEBUG && !d) {
    throw Error("arguments.caller not defined.  goog.base() cannot be used with strict mode code. See http://www.ecma-international.org/ecma-262/5.1/#sec-C");
  }
  if (d.superClass_) {
    return d.superClass_.constructor.apply(a, Array.prototype.slice.call(arguments, 1));
  }
  for (var e = Array.prototype.slice.call(arguments, 2), f = !1, g = a.constructor;g;g = g.superClass_ && g.superClass_.constructor) {
    if (g.prototype[b] === d) {
      f = !0;
    } else {
      if (f) {
        return g.prototype[b].apply(a, e);
      }
    }
  }
  if (a[b] === d) {
    return a.constructor.prototype[b].apply(a, e);
  }
  throw Error("goog.base called from a method of one name to a method of a different name");
};
goog.scope = function(a) {
  a.call(goog.global);
};
COMPILED || (goog.global.COMPILED = COMPILED);
goog.defineClass = function(a, b) {
  var c = b.constructor, d = b.statics;
  c && c != Object.prototype.constructor || (c = function() {
    throw Error("cannot instantiate an interface (no constructor defined).");
  });
  c = goog.defineClass.createSealingConstructor_(c, a);
  a && goog.inherits(c, a);
  delete b.constructor;
  delete b.statics;
  goog.defineClass.applyProperties_(c.prototype, b);
  null != d && (d instanceof Function ? d(c) : goog.defineClass.applyProperties_(c, d));
  return c;
};
goog.defineClass.SEAL_CLASS_INSTANCES = goog.DEBUG;
goog.defineClass.createSealingConstructor_ = function(a, b) {
  if (goog.defineClass.SEAL_CLASS_INSTANCES && Object.seal instanceof Function) {
    if (b && b.prototype && b.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_]) {
      return a;
    }
    var c = function() {
      var b = a.apply(this, arguments) || this;
      b[goog.UID_PROPERTY_] = b[goog.UID_PROPERTY_];
      this.constructor === c && Object.seal(b);
      return b;
    };
    return c;
  }
  return a;
};
goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
goog.defineClass.applyProperties_ = function(a, b) {
  for (var c in b) {
    Object.prototype.hasOwnProperty.call(b, c) && (a[c] = b[c]);
  }
  for (var d = 0;d < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length;d++) {
    c = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[d], Object.prototype.hasOwnProperty.call(b, c) && (a[c] = b[c]);
  }
};
goog.tagUnsealableClass = function(a) {
  !COMPILED && goog.defineClass.SEAL_CLASS_INSTANCES && (a.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_] = !0);
};
goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = "goog_defineClass_legacy_unsealable";
goog.debug = {};
goog.debug.Error = function(a) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error);
  } else {
    var b = Error().stack;
    b && (this.stack = b);
  }
  a && (this.message = String(a));
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.dom = {};
goog.dom.NodeType = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, ENTITY_REFERENCE:5, ENTITY:6, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9, DOCUMENT_TYPE:10, DOCUMENT_FRAGMENT:11, NOTATION:12};
goog.string = {};
goog.string.DETECT_DOUBLE_ESCAPING = !1;
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(a, b) {
  return 0 == a.lastIndexOf(b, 0);
};
goog.string.endsWith = function(a, b) {
  var c = a.length - b.length;
  return 0 <= c && a.indexOf(b, c) == c;
};
goog.string.caseInsensitiveStartsWith = function(a, b) {
  return 0 == goog.string.caseInsensitiveCompare(b, a.substr(0, b.length));
};
goog.string.caseInsensitiveEndsWith = function(a, b) {
  return 0 == goog.string.caseInsensitiveCompare(b, a.substr(a.length - b.length, b.length));
};
goog.string.caseInsensitiveEquals = function(a, b) {
  return a.toLowerCase() == b.toLowerCase();
};
goog.string.subs = function(a, b) {
  for (var c = a.split("%s"), d = "", e = Array.prototype.slice.call(arguments, 1);e.length && 1 < c.length;) {
    d += c.shift() + e.shift();
  }
  return d + c.join("%s");
};
goog.string.collapseWhitespace = function(a) {
  return a.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "");
};
goog.string.isEmptyOrWhitespace = function(a) {
  return/^[\s\xa0]*$/.test(a);
};
goog.string.isEmptyString = function(a) {
  return 0 == a.length;
};
goog.string.isEmpty = goog.string.isEmptyOrWhitespace;
goog.string.isEmptyOrWhitespaceSafe = function(a) {
  return goog.string.isEmptyOrWhitespace(goog.string.makeSafe(a));
};
goog.string.isEmptySafe = goog.string.isEmptyOrWhitespaceSafe;
goog.string.isBreakingWhitespace = function(a) {
  return!/[^\t\n\r ]/.test(a);
};
goog.string.isAlpha = function(a) {
  return!/[^a-zA-Z]/.test(a);
};
goog.string.isNumeric = function(a) {
  return!/[^0-9]/.test(a);
};
goog.string.isAlphaNumeric = function(a) {
  return!/[^a-zA-Z0-9]/.test(a);
};
goog.string.isSpace = function(a) {
  return " " == a;
};
goog.string.isUnicodeChar = function(a) {
  return 1 == a.length && " " <= a && "~" >= a || "\u0080" <= a && "\ufffd" >= a;
};
goog.string.stripNewlines = function(a) {
  return a.replace(/(\r\n|\r|\n)+/g, " ");
};
goog.string.canonicalizeNewlines = function(a) {
  return a.replace(/(\r\n|\r|\n)/g, "\n");
};
goog.string.normalizeWhitespace = function(a) {
  return a.replace(/\xa0|\s/g, " ");
};
goog.string.normalizeSpaces = function(a) {
  return a.replace(/\xa0|[ \t]+/g, " ");
};
goog.string.collapseBreakingSpaces = function(a) {
  return a.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "");
};
goog.string.trim = goog.TRUSTED_SITE && String.prototype.trim ? function(a) {
  return a.trim();
} : function(a) {
  return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
};
goog.string.trimLeft = function(a) {
  return a.replace(/^[\s\xa0]+/, "");
};
goog.string.trimRight = function(a) {
  return a.replace(/[\s\xa0]+$/, "");
};
goog.string.caseInsensitiveCompare = function(a, b) {
  var c = String(a).toLowerCase(), d = String(b).toLowerCase();
  return c < d ? -1 : c == d ? 0 : 1;
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(a, b) {
  if (a == b) {
    return 0;
  }
  if (!a) {
    return-1;
  }
  if (!b) {
    return 1;
  }
  for (var c = a.toLowerCase().match(goog.string.numerateCompareRegExp_), d = b.toLowerCase().match(goog.string.numerateCompareRegExp_), e = Math.min(c.length, d.length), f = 0;f < e;f++) {
    var g = c[f], h = d[f];
    if (g != h) {
      return c = parseInt(g, 10), !isNaN(c) && (d = parseInt(h, 10), !isNaN(d) && c - d) ? c - d : g < h ? -1 : 1;
    }
  }
  return c.length != d.length ? c.length - d.length : a < b ? -1 : 1;
};
goog.string.urlEncode = function(a) {
  return encodeURIComponent(String(a));
};
goog.string.urlDecode = function(a) {
  return decodeURIComponent(a.replace(/\+/g, " "));
};
goog.string.newLineToBr = function(a, b) {
  return a.replace(/(\r\n|\r|\n)/g, b ? "<br />" : "<br>");
};
goog.string.htmlEscape = function(a, b) {
  if (b) {
    a = a.replace(goog.string.AMP_RE_, "&amp;").replace(goog.string.LT_RE_, "&lt;").replace(goog.string.GT_RE_, "&gt;").replace(goog.string.QUOT_RE_, "&quot;").replace(goog.string.SINGLE_QUOTE_RE_, "&#39;").replace(goog.string.NULL_RE_, "&#0;"), goog.string.DETECT_DOUBLE_ESCAPING && (a = a.replace(goog.string.E_RE_, "&#101;"));
  } else {
    if (!goog.string.ALL_RE_.test(a)) {
      return a;
    }
    -1 != a.indexOf("&") && (a = a.replace(goog.string.AMP_RE_, "&amp;"));
    -1 != a.indexOf("<") && (a = a.replace(goog.string.LT_RE_, "&lt;"));
    -1 != a.indexOf(">") && (a = a.replace(goog.string.GT_RE_, "&gt;"));
    -1 != a.indexOf('"') && (a = a.replace(goog.string.QUOT_RE_, "&quot;"));
    -1 != a.indexOf("'") && (a = a.replace(goog.string.SINGLE_QUOTE_RE_, "&#39;"));
    -1 != a.indexOf("\x00") && (a = a.replace(goog.string.NULL_RE_, "&#0;"));
    goog.string.DETECT_DOUBLE_ESCAPING && -1 != a.indexOf("e") && (a = a.replace(goog.string.E_RE_, "&#101;"));
  }
  return a;
};
goog.string.AMP_RE_ = /&/g;
goog.string.LT_RE_ = /</g;
goog.string.GT_RE_ = />/g;
goog.string.QUOT_RE_ = /"/g;
goog.string.SINGLE_QUOTE_RE_ = /'/g;
goog.string.NULL_RE_ = /\x00/g;
goog.string.E_RE_ = /e/g;
goog.string.ALL_RE_ = goog.string.DETECT_DOUBLE_ESCAPING ? /[\x00&<>"'e]/ : /[\x00&<>"']/;
goog.string.unescapeEntities = function(a) {
  return goog.string.contains(a, "&") ? "document" in goog.global ? goog.string.unescapeEntitiesUsingDom_(a) : goog.string.unescapePureXmlEntities_(a) : a;
};
goog.string.unescapeEntitiesWithDocument = function(a, b) {
  return goog.string.contains(a, "&") ? goog.string.unescapeEntitiesUsingDom_(a, b) : a;
};
goog.string.unescapeEntitiesUsingDom_ = function(a, b) {
  var c = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'}, d;
  d = b ? b.createElement("div") : goog.global.document.createElement("div");
  return a.replace(goog.string.HTML_ENTITY_PATTERN_, function(a, b) {
    var g = c[a];
    if (g) {
      return g;
    }
    if ("#" == b.charAt(0)) {
      var h = Number("0" + b.substr(1));
      isNaN(h) || (g = String.fromCharCode(h));
    }
    g || (d.innerHTML = a + " ", g = d.firstChild.nodeValue.slice(0, -1));
    return c[a] = g;
  });
};
goog.string.unescapePureXmlEntities_ = function(a) {
  return a.replace(/&([^;]+);/g, function(a, c) {
    switch(c) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return'"';
      default:
        if ("#" == c.charAt(0)) {
          var d = Number("0" + c.substr(1));
          if (!isNaN(d)) {
            return String.fromCharCode(d);
          }
        }
        return a;
    }
  });
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(a, b) {
  return goog.string.newLineToBr(a.replace(/  /g, " &#160;"), b);
};
goog.string.preserveSpaces = function(a) {
  return a.replace(/(^|[\n ]) /g, "$1" + goog.string.Unicode.NBSP);
};
goog.string.stripQuotes = function(a, b) {
  for (var c = b.length, d = 0;d < c;d++) {
    var e = 1 == c ? b : b.charAt(d);
    if (a.charAt(0) == e && a.charAt(a.length - 1) == e) {
      return a.substring(1, a.length - 1);
    }
  }
  return a;
};
goog.string.truncate = function(a, b, c) {
  c && (a = goog.string.unescapeEntities(a));
  a.length > b && (a = a.substring(0, b - 3) + "...");
  c && (a = goog.string.htmlEscape(a));
  return a;
};
goog.string.truncateMiddle = function(a, b, c, d) {
  c && (a = goog.string.unescapeEntities(a));
  if (d && a.length > b) {
    d > b && (d = b);
    var e = a.length - d;
    a = a.substring(0, b - d) + "..." + a.substring(e);
  } else {
    a.length > b && (d = Math.floor(b / 2), e = a.length - d, a = a.substring(0, d + b % 2) + "..." + a.substring(e));
  }
  c && (a = goog.string.htmlEscape(a));
  return a;
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(a) {
  a = String(a);
  if (a.quote) {
    return a.quote();
  }
  for (var b = ['"'], c = 0;c < a.length;c++) {
    var d = a.charAt(c), e = d.charCodeAt(0);
    b[c + 1] = goog.string.specialEscapeChars_[d] || (31 < e && 127 > e ? d : goog.string.escapeChar(d));
  }
  b.push('"');
  return b.join("");
};
goog.string.escapeString = function(a) {
  for (var b = [], c = 0;c < a.length;c++) {
    b[c] = goog.string.escapeChar(a.charAt(c));
  }
  return b.join("");
};
goog.string.escapeChar = function(a) {
  if (a in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[a];
  }
  if (a in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[a] = goog.string.specialEscapeChars_[a];
  }
  var b = a, c = a.charCodeAt(0);
  if (31 < c && 127 > c) {
    b = a;
  } else {
    if (256 > c) {
      if (b = "\\x", 16 > c || 256 < c) {
        b += "0";
      }
    } else {
      b = "\\u", 4096 > c && (b += "0");
    }
    b += c.toString(16).toUpperCase();
  }
  return goog.string.jsEscapeCache_[a] = b;
};
goog.string.contains = function(a, b) {
  return-1 != a.indexOf(b);
};
goog.string.caseInsensitiveContains = function(a, b) {
  return goog.string.contains(a.toLowerCase(), b.toLowerCase());
};
goog.string.countOf = function(a, b) {
  return a && b ? a.split(b).length - 1 : 0;
};
goog.string.removeAt = function(a, b, c) {
  var d = a;
  0 <= b && b < a.length && 0 < c && (d = a.substr(0, b) + a.substr(b + c, a.length - b - c));
  return d;
};
goog.string.remove = function(a, b) {
  var c = new RegExp(goog.string.regExpEscape(b), "");
  return a.replace(c, "");
};
goog.string.removeAll = function(a, b) {
  var c = new RegExp(goog.string.regExpEscape(b), "g");
  return a.replace(c, "");
};
goog.string.regExpEscape = function(a) {
  return String(a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
};
goog.string.repeat = function(a, b) {
  return Array(b + 1).join(a);
};
goog.string.padNumber = function(a, b, c) {
  a = goog.isDef(c) ? a.toFixed(c) : String(a);
  c = a.indexOf(".");
  -1 == c && (c = a.length);
  return goog.string.repeat("0", Math.max(0, b - c)) + a;
};
goog.string.makeSafe = function(a) {
  return null == a ? "" : String(a);
};
goog.string.buildString = function(a) {
  return Array.prototype.join.call(arguments, "");
};
goog.string.getRandomString = function() {
  return Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ goog.now()).toString(36);
};
goog.string.compareVersions = function(a, b) {
  for (var c = 0, d = goog.string.trim(String(a)).split("."), e = goog.string.trim(String(b)).split("."), f = Math.max(d.length, e.length), g = 0;0 == c && g < f;g++) {
    var h = d[g] || "", l = e[g] || "", k = RegExp("(\\d*)(\\D*)", "g"), m = RegExp("(\\d*)(\\D*)", "g");
    do {
      var n = k.exec(h) || ["", "", ""], p = m.exec(l) || ["", "", ""];
      if (0 == n[0].length && 0 == p[0].length) {
        break;
      }
      var c = 0 == n[1].length ? 0 : parseInt(n[1], 10), q = 0 == p[1].length ? 0 : parseInt(p[1], 10), c = goog.string.compareElements_(c, q) || goog.string.compareElements_(0 == n[2].length, 0 == p[2].length) || goog.string.compareElements_(n[2], p[2]);
    } while (0 == c);
  }
  return c;
};
goog.string.compareElements_ = function(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(a) {
  for (var b = 0, c = 0;c < a.length;++c) {
    b = 31 * b + a.charCodeAt(c), b %= goog.string.HASHCODE_MAX_;
  }
  return b;
};
goog.string.uniqueStringCounter_ = 2147483648 * Math.random() | 0;
goog.string.createUniqueString = function() {
  return "goog_" + goog.string.uniqueStringCounter_++;
};
goog.string.toNumber = function(a) {
  var b = Number(a);
  return 0 == b && goog.string.isEmpty(a) ? NaN : b;
};
goog.string.isLowerCamelCase = function(a) {
  return/^[a-z]+([A-Z][a-z]*)*$/.test(a);
};
goog.string.isUpperCamelCase = function(a) {
  return/^([A-Z][a-z]*)+$/.test(a);
};
goog.string.toCamelCase = function(a) {
  return String(a).replace(/\-([a-z])/g, function(a, c) {
    return c.toUpperCase();
  });
};
goog.string.toSelectorCase = function(a) {
  return String(a).replace(/([A-Z])/g, "-$1").toLowerCase();
};
goog.string.toTitleCase = function(a, b) {
  var c = goog.isString(b) ? goog.string.regExpEscape(b) : "\\s";
  return a.replace(new RegExp("(^" + (c ? "|[" + c + "]+" : "") + ")([a-z])", "g"), function(a, b, c) {
    return b + c.toUpperCase();
  });
};
goog.string.parseInt = function(a) {
  isFinite(a) && (a = String(a));
  return goog.isString(a) ? /^\s*-?0x/i.test(a) ? parseInt(a, 16) : parseInt(a, 10) : NaN;
};
goog.string.splitLimit = function(a, b, c) {
  a = a.split(b);
  for (var d = [];0 < c && a.length;) {
    d.push(a.shift()), c--;
  }
  a.length && d.push(a.join(b));
  return d;
};
goog.asserts = {};
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
goog.asserts.AssertionError = function(a, b) {
  b.unshift(a);
  goog.debug.Error.call(this, goog.string.subs.apply(null, b));
  b.shift();
  this.messagePattern = a;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.DEFAULT_ERROR_HANDLER = function(a) {
  throw a;
};
goog.asserts.errorHandler_ = goog.asserts.DEFAULT_ERROR_HANDLER;
goog.asserts.doAssertFailure_ = function(a, b, c, d) {
  var e = "Assertion failed";
  if (c) {
    var e = e + (": " + c), f = d
  } else {
    a && (e += ": " + a, f = b);
  }
  a = new goog.asserts.AssertionError("" + e, f || []);
  goog.asserts.errorHandler_(a);
};
goog.asserts.setErrorHandler = function(a) {
  goog.asserts.ENABLE_ASSERTS && (goog.asserts.errorHandler_ = a);
};
goog.asserts.assert = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !a && goog.asserts.doAssertFailure_("", null, b, Array.prototype.slice.call(arguments, 2));
  return a;
};
goog.asserts.fail = function(a, b) {
  goog.asserts.ENABLE_ASSERTS && goog.asserts.errorHandler_(new goog.asserts.AssertionError("Failure" + (a ? ": " + a : ""), Array.prototype.slice.call(arguments, 1)));
};
goog.asserts.assertNumber = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isNumber(a) && goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a;
};
goog.asserts.assertString = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isString(a) && goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a;
};
goog.asserts.assertFunction = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isFunction(a) && goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a;
};
goog.asserts.assertObject = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isObject(a) && goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a;
};
goog.asserts.assertArray = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isArray(a) && goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a;
};
goog.asserts.assertBoolean = function(a, b, c) {
  goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(a) && goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a;
};
goog.asserts.assertElement = function(a, b, c) {
  !goog.asserts.ENABLE_ASSERTS || goog.isObject(a) && a.nodeType == goog.dom.NodeType.ELEMENT || goog.asserts.doAssertFailure_("Expected Element but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a;
};
goog.asserts.assertInstanceof = function(a, b, c, d) {
  !goog.asserts.ENABLE_ASSERTS || a instanceof b || goog.asserts.doAssertFailure_("instanceof check failed.", null, c, Array.prototype.slice.call(arguments, 3));
  return a;
};
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for (var a in Object.prototype) {
    goog.asserts.fail(a + " should not be enumerable in Object.prototype.");
  }
};
goog.array = {};
goog.NATIVE_ARRAY_PROTOTYPES = goog.TRUSTED_SITE;
goog.array.ASSUME_NATIVE_FUNCTIONS = !1;
goog.array.peek = function(a) {
  return a[a.length - 1];
};
goog.array.last = goog.array.peek;
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.indexOf) ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(a, b, c);
} : function(a, b, c) {
  c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
  if (goog.isString(a)) {
    return goog.isString(b) && 1 == b.length ? a.indexOf(b, c) : -1;
  }
  for (;c < a.length;c++) {
    if (c in a && a[c] === b) {
      return c;
    }
  }
  return-1;
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.lastIndexOf) ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(a, b, null == c ? a.length - 1 : c);
} : function(a, b, c) {
  c = null == c ? a.length - 1 : c;
  0 > c && (c = Math.max(0, a.length + c));
  if (goog.isString(a)) {
    return goog.isString(b) && 1 == b.length ? a.lastIndexOf(b, c) : -1;
  }
  for (;0 <= c;c--) {
    if (c in a && a[c] === b) {
      return c;
    }
  }
  return-1;
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.forEach) ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  goog.array.ARRAY_PROTOTYPE_.forEach.call(a, b, c);
} : function(a, b, c) {
  for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0;f < d;f++) {
    f in e && b.call(c, e[f], f, a);
  }
};
goog.array.forEachRight = function(a, b, c) {
  for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1;0 <= d;--d) {
    d in e && b.call(c, e[d], d, a);
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.filter) ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.filter.call(a, b, c);
} : function(a, b, c) {
  for (var d = a.length, e = [], f = 0, g = goog.isString(a) ? a.split("") : a, h = 0;h < d;h++) {
    if (h in g) {
      var l = g[h];
      b.call(c, l, h, a) && (e[f++] = l);
    }
  }
  return e;
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.map) ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.map.call(a, b, c);
} : function(a, b, c) {
  for (var d = a.length, e = Array(d), f = goog.isString(a) ? a.split("") : a, g = 0;g < d;g++) {
    g in f && (e[g] = b.call(c, f[g], g, a));
  }
  return e;
};
goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.reduce) ? function(a, b, c, d) {
  goog.asserts.assert(null != a.length);
  d && (b = goog.bind(b, d));
  return goog.array.ARRAY_PROTOTYPE_.reduce.call(a, b, c);
} : function(a, b, c, d) {
  var e = c;
  goog.array.forEach(a, function(c, g) {
    e = b.call(d, e, c, g, a);
  });
  return e;
};
goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.reduceRight) ? function(a, b, c, d) {
  goog.asserts.assert(null != a.length);
  d && (b = goog.bind(b, d));
  return goog.array.ARRAY_PROTOTYPE_.reduceRight.call(a, b, c);
} : function(a, b, c, d) {
  var e = c;
  goog.array.forEachRight(a, function(c, g) {
    e = b.call(d, e, c, g, a);
  });
  return e;
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.some) ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.some.call(a, b, c);
} : function(a, b, c) {
  for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0;f < d;f++) {
    if (f in e && b.call(c, e[f], f, a)) {
      return!0;
    }
  }
  return!1;
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.every) ? function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.every.call(a, b, c);
} : function(a, b, c) {
  for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0;f < d;f++) {
    if (f in e && !b.call(c, e[f], f, a)) {
      return!1;
    }
  }
  return!0;
};
goog.array.count = function(a, b, c) {
  var d = 0;
  goog.array.forEach(a, function(a, f, g) {
    b.call(c, a, f, g) && ++d;
  }, c);
  return d;
};
goog.array.find = function(a, b, c) {
  b = goog.array.findIndex(a, b, c);
  return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b];
};
goog.array.findIndex = function(a, b, c) {
  for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0;f < d;f++) {
    if (f in e && b.call(c, e[f], f, a)) {
      return f;
    }
  }
  return-1;
};
goog.array.findRight = function(a, b, c) {
  b = goog.array.findIndexRight(a, b, c);
  return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b];
};
goog.array.findIndexRight = function(a, b, c) {
  for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1;0 <= d;d--) {
    if (d in e && b.call(c, e[d], d, a)) {
      return d;
    }
  }
  return-1;
};
goog.array.contains = function(a, b) {
  return 0 <= goog.array.indexOf(a, b);
};
goog.array.isEmpty = function(a) {
  return 0 == a.length;
};
goog.array.clear = function(a) {
  if (!goog.isArray(a)) {
    for (var b = a.length - 1;0 <= b;b--) {
      delete a[b];
    }
  }
  a.length = 0;
};
goog.array.insert = function(a, b) {
  goog.array.contains(a, b) || a.push(b);
};
goog.array.insertAt = function(a, b, c) {
  goog.array.splice(a, c, 0, b);
};
goog.array.insertArrayAt = function(a, b, c) {
  goog.partial(goog.array.splice, a, c, 0).apply(null, b);
};
goog.array.insertBefore = function(a, b, c) {
  var d;
  2 == arguments.length || 0 > (d = goog.array.indexOf(a, c)) ? a.push(b) : goog.array.insertAt(a, b, d);
};
goog.array.remove = function(a, b) {
  var c = goog.array.indexOf(a, b), d;
  (d = 0 <= c) && goog.array.removeAt(a, c);
  return d;
};
goog.array.removeAt = function(a, b) {
  goog.asserts.assert(null != a.length);
  return 1 == goog.array.ARRAY_PROTOTYPE_.splice.call(a, b, 1).length;
};
goog.array.removeIf = function(a, b, c) {
  b = goog.array.findIndex(a, b, c);
  return 0 <= b ? (goog.array.removeAt(a, b), !0) : !1;
};
goog.array.removeAllIf = function(a, b, c) {
  var d = 0;
  goog.array.forEachRight(a, function(e, f) {
    b.call(c, e, f, a) && goog.array.removeAt(a, f) && d++;
  });
  return d;
};
goog.array.concat = function(a) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments);
};
goog.array.join = function(a) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments);
};
goog.array.toArray = function(a) {
  var b = a.length;
  if (0 < b) {
    for (var c = Array(b), d = 0;d < b;d++) {
      c[d] = a[d];
    }
    return c;
  }
  return[];
};
goog.array.clone = goog.array.toArray;
goog.array.extend = function(a, b) {
  for (var c = 1;c < arguments.length;c++) {
    var d = arguments[c], e;
    if (goog.isArray(d) || (e = goog.isArrayLike(d)) && Object.prototype.hasOwnProperty.call(d, "callee")) {
      a.push.apply(a, d);
    } else {
      if (e) {
        for (var f = a.length, g = d.length, h = 0;h < g;h++) {
          a[f + h] = d[h];
        }
      } else {
        a.push(d);
      }
    }
  }
};
goog.array.splice = function(a, b, c, d) {
  goog.asserts.assert(null != a.length);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(a, goog.array.slice(arguments, 1));
};
goog.array.slice = function(a, b, c) {
  goog.asserts.assert(null != a.length);
  return 2 >= arguments.length ? goog.array.ARRAY_PROTOTYPE_.slice.call(a, b) : goog.array.ARRAY_PROTOTYPE_.slice.call(a, b, c);
};
goog.array.removeDuplicates = function(a, b, c) {
  b = b || a;
  var d = function(a) {
    return goog.isObject(g) ? "o" + goog.getUid(g) : (typeof g).charAt(0) + g;
  };
  c = c || d;
  for (var d = {}, e = 0, f = 0;f < a.length;) {
    var g = a[f++], h = c(g);
    Object.prototype.hasOwnProperty.call(d, h) || (d[h] = !0, b[e++] = g);
  }
  b.length = e;
};
goog.array.binarySearch = function(a, b, c) {
  return goog.array.binarySearch_(a, c || goog.array.defaultCompare, !1, b);
};
goog.array.binarySelect = function(a, b, c) {
  return goog.array.binarySearch_(a, b, !0, void 0, c);
};
goog.array.binarySearch_ = function(a, b, c, d, e) {
  for (var f = 0, g = a.length, h;f < g;) {
    var l = f + g >> 1, k;
    k = c ? b.call(e, a[l], l, a) : b(d, a[l]);
    0 < k ? f = l + 1 : (g = l, h = !k);
  }
  return h ? f : ~f;
};
goog.array.sort = function(a, b) {
  a.sort(b || goog.array.defaultCompare);
};
goog.array.stableSort = function(a, b) {
  for (var c = 0;c < a.length;c++) {
    a[c] = {index:c, value:a[c]};
  }
  var d = b || goog.array.defaultCompare;
  goog.array.sort(a, function(a, b) {
    return d(a.value, b.value) || a.index - b.index;
  });
  for (c = 0;c < a.length;c++) {
    a[c] = a[c].value;
  }
};
goog.array.sortByKey = function(a, b, c) {
  var d = c || goog.array.defaultCompare;
  goog.array.sort(a, function(a, c) {
    return d(b(a), b(c));
  });
};
goog.array.sortObjectsByKey = function(a, b, c) {
  goog.array.sortByKey(a, function(a) {
    return a[b];
  }, c);
};
goog.array.isSorted = function(a, b, c) {
  b = b || goog.array.defaultCompare;
  for (var d = 1;d < a.length;d++) {
    var e = b(a[d - 1], a[d]);
    if (0 < e || 0 == e && c) {
      return!1;
    }
  }
  return!0;
};
goog.array.equals = function(a, b, c) {
  if (!goog.isArrayLike(a) || !goog.isArrayLike(b) || a.length != b.length) {
    return!1;
  }
  var d = a.length;
  c = c || goog.array.defaultCompareEquality;
  for (var e = 0;e < d;e++) {
    if (!c(a[e], b[e])) {
      return!1;
    }
  }
  return!0;
};
goog.array.compare3 = function(a, b, c) {
  c = c || goog.array.defaultCompare;
  for (var d = Math.min(a.length, b.length), e = 0;e < d;e++) {
    var f = c(a[e], b[e]);
    if (0 != f) {
      return f;
    }
  }
  return goog.array.defaultCompare(a.length, b.length);
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};
goog.array.binaryInsert = function(a, b, c) {
  c = goog.array.binarySearch(a, b, c);
  return 0 > c ? (goog.array.insertAt(a, b, -(c + 1)), !0) : !1;
};
goog.array.binaryRemove = function(a, b, c) {
  b = goog.array.binarySearch(a, b, c);
  return 0 <= b ? goog.array.removeAt(a, b) : !1;
};
goog.array.bucket = function(a, b, c) {
  for (var d = {}, e = 0;e < a.length;e++) {
    var f = a[e], g = b.call(c, f, e, a);
    goog.isDef(g) && (d[g] || (d[g] = [])).push(f);
  }
  return d;
};
goog.array.toObject = function(a, b, c) {
  var d = {};
  goog.array.forEach(a, function(e, f) {
    d[b.call(c, e, f, a)] = e;
  });
  return d;
};
goog.array.range = function(a, b, c) {
  var d = [], e = 0, f = a;
  c = c || 1;
  void 0 !== b && (e = a, f = b);
  if (0 > c * (f - e)) {
    return[];
  }
  if (0 < c) {
    for (a = e;a < f;a += c) {
      d.push(a);
    }
  } else {
    for (a = e;a > f;a += c) {
      d.push(a);
    }
  }
  return d;
};
goog.array.repeat = function(a, b) {
  for (var c = [], d = 0;d < b;d++) {
    c[d] = a;
  }
  return c;
};
goog.array.flatten = function(a) {
  for (var b = [], c = 0;c < arguments.length;c++) {
    var d = arguments[c];
    goog.isArray(d) ? b.push.apply(b, goog.array.flatten.apply(null, d)) : b.push(d);
  }
  return b;
};
goog.array.rotate = function(a, b) {
  goog.asserts.assert(null != a.length);
  a.length && (b %= a.length, 0 < b ? goog.array.ARRAY_PROTOTYPE_.unshift.apply(a, a.splice(-b, b)) : 0 > b && goog.array.ARRAY_PROTOTYPE_.push.apply(a, a.splice(0, -b)));
  return a;
};
goog.array.moveItem = function(a, b, c) {
  goog.asserts.assert(0 <= b && b < a.length);
  goog.asserts.assert(0 <= c && c < a.length);
  b = goog.array.ARRAY_PROTOTYPE_.splice.call(a, b, 1);
  goog.array.ARRAY_PROTOTYPE_.splice.call(a, c, 0, b[0]);
};
goog.array.zip = function(a) {
  if (!arguments.length) {
    return[];
  }
  for (var b = [], c = 0;;c++) {
    for (var d = [], e = 0;e < arguments.length;e++) {
      var f = arguments[e];
      if (c >= f.length) {
        return b;
      }
      d.push(f[c]);
    }
    b.push(d);
  }
};
goog.array.shuffle = function(a, b) {
  for (var c = b || Math.random, d = a.length - 1;0 < d;d--) {
    var e = Math.floor(c() * (d + 1)), f = a[d];
    a[d] = a[e];
    a[e] = f;
  }
};
goog.object = {};
goog.object.forEach = function(a, b, c) {
  for (var d in a) {
    b.call(c, a[d], d, a);
  }
};
goog.object.filter = function(a, b, c) {
  var d = {}, e;
  for (e in a) {
    b.call(c, a[e], e, a) && (d[e] = a[e]);
  }
  return d;
};
goog.object.map = function(a, b, c) {
  var d = {}, e;
  for (e in a) {
    d[e] = b.call(c, a[e], e, a);
  }
  return d;
};
goog.object.some = function(a, b, c) {
  for (var d in a) {
    if (b.call(c, a[d], d, a)) {
      return!0;
    }
  }
  return!1;
};
goog.object.every = function(a, b, c) {
  for (var d in a) {
    if (!b.call(c, a[d], d, a)) {
      return!1;
    }
  }
  return!0;
};
goog.object.getCount = function(a) {
  var b = 0, c;
  for (c in a) {
    b++;
  }
  return b;
};
goog.object.getAnyKey = function(a) {
  for (var b in a) {
    return b;
  }
};
goog.object.getAnyValue = function(a) {
  for (var b in a) {
    return a[b];
  }
};
goog.object.contains = function(a, b) {
  return goog.object.containsValue(a, b);
};
goog.object.getValues = function(a) {
  var b = [], c = 0, d;
  for (d in a) {
    b[c++] = a[d];
  }
  return b;
};
goog.object.getKeys = function(a) {
  var b = [], c = 0, d;
  for (d in a) {
    b[c++] = d;
  }
  return b;
};
goog.object.getValueByKeys = function(a, b) {
  for (var c = goog.isArrayLike(b), d = c ? b : arguments, c = c ? 0 : 1;c < d.length && (a = a[d[c]], goog.isDef(a));c++) {
  }
  return a;
};
goog.object.containsKey = function(a, b) {
  return b in a;
};
goog.object.containsValue = function(a, b) {
  for (var c in a) {
    if (a[c] == b) {
      return!0;
    }
  }
  return!1;
};
goog.object.findKey = function(a, b, c) {
  for (var d in a) {
    if (b.call(c, a[d], d, a)) {
      return d;
    }
  }
};
goog.object.findValue = function(a, b, c) {
  return(b = goog.object.findKey(a, b, c)) && a[b];
};
goog.object.isEmpty = function(a) {
  for (var b in a) {
    return!1;
  }
  return!0;
};
goog.object.clear = function(a) {
  for (var b in a) {
    delete a[b];
  }
};
goog.object.remove = function(a, b) {
  var c;
  (c = b in a) && delete a[b];
  return c;
};
goog.object.add = function(a, b, c) {
  if (b in a) {
    throw Error('The object already contains the key "' + b + '"');
  }
  goog.object.set(a, b, c);
};
goog.object.get = function(a, b, c) {
  return b in a ? a[b] : c;
};
goog.object.set = function(a, b, c) {
  a[b] = c;
};
goog.object.setIfUndefined = function(a, b, c) {
  return b in a ? a[b] : a[b] = c;
};
goog.object.equals = function(a, b) {
  if (!goog.array.equals(goog.object.getKeys(a), goog.object.getKeys(b))) {
    return!1;
  }
  for (var c in a) {
    if (a[c] !== b[c]) {
      return!1;
    }
  }
  return!0;
};
goog.object.clone = function(a) {
  var b = {}, c;
  for (c in a) {
    b[c] = a[c];
  }
  return b;
};
goog.object.unsafeClone = function(a) {
  var b = goog.typeOf(a);
  if ("object" == b || "array" == b) {
    if (a.clone) {
      return a.clone();
    }
    var b = "array" == b ? [] : {}, c;
    for (c in a) {
      b[c] = goog.object.unsafeClone(a[c]);
    }
    return b;
  }
  return a;
};
goog.object.transpose = function(a) {
  var b = {}, c;
  for (c in a) {
    b[a[c]] = c;
  }
  return b;
};
goog.object.PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
goog.object.extend = function(a, b) {
  for (var c, d, e = 1;e < arguments.length;e++) {
    d = arguments[e];
    for (c in d) {
      a[c] = d[c];
    }
    for (var f = 0;f < goog.object.PROTOTYPE_FIELDS_.length;f++) {
      c = goog.object.PROTOTYPE_FIELDS_[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c]);
    }
  }
};
goog.object.create = function(a) {
  var b = arguments.length;
  if (1 == b && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }
  if (b % 2) {
    throw Error("Uneven number of arguments");
  }
  for (var c = {}, d = 0;d < b;d += 2) {
    c[arguments[d]] = arguments[d + 1];
  }
  return c;
};
goog.object.createSet = function(a) {
  var b = arguments.length;
  if (1 == b && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }
  for (var c = {}, d = 0;d < b;d++) {
    c[arguments[d]] = !0;
  }
  return c;
};
goog.object.createImmutableView = function(a) {
  var b = a;
  Object.isFrozen && !Object.isFrozen(a) && (b = Object.create(a), Object.freeze(b));
  return b;
};
goog.object.isImmutableView = function(a) {
  return!!Object.isFrozen && Object.isFrozen(a);
};
goog.math = {};
goog.math.Long = function(a, b) {
  this.low_ = a | 0;
  this.high_ = b | 0;
};
goog.math.Long.IntCache_ = {};
goog.math.Long.fromInt = function(a) {
  if (-128 <= a && 128 > a) {
    var b = goog.math.Long.IntCache_[a];
    if (b) {
      return b;
    }
  }
  b = new goog.math.Long(a | 0, 0 > a ? -1 : 0);
  -128 <= a && 128 > a && (goog.math.Long.IntCache_[a] = b);
  return b;
};
goog.math.Long.fromNumber = function(a) {
  return isNaN(a) || !isFinite(a) ? goog.math.Long.ZERO : a <= -goog.math.Long.TWO_PWR_63_DBL_ ? goog.math.Long.MIN_VALUE : a + 1 >= goog.math.Long.TWO_PWR_63_DBL_ ? goog.math.Long.MAX_VALUE : 0 > a ? goog.math.Long.fromNumber(-a).negate() : new goog.math.Long(a % goog.math.Long.TWO_PWR_32_DBL_ | 0, a / goog.math.Long.TWO_PWR_32_DBL_ | 0);
};
goog.math.Long.fromBits = function(a, b) {
  return new goog.math.Long(a, b);
};
goog.math.Long.fromString = function(a, b) {
  if (0 == a.length) {
    throw Error("number format error: empty string");
  }
  var c = b || 10;
  if (2 > c || 36 < c) {
    throw Error("radix out of range: " + c);
  }
  if ("-" == a.charAt(0)) {
    return goog.math.Long.fromString(a.substring(1), c).negate();
  }
  if (0 <= a.indexOf("-")) {
    throw Error('number format error: interior "-" character: ' + a);
  }
  for (var d = goog.math.Long.fromNumber(Math.pow(c, 8)), e = goog.math.Long.ZERO, f = 0;f < a.length;f += 8) {
    var g = Math.min(8, a.length - f), h = parseInt(a.substring(f, f + g), c);
    8 > g ? (g = goog.math.Long.fromNumber(Math.pow(c, g)), e = e.multiply(g).add(goog.math.Long.fromNumber(h))) : (e = e.multiply(d), e = e.add(goog.math.Long.fromNumber(h)));
  }
  return e;
};
goog.math.Long.TWO_PWR_16_DBL_ = 65536;
goog.math.Long.TWO_PWR_24_DBL_ = 16777216;
goog.math.Long.TWO_PWR_32_DBL_ = goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
goog.math.Long.TWO_PWR_31_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ / 2;
goog.math.Long.TWO_PWR_48_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
goog.math.Long.TWO_PWR_64_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
goog.math.Long.TWO_PWR_63_DBL_ = goog.math.Long.TWO_PWR_64_DBL_ / 2;
goog.math.Long.ZERO = goog.math.Long.fromInt(0);
goog.math.Long.ONE = goog.math.Long.fromInt(1);
goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
goog.math.Long.MAX_VALUE = goog.math.Long.fromBits(-1, 2147483647);
goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, -2147483648);
goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(16777216);
goog.math.Long.prototype.toInt = function() {
  return this.low_;
};
goog.math.Long.prototype.toNumber = function() {
  return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ + this.getLowBitsUnsigned();
};
goog.math.Long.prototype.toString = function(a) {
  a = a || 10;
  if (2 > a || 36 < a) {
    throw Error("radix out of range: " + a);
  }
  if (this.isZero()) {
    return "0";
  }
  if (this.isNegative()) {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      var b = goog.math.Long.fromNumber(a), c = this.div(b), b = c.multiply(b).subtract(this);
      return c.toString(a) + b.toInt().toString(a);
    }
    return "-" + this.negate().toString(a);
  }
  for (var c = goog.math.Long.fromNumber(Math.pow(a, 6)), b = this, d = "";;) {
    var e = b.div(c), f = b.subtract(e.multiply(c)).toInt().toString(a), b = e;
    if (b.isZero()) {
      return f + d;
    }
    for (;6 > f.length;) {
      f = "0" + f;
    }
    d = "" + f + d;
  }
};
goog.math.Long.prototype.getHighBits = function() {
  return this.high_;
};
goog.math.Long.prototype.getLowBits = function() {
  return this.low_;
};
goog.math.Long.prototype.getLowBitsUnsigned = function() {
  return 0 <= this.low_ ? this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
};
goog.math.Long.prototype.getNumBitsAbs = function() {
  if (this.isNegative()) {
    return this.equals(goog.math.Long.MIN_VALUE) ? 64 : this.negate().getNumBitsAbs();
  }
  for (var a = 0 != this.high_ ? this.high_ : this.low_, b = 31;0 < b && 0 == (a & 1 << b);b--) {
  }
  return 0 != this.high_ ? b + 33 : b + 1;
};
goog.math.Long.prototype.isZero = function() {
  return 0 == this.high_ && 0 == this.low_;
};
goog.math.Long.prototype.isNegative = function() {
  return 0 > this.high_;
};
goog.math.Long.prototype.isOdd = function() {
  return 1 == (this.low_ & 1);
};
goog.math.Long.prototype.equals = function(a) {
  return this.high_ == a.high_ && this.low_ == a.low_;
};
goog.math.Long.prototype.notEquals = function(a) {
  return this.high_ != a.high_ || this.low_ != a.low_;
};
goog.math.Long.prototype.lessThan = function(a) {
  return 0 > this.compare(a);
};
goog.math.Long.prototype.lessThanOrEqual = function(a) {
  return 0 >= this.compare(a);
};
goog.math.Long.prototype.greaterThan = function(a) {
  return 0 < this.compare(a);
};
goog.math.Long.prototype.greaterThanOrEqual = function(a) {
  return 0 <= this.compare(a);
};
goog.math.Long.prototype.compare = function(a) {
  if (this.equals(a)) {
    return 0;
  }
  var b = this.isNegative(), c = a.isNegative();
  return b && !c ? -1 : !b && c ? 1 : this.subtract(a).isNegative() ? -1 : 1;
};
goog.math.Long.prototype.negate = function() {
  return this.equals(goog.math.Long.MIN_VALUE) ? goog.math.Long.MIN_VALUE : this.not().add(goog.math.Long.ONE);
};
goog.math.Long.prototype.add = function(a) {
  var b = this.high_ >>> 16, c = this.high_ & 65535, d = this.low_ >>> 16, e = a.high_ >>> 16, f = a.high_ & 65535, g = a.low_ >>> 16, h;
  h = 0 + ((this.low_ & 65535) + (a.low_ & 65535));
  a = 0 + (h >>> 16);
  a += d + g;
  d = 0 + (a >>> 16);
  d += c + f;
  c = 0 + (d >>> 16);
  c = c + (b + e) & 65535;
  return goog.math.Long.fromBits((a & 65535) << 16 | h & 65535, c << 16 | d & 65535);
};
goog.math.Long.prototype.subtract = function(a) {
  return this.add(a.negate());
};
goog.math.Long.prototype.multiply = function(a) {
  if (this.isZero() || a.isZero()) {
    return goog.math.Long.ZERO;
  }
  if (this.equals(goog.math.Long.MIN_VALUE)) {
    return a.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
  }
  if (a.equals(goog.math.Long.MIN_VALUE)) {
    return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
  }
  if (this.isNegative()) {
    return a.isNegative() ? this.negate().multiply(a.negate()) : this.negate().multiply(a).negate();
  }
  if (a.isNegative()) {
    return this.multiply(a.negate()).negate();
  }
  if (this.lessThan(goog.math.Long.TWO_PWR_24_) && a.lessThan(goog.math.Long.TWO_PWR_24_)) {
    return goog.math.Long.fromNumber(this.toNumber() * a.toNumber());
  }
  var b = this.high_ >>> 16, c = this.high_ & 65535, d = this.low_ >>> 16, e = this.low_ & 65535, f = a.high_ >>> 16, g = a.high_ & 65535, h = a.low_ >>> 16;
  a = a.low_ & 65535;
  var l, k, m, n;
  n = 0 + e * a;
  m = 0 + (n >>> 16);
  m += d * a;
  k = 0 + (m >>> 16);
  m = (m & 65535) + e * h;
  k += m >>> 16;
  m &= 65535;
  k += c * a;
  l = 0 + (k >>> 16);
  k = (k & 65535) + d * h;
  l += k >>> 16;
  k &= 65535;
  k += e * g;
  l += k >>> 16;
  k &= 65535;
  l = l + (b * a + c * h + d * g + e * f) & 65535;
  return goog.math.Long.fromBits(m << 16 | n & 65535, l << 16 | k);
};
goog.math.Long.prototype.div = function(a) {
  if (a.isZero()) {
    throw Error("division by zero");
  }
  if (this.isZero()) {
    return goog.math.Long.ZERO;
  }
  if (this.equals(goog.math.Long.MIN_VALUE)) {
    if (a.equals(goog.math.Long.ONE) || a.equals(goog.math.Long.NEG_ONE)) {
      return goog.math.Long.MIN_VALUE;
    }
    if (a.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ONE;
    }
    var b = this.shiftRight(1).div(a).shiftLeft(1);
    if (b.equals(goog.math.Long.ZERO)) {
      return a.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
    }
    var c = this.subtract(a.multiply(b));
    return b.add(c.div(a));
  }
  if (a.equals(goog.math.Long.MIN_VALUE)) {
    return goog.math.Long.ZERO;
  }
  if (this.isNegative()) {
    return a.isNegative() ? this.negate().div(a.negate()) : this.negate().div(a).negate();
  }
  if (a.isNegative()) {
    return this.div(a.negate()).negate();
  }
  for (var d = goog.math.Long.ZERO, c = this;c.greaterThanOrEqual(a);) {
    for (var b = Math.max(1, Math.floor(c.toNumber() / a.toNumber())), e = Math.ceil(Math.log(b) / Math.LN2), e = 48 >= e ? 1 : Math.pow(2, e - 48), f = goog.math.Long.fromNumber(b), g = f.multiply(a);g.isNegative() || g.greaterThan(c);) {
      b -= e, f = goog.math.Long.fromNumber(b), g = f.multiply(a);
    }
    f.isZero() && (f = goog.math.Long.ONE);
    d = d.add(f);
    c = c.subtract(g);
  }
  return d;
};
goog.math.Long.prototype.modulo = function(a) {
  return this.subtract(this.div(a).multiply(a));
};
goog.math.Long.prototype.not = function() {
  return goog.math.Long.fromBits(~this.low_, ~this.high_);
};
goog.math.Long.prototype.and = function(a) {
  return goog.math.Long.fromBits(this.low_ & a.low_, this.high_ & a.high_);
};
goog.math.Long.prototype.or = function(a) {
  return goog.math.Long.fromBits(this.low_ | a.low_, this.high_ | a.high_);
};
goog.math.Long.prototype.xor = function(a) {
  return goog.math.Long.fromBits(this.low_ ^ a.low_, this.high_ ^ a.high_);
};
goog.math.Long.prototype.shiftLeft = function(a) {
  a &= 63;
  if (0 == a) {
    return this;
  }
  var b = this.low_;
  return 32 > a ? goog.math.Long.fromBits(b << a, this.high_ << a | b >>> 32 - a) : goog.math.Long.fromBits(0, b << a - 32);
};
goog.math.Long.prototype.shiftRight = function(a) {
  a &= 63;
  if (0 == a) {
    return this;
  }
  var b = this.high_;
  return 32 > a ? goog.math.Long.fromBits(this.low_ >>> a | b << 32 - a, b >> a) : goog.math.Long.fromBits(b >> a - 32, 0 <= b ? 0 : -1);
};
goog.math.Long.prototype.shiftRightUnsigned = function(a) {
  a &= 63;
  if (0 == a) {
    return this;
  }
  var b = this.high_;
  return 32 > a ? goog.math.Long.fromBits(this.low_ >>> a | b << 32 - a, b >>> a) : 32 == a ? goog.math.Long.fromBits(b, 0) : goog.math.Long.fromBits(b >>> a - 32, 0);
};
var com = {cognitect:{}};
com.cognitect.transit = {};
com.cognitect.transit.util = {};
com.cognitect.transit.util.objectKeys = "undefined" != typeof Object.keys ? function(a) {
  return Object.keys(a);
} : function(a) {
  return goog.object.getKeys(a);
};
com.cognitect.transit.util.isArray = "undefined" != typeof Array.isArray ? function(a) {
  return Array.isArray(a);
} : function(a) {
  return "array" === goog.typeOf(a);
};
com.cognitect.transit.util.randInt = function(a) {
  return Math.round(Math.random() * a);
};
com.cognitect.transit.util.randHex = function() {
  return com.cognitect.transit.util.randInt(15).toString(16);
};
com.cognitect.transit.util.randomUUID = function() {
  var a = (8 | 3 & com.cognitect.transit.util.randInt(14)).toString(16);
  return com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + "-" + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + "-4" + com.cognitect.transit.util.randHex() + 
  com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + "-" + a + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + "-" + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + 
  com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex() + com.cognitect.transit.util.randHex();
};
com.cognitect.transit.delimiters = {};
com.cognitect.transit.delimiters.ESC = "~";
com.cognitect.transit.delimiters.TAG = "#";
com.cognitect.transit.delimiters.SUB = "^";
com.cognitect.transit.delimiters.RES = "`";
com.cognitect.transit.delimiters.ESC_TAG = "~#";
com.cognitect.transit.eq = {};
com.cognitect.transit.eq.hashCodeProperty = "transit$hashCode$";
com.cognitect.transit.eq.hashCodeCounter = 1;
com.cognitect.transit.eq.equals = function(a, b) {
  if (null == a) {
    return null == b;
  }
  if (a === b) {
    return!0;
  }
  if ("object" === typeof a) {
    if (com.cognitect.transit.util.isArray(a)) {
      if (com.cognitect.transit.util.isArray(b) && a.length === b.length) {
        for (var c = 0;c < a.length;c++) {
          if (!com.cognitect.transit.eq.equals(a[c], b[c])) {
            return!1;
          }
        }
        return!0;
      }
      return!1;
    }
    if (a.com$cognitect$transit$equals) {
      return a.com$cognitect$transit$equals(b);
    }
    if (null != b && "object" === typeof b) {
      if (b.com$cognitect$transit$equals) {
        return b.com$cognitect$transit$equals(a);
      }
      var c = 0, d = com.cognitect.transit.util.objectKeys(b).length, e;
      for (e in a) {
        if (a.hasOwnProperty(e) && (c++, !b.hasOwnProperty(e) || !com.cognitect.transit.eq.equals(a[e], b[e]))) {
          return!1;
        }
      }
      return c === d;
    }
  }
  return!1;
};
com.cognitect.transit.eq.hashCombine = function(a, b) {
  return a ^ b + 2654435769 + (a << 6) + (a >> 2);
};
com.cognitect.transit.eq.stringCodeCache = {};
com.cognitect.transit.eq.stringCodeCacheSize = 0;
com.cognitect.transit.eq.STR_CACHE_MAX = 256;
com.cognitect.transit.eq.hashString = function(a) {
  var b = com.cognitect.transit.eq.stringCodeCache[a];
  if (null != b) {
    return b;
  }
  for (var c = b = 0;c < a.length;++c) {
    b = 31 * b + a.charCodeAt(c), b %= 4294967296;
  }
  com.cognitect.transit.eq.stringCodeCacheSize++;
  com.cognitect.transit.eq.stringCodeCacheSize >= com.cognitect.transit.eq.STR_CACHE_MAX && (com.cognitect.transit.eq.stringCodeCache = {}, com.cognitect.transit.eq.stringCodeCacheSize = 1);
  return com.cognitect.transit.eq.stringCodeCache[a] = b;
};
com.cognitect.transit.eq.hashMapLike = function(a) {
  var b = 0;
  if (null != a.forEach) {
    a.forEach(function(a, c, d) {
      b = (b + (com.cognitect.transit.eq.hashCode(c) ^ com.cognitect.transit.eq.hashCode(a))) % 4503599627370496;
    });
  } else {
    for (var c = com.cognitect.transit.util.objectKeys(a), d = 0;d < c.length;d++) {
      var e = c[d], f = a[e], b = (b + (com.cognitect.transit.eq.hashCode(e) ^ com.cognitect.transit.eq.hashCode(f))) % 4503599627370496
    }
  }
  return b;
};
com.cognitect.transit.eq.hashArrayLike = function(a) {
  var b = 0;
  if (com.cognitect.transit.util.isArray(a)) {
    for (var c = 0;c < a.length;c++) {
      b = com.cognitect.transit.eq.hashCombine(b, com.cognitect.transit.eq.hashCode(a[c]));
    }
  } else {
    a.forEach && a.forEach(function(a, c) {
      b = com.cognitect.transit.eq.hashCombine(b, com.cognitect.transit.eq.hashCode(a));
    });
  }
  return b;
};
com.cognitect.transit.eq.hashCode = function(a) {
  if (null == a) {
    return 0;
  }
  switch(typeof a) {
    case "number":
      return a;
    case "boolean":
      return!0 === a ? 1 : 0;
    case "string":
      return com.cognitect.transit.eq.hashString(a);
    case "function":
      var b = a[com.cognitect.transit.eq.hashCodeProperty];
      b || (b = com.cognitect.transit.eq.hashCodeCounter, "undefined" != typeof Object.defineProperty ? Object.defineProperty(a, com.cognitect.transit.eq.hashCodeProperty, {value:b, enumerable:!1}) : a[com.cognitect.transit.eq.hashCodeProperty] = b, com.cognitect.transit.eq.hashCodeCounter++);
      return b;
    default:
      return a instanceof Date ? a.valueOf() : com.cognitect.transit.util.isArray(a) ? com.cognitect.transit.eq.hashArrayLike(a) : a.com$cognitect$transit$hashCode ? a.com$cognitect$transit$hashCode() : com.cognitect.transit.eq.hashMapLike(a);
  }
};
com.cognitect.transit.eq.extendToEQ = function(a, b) {
  a.com$cognitect$transit$hashCode = b.hashCode;
  a.com$cognitect$transit$equals = b.equals;
  return a;
};
com.cognitect.transit.types = {};
com.cognitect.transit.types.TaggedValue = function(a, b) {
  this.tag = a;
  this.rep = b;
  this.hashCode = -1;
};
com.cognitect.transit.types.TaggedValue.prototype.toString = function() {
  return "[TaggedValue: " + this.tag + ", " + this.rep + "]";
};
com.cognitect.transit.types.TaggedValue.prototype.equiv = function(a) {
  return com.cognitect.transit.eq.equals(this, a);
};
com.cognitect.transit.types.TaggedValue.prototype.equiv = com.cognitect.transit.types.TaggedValue.prototype.equiv;
com.cognitect.transit.types.TaggedValue.prototype.com$cognitect$transit$equals = function(a) {
  return a instanceof com.cognitect.transit.types.TaggedValue ? this.tag === a.tag && com.cognitect.transit.eq.equals(this.rep, a.rep) : !1;
};
com.cognitect.transit.types.TaggedValue.prototype.com$cognitect$transit$hashCode = function() {
  -1 === this.hashCode && (this.hashCode = com.cognitect.transit.eq.hashCombine(com.cognitect.transit.eq.hashCode(this.tag), com.cognitect.transit.eq.hashCode(this.rep)));
  return this.hashCode;
};
com.cognitect.transit.types.taggedValue = function(a, b) {
  return new com.cognitect.transit.types.TaggedValue(a, b);
};
com.cognitect.transit.types.isTaggedValue = function(a) {
  return a instanceof com.cognitect.transit.types.TaggedValue;
};
com.cognitect.transit.types.nullValue = function() {
  return null;
};
com.cognitect.transit.types.boolValue = function(a) {
  return "t" === a;
};
com.cognitect.transit.types.MAX_INT = goog.math.Long.fromString("9007199254740992");
com.cognitect.transit.types.MIN_INT = goog.math.Long.fromString("-9007199254740992");
com.cognitect.transit.types.intValue = function(a) {
  if ("number" === typeof a || a instanceof goog.math.Long) {
    return a;
  }
  a = goog.math.Long.fromString(a, 10);
  return a.greaterThan(com.cognitect.transit.types.MAX_INT) || a.lessThan(com.cognitect.transit.types.MIN_INT) ? a : a.toNumber();
};
goog.math.Long.prototype.equiv = function(a) {
  return com.cognitect.transit.eq.equals(this, a);
};
goog.math.Long.prototype.equiv = goog.math.Long.prototype.equiv;
goog.math.Long.prototype.com$cognitect$transit$equals = function(a) {
  return a instanceof goog.math.Long && this.equals(a);
};
goog.math.Long.prototype.com$cognitect$transit$hashCode = function() {
  return this.toInt();
};
com.cognitect.transit.types.isInteger = function(a) {
  return a instanceof goog.math.Long ? !0 : "number" === typeof a && !isNaN(a) && Infinity !== a && parseFloat(a) === parseInt(a);
};
com.cognitect.transit.types.floatValue = function(a) {
  return parseFloat(a);
};
com.cognitect.transit.types.bigInteger = function(a) {
  return com.cognitect.transit.types.taggedValue("n", a);
};
com.cognitect.transit.types.isBigInteger = function(a) {
  return a instanceof com.cognitect.transit.types.TaggedValue && "n" === a.tag;
};
com.cognitect.transit.types.bigDecimalValue = function(a) {
  return com.cognitect.transit.types.taggedValue("f", a);
};
com.cognitect.transit.types.isBigDecimal = function(a) {
  return a instanceof com.cognitect.transit.types.TaggedValue && "f" === a.tag;
};
com.cognitect.transit.types.charValue = function(a) {
  return a;
};
com.cognitect.transit.types.Keyword = function(a) {
  this.name = a;
  this.hashCode = -1;
};
com.cognitect.transit.types.Keyword.prototype.toString = function() {
  return ":" + this.name;
};
com.cognitect.transit.types.Keyword.prototype.equiv = function(a) {
  return com.cognitect.transit.eq.equals(this, a);
};
com.cognitect.transit.types.Keyword.prototype.equiv = com.cognitect.transit.types.Keyword.prototype.equiv;
com.cognitect.transit.types.Keyword.prototype.com$cognitect$transit$equals = function(a) {
  return a instanceof com.cognitect.transit.types.Keyword && this.name == a.name;
};
com.cognitect.transit.types.Keyword.prototype.com$cognitect$transit$hashCode = function() {
  -1 === this.hashCode && (this.hashCode = com.cognitect.transit.eq.hashCode(this.name));
  return this.hashCode;
};
com.cognitect.transit.types.keyword = function(a) {
  return new com.cognitect.transit.types.Keyword(a);
};
com.cognitect.transit.types.isKeyword = function(a) {
  return a instanceof com.cognitect.transit.types.Keyword;
};
com.cognitect.transit.types.Symbol = function(a) {
  this.name = a;
  this.hashCode = -1;
};
com.cognitect.transit.types.Symbol.prototype.toString = function() {
  return "[Symbol: " + this.name + "]";
};
com.cognitect.transit.types.Symbol.prototype.equiv = function(a) {
  return com.cognitect.transit.eq.equals(this, a);
};
com.cognitect.transit.types.Symbol.prototype.equiv = com.cognitect.transit.types.Symbol.prototype.equiv;
com.cognitect.transit.types.Symbol.prototype.com$cognitect$transit$equals = function(a) {
  return a instanceof com.cognitect.transit.types.Symbol && this.name == a.name;
};
com.cognitect.transit.types.Symbol.prototype.com$cognitect$transit$hashCode = function() {
  -1 === this.hashCode && (this.hashCode = com.cognitect.transit.eq.hashCode(this.name));
  return this.hashCode;
};
com.cognitect.transit.types.symbol = function(a) {
  return new com.cognitect.transit.types.Symbol(a);
};
com.cognitect.transit.types.isSymbol = function(a) {
  return a instanceof com.cognitect.transit.types.Symbol;
};
com.cognitect.transit.types.hexFor = function(a, b, c) {
  var d = "";
  c = c || b + 1;
  for (var e = 8 * (7 - b), f = goog.math.Long.fromInt(255).shiftLeft(e);b < c;b++, e -= 8, f = f.shiftRightUnsigned(8)) {
    var g = a.and(f).shiftRightUnsigned(e).toString(16);
    1 == g.length && (g = "0" + g);
    d += g;
  }
  return d;
};
com.cognitect.transit.types.UUID = function(a, b) {
  this.high = a;
  this.low = b;
  this.hashCode = -1;
};
com.cognitect.transit.types.UUID.prototype.getLeastSignificantBits = function() {
  return this.low;
};
com.cognitect.transit.types.UUID.prototype.getMostSignificantBits = function() {
  return this.high;
};
com.cognitect.transit.types.UUID.prototype.toString = function(a) {
  var b = this.high, c = this.low;
  a = "" + (com.cognitect.transit.types.hexFor(b, 0, 4) + "-");
  a += com.cognitect.transit.types.hexFor(b, 4, 6) + "-";
  a += com.cognitect.transit.types.hexFor(b, 6, 8) + "-";
  a += com.cognitect.transit.types.hexFor(c, 0, 2) + "-";
  return a += com.cognitect.transit.types.hexFor(c, 2, 8);
};
com.cognitect.transit.types.UUID.prototype.equiv = function(a) {
  return com.cognitect.transit.eq.equals(this, a);
};
com.cognitect.transit.types.UUID.prototype.equiv = com.cognitect.transit.types.UUID.prototype.equiv;
com.cognitect.transit.types.UUID.prototype.com$cognitect$transit$equals = function(a) {
  return a instanceof com.cognitect.transit.types.UUID && this.high.equals(a.high) && this.low.equals(a.low);
};
com.cognitect.transit.types.UUID.prototype.com$cognitect$transit$hashCode = function() {
  -1 === this.hashCode && (this.hashCode = com.cognitect.transit.eq.hashCode(this.toString()));
  return this.hashCode;
};
com.cognitect.transit.types.UUIDfromString = function(a) {
  a = a.replace(/-/g, "");
  for (var b = null, c = null, d = c = 0, e = 24, f = 0, f = c = 0, e = 24;8 > f;f += 2, e -= 8) {
    c |= parseInt(a.substring(f, f + 2), 16) << e;
  }
  d = 0;
  f = 8;
  for (e = 24;16 > f;f += 2, e -= 8) {
    d |= parseInt(a.substring(f, f + 2), 16) << e;
  }
  b = goog.math.Long.fromBits(d, c);
  c = 0;
  f = 16;
  for (e = 24;24 > f;f += 2, e -= 8) {
    c |= parseInt(a.substring(f, f + 2), 16) << e;
  }
  d = 0;
  for (e = f = 24;32 > f;f += 2, e -= 8) {
    d |= parseInt(a.substring(f, f + 2), 16) << e;
  }
  c = goog.math.Long.fromBits(d, c);
  return new com.cognitect.transit.types.UUID(b, c);
};
com.cognitect.transit.types.uuid = function(a) {
  return com.cognitect.transit.types.UUIDfromString(a);
};
com.cognitect.transit.types.isUUID = function(a) {
  return a instanceof com.cognitect.transit.types.UUID;
};
com.cognitect.transit.types.date = function(a) {
  a = "number" === typeof a ? a : parseInt(a, 10);
  return new Date(a);
};
com.cognitect.transit.types.verboseDate = function(a) {
  return new Date(a);
};
Date.prototype.com$cognitect$transit$equals = function(a) {
  return a instanceof Date ? this.valueOf() === a.valueOf() : !1;
};
Date.prototype.com$cognitect$transit$hashCode = function() {
  return this.valueOf();
};
com.cognitect.transit.types.binary = function(a) {
  return com.cognitect.transit.types.taggedValue("b", a);
};
com.cognitect.transit.types.isBinary = function(a) {
  return a instanceof com.cognitect.transit.types.TaggedValue && "b" === a.tag;
};
com.cognitect.transit.types.uri = function(a) {
  return com.cognitect.transit.types.taggedValue("r", a);
};
com.cognitect.transit.types.isURI = function(a) {
  return a instanceof com.cognitect.transit.types.TaggedValue && "r" === a.tag;
};
com.cognitect.transit.types.KEYS = 0;
com.cognitect.transit.types.VALUES = 1;
com.cognitect.transit.types.ENTRIES = 2;
com.cognitect.transit.types.TransitArrayMapIterator = function(a, b) {
  this.entries = a;
  this.type = b || com.cognitect.transit.types.KEYS;
  this.idx = 0;
};
com.cognitect.transit.types.TransitArrayMapIterator.prototype.next = function(a, b) {
  if (this.idx < this.entries.length) {
    var c = null, c = this.type === com.cognitect.transit.types.KEYS ? this.entries[this.idx] : this.type === com.cognitect.transit.types.VALUES ? this.entries[this.idx + 1] : [this.entries[this.idx], this.entries[this.idx + 1]], c = {value:c, done:!1};
    this.idx += 2;
    return c;
  }
  return{value:null, done:!0};
};
com.cognitect.transit.types.TransitArrayMapIterator.prototype.next = com.cognitect.transit.types.TransitArrayMapIterator.prototype.next;
com.cognitect.transit.types.TransitMapIterator = function(a, b) {
  this.map = a;
  this.type = b || com.cognitect.transit.types.KEYS;
  this.keys = this.map.getKeys();
  this.idx = 0;
  this.bucket = null;
  this.bucketIdx = 0;
};
com.cognitect.transit.types.TransitMapIterator.prototype.next = function() {
  if (this.idx < this.map.size) {
    null != this.bucket && this.bucketIdx < this.bucket.length || (this.bucket = this.map.map[this.keys[this.idx]], this.bucketIdx = 0);
    var a = null, a = this.type === com.cognitect.transit.types.KEYS ? this.bucket[this.bucketIdx] : this.type === com.cognitect.transit.types.VALUES ? this.bucket[this.bucketIdx + 1] : [this.bucket[this.bucketIdx], this.bucket[this.bucketIdx + 1]], a = {value:a, done:!1};
    this.idx++;
    this.bucketIdx += 2;
    return a;
  }
  return{value:null, done:!0};
};
com.cognitect.transit.types.TransitMapIterator.prototype.next = com.cognitect.transit.types.TransitMapIterator.prototype.next;
com.cognitect.transit.types.mapEquals = function(a, b) {
  if ((b instanceof com.cognitect.transit.types.TransitMap || b instanceof com.cognitect.transit.types.TransitArrayMap) && a.size === b.size) {
    for (var c in a.map) {
      for (var d = a.map[c], e = 0;e < d.length;e += 2) {
        if (!com.cognitect.transit.eq.equals(d[e + 1], b.get(d[e]))) {
          return!1;
        }
      }
    }
    return!0;
  }
  if (null != b && "object" === typeof b && (c = com.cognitect.transit.util.objectKeys(b), d = c.length, a.size === d)) {
    for (e = 0;e < d;e++) {
      var f = c[e];
      if (!a.has(f) || !com.cognitect.transit.eq.equals(b[f], a.get(f))) {
        return!1;
      }
    }
    return!0;
  }
  return!1;
};
com.cognitect.transit.types.SMALL_ARRAY_MAP_THRESHOLD = 8;
com.cognitect.transit.types.ARRAY_MAP_THRESHOLD = 32;
com.cognitect.transit.types.ARRAY_MAP_ACCESS_THRESHOLD = 32;
com.cognitect.transit.types.TransitArrayMap = function(a) {
  this._entries = a;
  this.backingMap = null;
  this.hashCode = -1;
  this.size = a.length / 2;
  this.accesses = 0;
};
com.cognitect.transit.types.TransitArrayMap.prototype.toString = function() {
  return "[TransitArrayMap]";
};
com.cognitect.transit.types.TransitArrayMap.prototype.convert = function() {
  if (this.backingMap) {
    throw Error("Invalid operation, already converted");
  }
  if (this.size < com.cognitect.transit.types.SMALL_ARRAY_MAP_THRESHOLD) {
    return!1;
  }
  this.accesses++;
  return this.accesses > com.cognitect.transit.types.ARRAY_MAP_ACCESS_THRESHOLD ? (this.backingMap = com.cognitect.transit.types.map(this._entries, !1, !0), this._entries = [], !0) : !1;
};
com.cognitect.transit.types.TransitArrayMap.prototype.clear = function() {
  this.hashCode = -1;
  this.backingMap ? this.backingMap.clear() : this._entries = [];
  this.size = 0;
};
com.cognitect.transit.types.TransitArrayMap.prototype.clear = com.cognitect.transit.types.TransitArrayMap.prototype.clear;
com.cognitect.transit.types.TransitArrayMap.prototype.keys = function() {
  return this.backingMap ? this.backingMap.keys() : new com.cognitect.transit.types.TransitArrayMapIterator(this._entries, com.cognitect.transit.types.KEYS);
};
com.cognitect.transit.types.TransitArrayMap.prototype.keys = com.cognitect.transit.types.TransitArrayMap.prototype.keys;
com.cognitect.transit.types.TransitArrayMap.prototype.keySet = function() {
  if (this.backingMap) {
    return this.backingMap.keySet();
  }
  for (var a = [], b = 0, c = 0;c < this._entries.length;b++, c += 2) {
    a[b] = this._entries[c];
  }
  return a;
};
com.cognitect.transit.types.TransitArrayMap.prototype.keySet = com.cognitect.transit.types.TransitArrayMap.prototype.keySet;
com.cognitect.transit.types.TransitArrayMap.prototype.entries = function() {
  return this.backingMap ? this.backingMap.entries() : new com.cognitect.transit.types.TransitArrayMapIterator(this._entries, com.cognitect.transit.types.ENTRIES);
};
com.cognitect.transit.types.TransitArrayMap.prototype.entries = com.cognitect.transit.types.TransitArrayMap.prototype.entries;
com.cognitect.transit.types.TransitArrayMap.prototype.values = function() {
  return this.backingMap ? this.backingMap.values() : new com.cognitect.transit.types.TransitArrayMapIterator(this._entries, com.cognitect.transit.types.VALUES);
};
com.cognitect.transit.types.TransitArrayMap.prototype.values = com.cognitect.transit.types.TransitArrayMap.prototype.values;
com.cognitect.transit.types.TransitArrayMap.prototype.forEach = function(a) {
  if (this.backingMap) {
    this.backingMap.forEach(a);
  } else {
    for (var b = 0;b < this._entries.length;b += 2) {
      a(this._entries[b + 1], this._entries[b]);
    }
  }
};
com.cognitect.transit.types.TransitArrayMap.prototype.forEach = com.cognitect.transit.types.TransitArrayMap.prototype.forEach;
com.cognitect.transit.types.TransitArrayMap.prototype.get = function(a, b) {
  if (this.backingMap) {
    return this.backingMap.get(a);
  }
  if (this.convert()) {
    return this.get(a);
  }
  for (var c = 0;c < this._entries.length;c += 2) {
    if (com.cognitect.transit.eq.equals(this._entries[c], a)) {
      return this._entries[c + 1];
    }
  }
  return b;
};
com.cognitect.transit.types.TransitArrayMap.prototype.get = com.cognitect.transit.types.TransitArrayMap.prototype.get;
com.cognitect.transit.types.TransitArrayMap.prototype.has = function(a) {
  if (this.backingMap) {
    return this.backingMap.has(a);
  }
  if (this.convert()) {
    return this.has(a);
  }
  for (var b = 0;b < this._entries.length;b += 2) {
    if (com.cognitect.transit.eq.equals(this._entries[b], a)) {
      return!0;
    }
  }
  return!1;
};
com.cognitect.transit.types.TransitArrayMap.prototype.has = com.cognitect.transit.types.TransitArrayMap.prototype.has;
com.cognitect.transit.types.TransitArrayMap.prototype.set = function(a, b) {
  this.hashCode = -1;
  if (this.backingMap) {
    this.backingMap.set(a, b), this.size = this.backingMap.size;
  } else {
    for (var c = 0;c < this._entries.length;c += 2) {
      if (com.cognitect.transit.eq.equals(this._entries[c], a)) {
        this._entries[c + 1] = b;
        return;
      }
    }
    this._entries.push(a);
    this._entries.push(b);
    this.size++;
    this.size > com.cognitect.transit.types.ARRAY_MAP_THRESHOLD && (this.backingMap = com.cognitect.transit.types.map(this._entries, !1, !0), this._entries = null);
  }
};
com.cognitect.transit.types.TransitArrayMap.prototype.set = com.cognitect.transit.types.TransitArrayMap.prototype.set;
com.cognitect.transit.types.TransitArrayMap.prototype["delete"] = function(a) {
  this.hashCode = -1;
  if (this.backingMap) {
    this.backingMap["delete"](a), this.size = this.backingMap.size;
  } else {
    for (var b = 0;b < this._entries.length;b += 2) {
      if (com.cognitect.transit.eq.equals(this._entries[b], a)) {
        this._entries.splice(b, 2);
        this.size--;
        break;
      }
    }
  }
};
com.cognitect.transit.types.TransitArrayMap.prototype.com$cognitect$transit$hashCode = function() {
  if (this.backingMap) {
    return this.backingMap.com$cognitect$transit$hashCode();
  }
  -1 === this.hashCode && (this.hashCode = com.cognitect.transit.eq.hashMapLike(this));
  return this.hashCode;
};
com.cognitect.transit.types.TransitArrayMap.prototype.com$cognitect$transit$equals = function(a) {
  return this.backingMap ? com.cognitect.transit.types.mapEquals(this.backingMap, a) : com.cognitect.transit.types.mapEquals(this, a);
};
com.cognitect.transit.types.TransitMap = function(a, b, c) {
  this.map = b || {};
  this._keys = a || [];
  this.size = c || 0;
  this.hashCode = -1;
};
com.cognitect.transit.types.TransitMap.prototype.toString = function() {
  return "[TransitMap]";
};
com.cognitect.transit.types.TransitMap.prototype.clear = function() {
  this.hashCode = -1;
  this.map = {};
  this._keys = [];
  this.size = 0;
};
com.cognitect.transit.types.TransitMap.prototype.clear = com.cognitect.transit.types.TransitMap.prototype.clear;
com.cognitect.transit.types.TransitMap.prototype.getKeys = function() {
  return null != this._keys ? this._keys : com.cognitect.transit.util.objectKeys(this.map);
};
com.cognitect.transit.types.TransitMap.prototype["delete"] = function(a) {
  this.hashCode = -1;
  this._keys = null;
  for (var b = com.cognitect.transit.eq.hashCode(a), c = this.map[b], d = 0;d < c.length;d += 2) {
    if (com.cognitect.transit.eq.equals(a, c[d])) {
      c.splice(d, 2);
      0 === c.length && delete this.map[b];
      this.size--;
      break;
    }
  }
};
com.cognitect.transit.types.TransitMap.prototype.entries = function() {
  return new com.cognitect.transit.types.TransitMapIterator(this, com.cognitect.transit.types.ENTRIES);
};
com.cognitect.transit.types.TransitMap.prototype.entries = com.cognitect.transit.types.TransitMap.prototype.entries;
com.cognitect.transit.types.TransitMap.prototype.forEach = function(a) {
  for (var b = this.getKeys(), c = 0;c < b.length;c++) {
    for (var d = this.map[b[c]], e = 0;e < d.length;e += 2) {
      a(d[e + 1], d[e], this);
    }
  }
};
com.cognitect.transit.types.TransitMap.prototype.forEach = com.cognitect.transit.types.TransitMap.prototype.forEach;
com.cognitect.transit.types.TransitMap.prototype.get = function(a, b) {
  var c = com.cognitect.transit.eq.hashCode(a), c = this.map[c];
  if (null != c) {
    for (var d = 0;d < c.length;d += 2) {
      if (com.cognitect.transit.eq.equals(a, c[d])) {
        return c[d + 1];
      }
    }
  } else {
    return b;
  }
};
com.cognitect.transit.types.TransitMap.prototype.get = com.cognitect.transit.types.TransitMap.prototype.get;
com.cognitect.transit.types.TransitMap.prototype.has = function(a) {
  var b = com.cognitect.transit.eq.hashCode(a), b = this.map[b];
  if (null != b) {
    for (var c = 0;c < b.length;c += 2) {
      if (com.cognitect.transit.eq.equals(a, b[c])) {
        return!0;
      }
    }
  }
  return!1;
};
com.cognitect.transit.types.TransitMap.prototype.has = com.cognitect.transit.types.TransitMap.prototype.has;
com.cognitect.transit.types.TransitMap.prototype.keys = function() {
  return new com.cognitect.transit.types.TransitMapIterator(this, com.cognitect.transit.types.KEYS);
};
com.cognitect.transit.types.TransitMap.prototype.keys = com.cognitect.transit.types.TransitMap.prototype.keys;
com.cognitect.transit.types.TransitMap.prototype.keySet = function() {
  for (var a = this.getKeys(), b = [], c = 0;c < a.length;c++) {
    for (var d = this.map[a[c]], e = 0;e < d.length;e += 2) {
      b.push(d[e]);
    }
  }
  return b;
};
com.cognitect.transit.types.TransitMap.prototype.keySet = com.cognitect.transit.types.TransitMap.prototype.keySet;
com.cognitect.transit.types.TransitMap.prototype.set = function(a, b) {
  this.hashCode = -1;
  var c = com.cognitect.transit.eq.hashCode(a), d = this.map[c];
  if (null == d) {
    this._keys && this._keys.push(c), this.map[c] = [a, b], this.size++;
  } else {
    for (var c = !0, e = 0;e < d.length;e += 2) {
      if (com.cognitect.transit.eq.equals(b, d[e])) {
        c = !1;
        d[e] = b;
        break;
      }
    }
    c && (d.push(a), d.push(b), this.size++);
  }
};
com.cognitect.transit.types.TransitMap.prototype.set = com.cognitect.transit.types.TransitMap.prototype.set;
com.cognitect.transit.types.TransitMap.prototype.values = function() {
  return new com.cognitect.transit.types.TransitMapIterator(this, com.cognitect.transit.types.VALUES);
};
com.cognitect.transit.types.TransitMap.prototype.values = com.cognitect.transit.types.TransitMap.prototype.values;
com.cognitect.transit.types.TransitMap.prototype.com$cognitect$transit$hashCode = function() {
  -1 === this.hashCode && (this.hashCode = com.cognitect.transit.eq.hashMapLike(this));
  return this.hashCode;
};
com.cognitect.transit.types.TransitMap.prototype.com$cognitect$transit$equals = function(a) {
  return com.cognitect.transit.types.mapEquals(this, a);
};
com.cognitect.transit.types.map = function(a, b, c) {
  a = a || [];
  b = !1 === b ? b : !0;
  if ((!0 !== c || !c) && a.length <= 2 * com.cognitect.transit.types.ARRAY_MAP_THRESHOLD) {
    if (b) {
      var d = a;
      a = [];
      for (b = 0;b < d.length;b += 2) {
        var e = !1;
        for (c = 0;c < a.length;c += 2) {
          if (com.cognitect.transit.eq.equals(a[c], d[b])) {
            a[c + 1] = d[b + 1];
            e = !0;
            break;
          }
        }
        e || (a.push(d[b]), a.push(d[b + 1]));
      }
    }
    return new com.cognitect.transit.types.TransitArrayMap(a);
  }
  var d = {}, e = [], f = 0;
  for (b = 0;b < a.length;b += 2) {
    c = com.cognitect.transit.eq.hashCode(a[b]);
    var g = d[c];
    if (null == g) {
      e.push(c), d[c] = [a[b], a[b + 1]], f++;
    } else {
      var h = !0;
      for (c = 0;c < g.length;c += 2) {
        if (com.cognitect.transit.eq.equals(g[c], a[b])) {
          g[c + 1] = a[b + 1];
          h = !1;
          break;
        }
      }
      h && (g.push(a[b]), g.push(a[b + 1]), f++);
    }
  }
  return new com.cognitect.transit.types.TransitMap(e, d, f);
};
com.cognitect.transit.types.isArrayMap = function(a) {
  return a instanceof com.cognitect.transit.types.TransitArrayMap;
};
com.cognitect.transit.types.isMap = function(a) {
  return a instanceof com.cognitect.transit.types.TransitArrayMap || a instanceof com.cognitect.transit.types.TransitMap;
};
com.cognitect.transit.types.TransitSet = function(a) {
  this.map = a;
  this.size = a.size;
};
com.cognitect.transit.types.TransitSet.prototype.toString = function() {
  return "[TransitSet]";
};
com.cognitect.transit.types.TransitSet.prototype.add = function(a) {
  this.map.set(a, a);
  this.size = this.map.size;
};
com.cognitect.transit.types.TransitSet.prototype.add = com.cognitect.transit.types.TransitSet.prototype.add;
com.cognitect.transit.types.TransitSet.prototype.clear = function() {
  this.map = new com.cognitect.transit.types.TransitMap;
  this.size = 0;
};
com.cognitect.transit.types.TransitSet.prototype.clear = com.cognitect.transit.types.TransitSet.prototype.clear;
com.cognitect.transit.types.TransitSet.prototype["delete"] = function(a) {
  this.map["delete"](a);
  this.size = this.map.size;
};
com.cognitect.transit.types.TransitSet.prototype.entries = function() {
  return this.map.entries();
};
com.cognitect.transit.types.TransitSet.prototype.entries = com.cognitect.transit.types.TransitSet.prototype.entries;
com.cognitect.transit.types.TransitSet.prototype.forEach = function(a, b) {
  var c = this;
  this.map.forEach(function(b, e, f) {
    a(e, c);
  });
};
com.cognitect.transit.types.TransitSet.prototype.forEach = com.cognitect.transit.types.TransitSet.prototype.forEach;
com.cognitect.transit.types.TransitSet.prototype.has = function(a) {
  return this.map.has(a);
};
com.cognitect.transit.types.TransitSet.prototype.has = com.cognitect.transit.types.TransitSet.prototype.has;
com.cognitect.transit.types.TransitSet.prototype.keys = function() {
  return this.map.keys();
};
com.cognitect.transit.types.TransitSet.prototype.keys = com.cognitect.transit.types.TransitSet.prototype.keys;
com.cognitect.transit.types.TransitSet.prototype.keySet = function() {
  return this.map.keySet();
};
com.cognitect.transit.types.TransitSet.prototype.keySet = com.cognitect.transit.types.TransitSet.prototype.keySet;
com.cognitect.transit.types.TransitSet.prototype.values = function() {
  return this.map.values();
};
com.cognitect.transit.types.TransitSet.prototype.values = com.cognitect.transit.types.TransitSet.prototype.values;
com.cognitect.transit.types.TransitSet.prototype.com$cognitect$transit$equals = function(a) {
  if (a instanceof com.cognitect.transit.types.TransitSet) {
    if (this.size === a.size) {
      return com.cognitect.transit.eq.equals(this.map, a.map);
    }
  } else {
    return!1;
  }
};
com.cognitect.transit.types.TransitSet.prototype.com$cognitect$transit$hashCode = function(a) {
  return com.cognitect.transit.eq.hashCode(this.map);
};
com.cognitect.transit.types.set = function(a) {
  a = a || [];
  for (var b = {}, c = [], d = 0, e = 0;e < a.length;e++) {
    var f = com.cognitect.transit.eq.hashCode(a[e]), g = b[f];
    if (null == g) {
      c.push(f), b[f] = [a[e], a[e]], d++;
    } else {
      for (var f = !0, h = 0;h < g.length;h += 2) {
        if (com.cognitect.transit.eq.equals(g[h], a[e])) {
          f = !1;
          break;
        }
      }
      f && (g.push(a[e]), g.push(a[e]), d++);
    }
  }
  return new com.cognitect.transit.types.TransitSet(new com.cognitect.transit.types.TransitMap(c, b, d));
};
com.cognitect.transit.types.isSet = function(a) {
  return a instanceof com.cognitect.transit.types.TransitSet;
};
com.cognitect.transit.types.quoted = function(a) {
  return com.cognitect.transit.types.taggedValue("'", a);
};
com.cognitect.transit.types.isQuoted = function(a) {
  return a instanceof com.cognitect.transit.types.TaggedValue && "'" === a.tag;
};
com.cognitect.transit.types.list = function(a) {
  return com.cognitect.transit.types.taggedValue("list", a);
};
com.cognitect.transit.types.isList = function(a) {
  return a instanceof com.cognitect.transit.types.List && "list" === a.tag;
};
com.cognitect.transit.types.link = function(a) {
  return com.cognitect.transit.types.taggedValue("link", a);
};
com.cognitect.transit.types.isLink = function(a) {
  return a instanceof com.cognitect.transit.types.TaggedValue && "link" === a.tag;
};
com.cognitect.transit.types.specialDouble = function(a) {
  switch(a) {
    case "-INF":
      return-Infinity;
    case "INF":
      return Infinity;
    case "NaN":
      return NaN;
    default:
      throw Error("Invalid special double value " + a);;
  }
};
com.cognitect.transit.caching = {};
com.cognitect.transit.caching.MIN_SIZE_CACHEABLE = 3;
com.cognitect.transit.caching.BASE_CHAR_IDX = 48;
com.cognitect.transit.caching.CACHE_CODE_DIGITS = 44;
com.cognitect.transit.caching.MAX_CACHE_ENTRIES = com.cognitect.transit.caching.CACHE_CODE_DIGITS * com.cognitect.transit.caching.CACHE_CODE_DIGITS;
com.cognitect.transit.caching.MAX_CACHE_SIZE = 4096;
com.cognitect.transit.caching.isCacheable = function(a, b) {
  if (a.length > com.cognitect.transit.caching.MIN_SIZE_CACHEABLE) {
    if (b) {
      return!0;
    }
    var c = a.charAt(0), d = a.charAt(1);
    return c === com.cognitect.transit.delimiters.ESC ? ":" === d || "$" === d || "#" === d : !1;
  }
  return!1;
};
com.cognitect.transit.caching.idxToCode = function(a) {
  var b = Math.floor(a / com.cognitect.transit.caching.CACHE_CODE_DIGITS);
  a = String.fromCharCode(a % com.cognitect.transit.caching.CACHE_CODE_DIGITS + com.cognitect.transit.caching.BASE_CHAR_IDX);
  return 0 === b ? com.cognitect.transit.delimiters.SUB + a : com.cognitect.transit.delimiters.SUB + String.fromCharCode(b + com.cognitect.transit.caching.BASE_CHAR_IDX) + a;
};
com.cognitect.transit.caching.WriteCache = function() {
  this.cacheSize = this.gen = this.idx = 0;
  this.cache = {};
};
com.cognitect.transit.caching.WriteCache.prototype.write = function(a, b) {
  if (com.cognitect.transit.caching.isCacheable(a, b)) {
    this.cacheSize === com.cognitect.transit.caching.MAX_CACHE_SIZE ? (this.clear(), this.gen = 0, this.cache = {}) : this.idx === com.cognitect.transit.caching.MAX_CACHE_ENTRIES && this.clear();
    var c = this.cache[a];
    return null == c ? (this.cache[a] = [com.cognitect.transit.caching.idxToCode(this.idx), this.gen], this.idx++, a) : c[1] != this.gen ? (c[1] = this.gen, c[0] = com.cognitect.transit.caching.idxToCode(this.idx), this.idx++, a) : c[0];
  }
  return a;
};
com.cognitect.transit.caching.WriteCache.prototype.clear = function() {
  this.idx = 0;
  this.gen++;
};
com.cognitect.transit.caching.isCacheCode = function(a) {
  return a.charAt(0) === com.cognitect.transit.delimiters.SUB && " " !== a.charAt(1);
};
com.cognitect.transit.caching.codeToIdx = function(a) {
  if (2 === a.length) {
    return a.charCodeAt(1) - com.cognitect.transit.caching.BASE_CHAR_IDX;
  }
  var b = (a.charCodeAt(1) - com.cognitect.transit.caching.BASE_CHAR_IDX) * com.cognitect.transit.caching.CACHE_CODE_DIGITS;
  a = a.charCodeAt(2) - com.cognitect.transit.caching.BASE_CHAR_IDX;
  return b + a;
};
com.cognitect.transit.caching.ReadCache = function() {
  this.idx = 0;
  this.cache = [];
};
com.cognitect.transit.caching.ReadCache.prototype.write = function(a, b) {
  this.idx == com.cognitect.transit.caching.MAX_CACHE_ENTRIES && (this.idx = 0);
  this.cache[this.idx] = a;
  this.idx++;
  return a;
};
com.cognitect.transit.caching.ReadCache.prototype.read = function(a, b) {
  return this.cache[com.cognitect.transit.caching.codeToIdx(a)];
};
com.cognitect.transit.caching.ReadCache.prototype.clear = function() {
  this.idx = 0;
};
com.cognitect.transit.impl = {};
com.cognitect.transit.impl.decoder = {};
com.cognitect.transit.impl.decoder.Tag = function(a) {
  this.str = a;
};
com.cognitect.transit.impl.decoder.tag = function(a) {
  return new com.cognitect.transit.impl.decoder.Tag(a);
};
com.cognitect.transit.impl.decoder.isTag = function(a) {
  return a && a instanceof com.cognitect.transit.impl.decoder.Tag;
};
com.cognitect.transit.impl.decoder.isGroundHandler = function(a) {
  switch(a) {
    case "_":
    ;
    case "s":
    ;
    case "?":
    ;
    case "i":
    ;
    case "d":
    ;
    case "b":
    ;
    case "'":
    ;
    case "array":
    ;
    case "map":
      return!0;
  }
  return!1;
};
com.cognitect.transit.impl.decoder.Decoder = function(a) {
  this.options = a || {};
  this.handlers = {};
  for (var b in this.defaults.handlers) {
    this.handlers[b] = this.defaults.handlers[b];
  }
  for (b in this.options.handlers) {
    if (com.cognitect.transit.impl.decoder.isGroundHandler(b)) {
      throw Error('Cannot override handler for ground type "' + b + '"');
    }
    this.handlers[b] = this.options.handlers[b];
  }
  this.preferStrings = null != this.options.preferStrings ? this.options.preferStrings : this.defaults.preferStrings;
  this.defaultHandler = this.options.defaultHandler || this.defaults.defaultHandler;
  this.mapBuilder = this.options.mapBuilder;
  this.arrayBuilder = this.options.arrayBuilder;
};
com.cognitect.transit.impl.decoder.Decoder.prototype.defaults = {handlers:{_:function(a) {
  return com.cognitect.transit.types.nullValue();
}, "?":function(a) {
  return com.cognitect.transit.types.boolValue(a);
}, b:function(a) {
  return com.cognitect.transit.types.binary(a);
}, i:function(a) {
  return com.cognitect.transit.types.intValue(a);
}, n:function(a) {
  return com.cognitect.transit.types.bigInteger(a);
}, d:function(a) {
  return com.cognitect.transit.types.floatValue(a);
}, f:function(a) {
  return com.cognitect.transit.types.bigDecimalValue(a);
}, c:function(a) {
  return com.cognitect.transit.types.charValue(a);
}, ":":function(a) {
  return com.cognitect.transit.types.keyword(a);
}, $:function(a) {
  return com.cognitect.transit.types.symbol(a);
}, r:function(a) {
  return com.cognitect.transit.types.uri(a);
}, z:function(a) {
  return com.cognitect.transit.types.specialDouble(a);
}, "'":function(a) {
  return a;
}, m:function(a) {
  return com.cognitect.transit.types.date(a);
}, t:function(a) {
  return com.cognitect.transit.types.verboseDate(a);
}, u:function(a) {
  return com.cognitect.transit.types.uuid(a);
}, set:function(a) {
  return com.cognitect.transit.types.set(a);
}, list:function(a) {
  return com.cognitect.transit.types.list(a);
}, link:function(a) {
  return com.cognitect.transit.types.link(a);
}, cmap:function(a) {
  return com.cognitect.transit.types.map(a, !1);
}}, defaultHandler:function(a, b) {
  return com.cognitect.transit.types.taggedValue(a, b);
}, preferStrings:!0};
com.cognitect.transit.impl.decoder.Decoder.prototype.decode = function(a, b, c, d) {
  if (null == a) {
    return null;
  }
  switch(typeof a) {
    case "string":
      return this.decodeString(a, b, c, d);
    case "object":
      return com.cognitect.transit.util.isArray(a) ? "^ " === a[0] ? this.decodeArrayHash(a, b, c, d) : this.decodeArray(a, b, c, d) : this.decodeHash(a, b, c, d);
  }
  return a;
};
com.cognitect.transit.impl.decoder.Decoder.prototype.decode = com.cognitect.transit.impl.decoder.Decoder.prototype.decode;
com.cognitect.transit.impl.decoder.Decoder.prototype.decodeString = function(a, b, c, d) {
  return com.cognitect.transit.caching.isCacheable(a, c) ? (a = this.parseString(a, b, !1), b && b.write(a, c), a) : com.cognitect.transit.caching.isCacheCode(a) ? b.read(a, c) : this.parseString(a, b, c);
};
com.cognitect.transit.impl.decoder.Decoder.prototype.decodeHash = function(a, b, c, d) {
  c = com.cognitect.transit.util.objectKeys(a);
  var e = c[0];
  d = 1 == c.length ? this.decode(e, b, !1, !1) : null;
  if (com.cognitect.transit.impl.decoder.isTag(d)) {
    return a = a[e], c = this.handlers[d.str], null != c ? c(this.decode(a, b, !1, !0)) : com.cognitect.transit.types.taggedValue(d.str, this.decode(a, b, !1, !1));
  }
  if (this.mapBuilder) {
    if (c.length < 2 * com.cognitect.transit.types.SMALL_ARRAY_MAP_THRESHOLD && this.mapBuilder.fromArray) {
      var f = [];
      for (d = 0;d < c.length;d++) {
        e = c[d], f.push(this.decode(e, b, !0, !1)), f.push(this.decode(a[e], b, !1, !1));
      }
      return this.mapBuilder.fromArray(f, a);
    }
    f = this.mapBuilder.init(a);
    for (d = 0;d < c.length;d++) {
      e = c[d], f = this.mapBuilder.add(f, this.decode(e, b, !0, !1), this.decode(a[e], b, !1, !1), a);
    }
    return this.mapBuilder.finalize(f, a);
  }
  f = [];
  for (d = 0;d < c.length;d++) {
    e = c[d], f.push(this.decode(e, b, !0, !1)), f.push(this.decode(a[e], b, !1, !1));
  }
  return com.cognitect.transit.types.map(f, !1);
};
com.cognitect.transit.impl.decoder.Decoder.prototype.decodeArrayHash = function(a, b, c, d) {
  if (this.mapBuilder) {
    if (a.length < 2 * com.cognitect.transit.types.SMALL_ARRAY_MAP_THRESHOLD + 1 && this.mapBuilder.fromArray) {
      d = [];
      for (c = 1;c < a.length;c += 2) {
        d.push(this.decode(a[c], b, !0, !1)), d.push(this.decode(a[c + 1], b, !1, !1));
      }
      return this.mapBuilder.fromArray(d, a);
    }
    d = this.mapBuilder.init(a);
    for (c = 1;c < a.length;c += 2) {
      d = this.mapBuilder.add(d, this.decode(a[c], b, !0, !1), this.decode(a[c + 1], b, !1, !1), a);
    }
    return this.mapBuilder.finalize(d, a);
  }
  d = [];
  for (c = 1;c < a.length;c += 2) {
    d.push(this.decode(a[c], b, !0, !1)), d.push(this.decode(a[c + 1], b, !1, !1));
  }
  return com.cognitect.transit.types.map(d, !1);
};
com.cognitect.transit.impl.decoder.Decoder.prototype.decodeArray = function(a, b, c, d) {
  if (d) {
    var e = [];
    for (d = 0;d < a.length;d++) {
      e.push(this.decode(a[d], b, c, !1));
    }
    return e;
  }
  e = b && b.idx;
  if (2 === a.length && "string" === typeof a[0] && (d = this.decode(a[0], b, !1, !1), com.cognitect.transit.impl.decoder.isTag(d))) {
    return a = a[1], e = this.handlers[d.str], null != e ? e = e(this.decode(a, b, c, !0)) : com.cognitect.transit.types.taggedValue(d.str, this.decode(a, b, c, !1));
  }
  b && e != b.idx && (b.idx = e);
  if (this.arrayBuilder) {
    if (32 >= a.length && this.arrayBuilder.fromArray) {
      e = [];
      for (d = 0;d < a.length;d++) {
        e.push(this.decode(a[d], b, c, !1));
      }
      return this.arrayBuilder.fromArray(e, a);
    }
    e = this.arrayBuilder.init();
    for (d = 0;d < a.length;d++) {
      e = this.arrayBuilder.add(e, this.decode(a[d], b, c, !1), a);
    }
    return this.arrayBuilder.finalize(e, a);
  }
  e = [];
  for (d = 0;d < a.length;d++) {
    e.push(this.decode(a[d], b, c, !1));
  }
  return e;
};
com.cognitect.transit.impl.decoder.Decoder.prototype.parseString = function(a, b, c) {
  if (a.charAt(0) === com.cognitect.transit.delimiters.ESC) {
    b = a.charAt(1);
    if (b === com.cognitect.transit.delimiters.ESC || b === com.cognitect.transit.delimiters.SUB || b === com.cognitect.transit.delimiters.RES) {
      return a.substring(1);
    }
    if (b === com.cognitect.transit.delimiters.TAG) {
      return com.cognitect.transit.impl.decoder.tag(a.substring(2));
    }
    c = this.handlers[b];
    return null == c ? this.defaultHandler(b, a.substring(2)) : c(a.substring(2));
  }
  return a;
};
com.cognitect.transit.impl.decoder.decoder = function(a) {
  return new com.cognitect.transit.impl.decoder.Decoder(a);
};
com.cognitect.transit.impl.reader = {};
com.cognitect.transit.impl.reader.JSONUnmarshaller = function(a) {
  this.decoder = new com.cognitect.transit.impl.decoder.Decoder(a);
};
com.cognitect.transit.impl.reader.JSONUnmarshaller.prototype.unmarshal = function(a, b) {
  return this.decoder.decode(JSON.parse(a), b);
};
com.cognitect.transit.impl.reader.Reader = function(a, b) {
  this.unmarshaller = a;
  this.options = b || {};
  this.cache = this.options.cache ? this.options.cache : new com.cognitect.transit.caching.ReadCache;
};
com.cognitect.transit.impl.reader.Reader.prototype.read = function(a) {
  a = this.unmarshaller.unmarshal(a, this.cache);
  this.cache.clear();
  return a;
};
com.cognitect.transit.impl.reader.Reader.prototype.read = com.cognitect.transit.impl.reader.Reader.prototype.read;
com.cognitect.transit.handlers = {};
com.cognitect.transit.handlers.ctorGuid = 0;
com.cognitect.transit.handlers.ctorGuidProperty = "transit$guid$" + com.cognitect.transit.util.randomUUID();
com.cognitect.transit.handlers.typeTag = function(a) {
  if (null == a) {
    return "null";
  }
  if (a === String) {
    return "string";
  }
  if (a === Boolean) {
    return "boolean";
  }
  if (a === Number) {
    return "number";
  }
  if (a === Array) {
    return "array";
  }
  if (a === Object) {
    return "map";
  }
  var b = a[com.cognitect.transit.handlers.ctorGuidProperty];
  null == b && ("undefined" != typeof Object.defineProperty ? (b = ++com.cognitect.transit.handlers.ctorGuid, Object.defineProperty(a, com.cognitect.transit.handlers.ctorGuidProperty, {value:b, enumerable:!1})) : a[com.cognitect.transit.handlers.ctorGuidProperty] = b = ++com.cognitect.transit.handlers.ctorGuid);
  return b;
};
com.cognitect.transit.handlers.constructor = function(a) {
  return null == a ? null : a.constructor;
};
com.cognitect.transit.handlers.padZeros = function(a, b) {
  for (var c = a.toString(), d = c.length;d < b;d++) {
    c = "0" + c;
  }
  return c;
};
com.cognitect.transit.handlers.stringableKeys = function(a) {
  a = com.cognitect.transit.util.objectKeys(a);
  for (var b = 0;b < a.length;b++) {
  }
  return!0;
};
com.cognitect.transit.handlers.NilHandler = function() {
};
com.cognitect.transit.handlers.NilHandler.prototype.tag = function(a) {
  return "_";
};
com.cognitect.transit.handlers.NilHandler.prototype.rep = function(a) {
  return null;
};
com.cognitect.transit.handlers.NilHandler.prototype.stringRep = function(a) {
  return "null";
};
com.cognitect.transit.handlers.StringHandler = function() {
};
com.cognitect.transit.handlers.StringHandler.prototype.tag = function(a) {
  return "s";
};
com.cognitect.transit.handlers.StringHandler.prototype.rep = function(a) {
  return a;
};
com.cognitect.transit.handlers.StringHandler.prototype.stringRep = function(a) {
  return a;
};
com.cognitect.transit.handlers.NumberHandler = function() {
};
com.cognitect.transit.handlers.NumberHandler.prototype.tag = function(a) {
  return "i";
};
com.cognitect.transit.handlers.NumberHandler.prototype.rep = function(a) {
  return a;
};
com.cognitect.transit.handlers.NumberHandler.prototype.stringRep = function(a) {
  return a.toString();
};
com.cognitect.transit.handlers.IntegerHandler = function() {
};
com.cognitect.transit.handlers.IntegerHandler.prototype.tag = function(a) {
  return "i";
};
com.cognitect.transit.handlers.IntegerHandler.prototype.rep = function(a) {
  return a.toString();
};
com.cognitect.transit.handlers.IntegerHandler.prototype.stringRep = function(a) {
  return a.toString();
};
com.cognitect.transit.handlers.BooleanHandler = function() {
};
com.cognitect.transit.handlers.BooleanHandler.prototype.tag = function(a) {
  return "?";
};
com.cognitect.transit.handlers.BooleanHandler.prototype.rep = function(a) {
  return a;
};
com.cognitect.transit.handlers.BooleanHandler.prototype.stringRep = function(a) {
  return a.toString();
};
com.cognitect.transit.handlers.ArrayHandler = function() {
};
com.cognitect.transit.handlers.ArrayHandler.prototype.tag = function(a) {
  return "array";
};
com.cognitect.transit.handlers.ArrayHandler.prototype.rep = function(a) {
  return a;
};
com.cognitect.transit.handlers.ArrayHandler.prototype.stringRep = function(a) {
  return null;
};
com.cognitect.transit.handlers.MapHandler = function() {
};
com.cognitect.transit.handlers.MapHandler.prototype.tag = function(a) {
  return "map";
};
com.cognitect.transit.handlers.MapHandler.prototype.rep = function(a) {
  return a;
};
com.cognitect.transit.handlers.MapHandler.prototype.stringRep = function(a) {
  return null;
};
com.cognitect.transit.handlers.VerboseDateHandler = function() {
};
com.cognitect.transit.handlers.VerboseDateHandler.prototype.tag = function(a) {
  return "t";
};
com.cognitect.transit.handlers.VerboseDateHandler.prototype.rep = function(a) {
  return a.getUTCFullYear() + "-" + com.cognitect.transit.handlers.padZeros(a.getUTCMonth() + 1, 2) + "-" + com.cognitect.transit.handlers.padZeros(a.getUTCDate(), 2) + "T" + com.cognitect.transit.handlers.padZeros(a.getUTCHours(), 2) + ":" + com.cognitect.transit.handlers.padZeros(a.getUTCMinutes(), 2) + ":" + com.cognitect.transit.handlers.padZeros(a.getUTCSeconds(), 2) + "." + com.cognitect.transit.handlers.padZeros(a.getUTCMilliseconds(), 3) + "Z";
};
com.cognitect.transit.handlers.VerboseDateHandler.prototype.stringRep = function(a, b) {
  return b.rep(a);
};
com.cognitect.transit.handlers.DateHandler = function() {
};
com.cognitect.transit.handlers.DateHandler.prototype.tag = function(a) {
  return "m";
};
com.cognitect.transit.handlers.DateHandler.prototype.rep = function(a) {
  return a.valueOf();
};
com.cognitect.transit.handlers.DateHandler.prototype.stringRep = function(a) {
  return a.valueOf().toString();
};
com.cognitect.transit.handlers.DateHandler.prototype.getVerboseHandler = function(a) {
  return new com.cognitect.transit.handlers.VerboseDateHandler;
};
com.cognitect.transit.handlers.UUIDHandler = function() {
};
com.cognitect.transit.handlers.UUIDHandler.prototype.tag = function(a) {
  return "u";
};
com.cognitect.transit.handlers.UUIDHandler.prototype.rep = function(a) {
  return a.toString();
};
com.cognitect.transit.handlers.UUIDHandler.prototype.stringRep = function(a) {
  return a.toString();
};
com.cognitect.transit.handlers.KeywordHandler = function() {
};
com.cognitect.transit.handlers.KeywordHandler.prototype.tag = function(a) {
  return ":";
};
com.cognitect.transit.handlers.KeywordHandler.prototype.rep = function(a) {
  return a.name;
};
com.cognitect.transit.handlers.KeywordHandler.prototype.stringRep = function(a, b) {
  return b.rep(a);
};
com.cognitect.transit.handlers.SymbolHandler = function() {
};
com.cognitect.transit.handlers.SymbolHandler.prototype.tag = function(a) {
  return "$";
};
com.cognitect.transit.handlers.SymbolHandler.prototype.rep = function(a) {
  return a.name;
};
com.cognitect.transit.handlers.SymbolHandler.prototype.stringRep = function(a, b) {
  return b.rep(a);
};
com.cognitect.transit.handlers.TaggedHandler = function() {
};
com.cognitect.transit.handlers.TaggedHandler.prototype.tag = function(a) {
  return a.tag;
};
com.cognitect.transit.handlers.TaggedHandler.prototype.rep = function(a) {
  return a.rep;
};
com.cognitect.transit.handlers.TaggedHandler.prototype.stringRep = function(a, b) {
  return null;
};
com.cognitect.transit.handlers.TransitSetHandler = function() {
};
com.cognitect.transit.handlers.TransitSetHandler.prototype.tag = function(a) {
  return "set";
};
com.cognitect.transit.handlers.TransitSetHandler.prototype.rep = function(a) {
  var b = [];
  a.forEach(function(a, d) {
    b.push(a);
  });
  return com.cognitect.transit.types.taggedValue("array", b);
};
com.cognitect.transit.handlers.TransitSetHandler.prototype.stringRep = function(a, b) {
  return null;
};
com.cognitect.transit.handlers.TransitArrayMapHandler = function() {
};
com.cognitect.transit.handlers.TransitArrayMapHandler.prototype.tag = function(a) {
  return "map";
};
com.cognitect.transit.handlers.TransitArrayMapHandler.prototype.rep = function(a) {
  return a;
};
com.cognitect.transit.handlers.TransitArrayMapHandler.prototype.stringRep = function(a, b) {
  return null;
};
com.cognitect.transit.handlers.TransitMapHandler = function() {
};
com.cognitect.transit.handlers.TransitMapHandler.prototype.tag = function(a) {
  return "map";
};
com.cognitect.transit.handlers.TransitMapHandler.prototype.rep = function(a) {
  return a;
};
com.cognitect.transit.handlers.TransitMapHandler.prototype.stringRep = function(a, b) {
  return null;
};
com.cognitect.transit.handlers.defaultHandlers = function(a) {
  a.set(null, new com.cognitect.transit.handlers.NilHandler);
  a.set(String, new com.cognitect.transit.handlers.StringHandler);
  a.set(Number, new com.cognitect.transit.handlers.NumberHandler);
  a.set(goog.math.Long, new com.cognitect.transit.handlers.IntegerHandler);
  a.set(Boolean, new com.cognitect.transit.handlers.BooleanHandler);
  a.set(Array, new com.cognitect.transit.handlers.ArrayHandler);
  a.set(Object, new com.cognitect.transit.handlers.MapHandler);
  a.set(Date, new com.cognitect.transit.handlers.DateHandler);
  a.set(com.cognitect.transit.types.UUID, new com.cognitect.transit.handlers.UUIDHandler);
  a.set(com.cognitect.transit.types.Keyword, new com.cognitect.transit.handlers.KeywordHandler);
  a.set(com.cognitect.transit.types.Symbol, new com.cognitect.transit.handlers.SymbolHandler);
  a.set(com.cognitect.transit.types.TaggedValue, new com.cognitect.transit.handlers.TaggedHandler);
  a.set(com.cognitect.transit.types.TransitSet, new com.cognitect.transit.handlers.TransitSetHandler);
  a.set(com.cognitect.transit.types.TransitArrayMap, new com.cognitect.transit.handlers.TransitArrayMapHandler);
  a.set(com.cognitect.transit.types.TransitMap, new com.cognitect.transit.handlers.TransitMapHandler);
  return a;
};
com.cognitect.transit.handlers.Handlers = function() {
  this.handlers = {};
  com.cognitect.transit.handlers.defaultHandlers(this);
};
com.cognitect.transit.handlers.Handlers.prototype.get = function(a) {
  var b = null, b = "string" === typeof a ? this.handlers[a] : this.handlers[com.cognitect.transit.handlers.typeTag(a)];
  return null != b ? b : this.handlers["default"];
};
com.cognitect.transit.handlers.validTag = function(a) {
  switch(a) {
    case "null":
    ;
    case "string":
    ;
    case "boolean":
    ;
    case "number":
    ;
    case "array":
    ;
    case "map":
      return!1;
  }
  return!0;
};
com.cognitect.transit.handlers.Handlers.prototype.set = function(a, b) {
  "string" === typeof a && com.cognitect.transit.handlers.validTag(a) ? this.handlers[a] = b : this.handlers[com.cognitect.transit.handlers.typeTag(a)] = b;
};
com.cognitect.transit.impl.writer = {};
com.cognitect.transit.impl.writer.escape = function(a) {
  if (0 < a.length) {
    var b = a.charAt(0);
    return b === com.cognitect.transit.delimiters.ESC || b === com.cognitect.transit.delimiters.SUB || b === com.cognitect.transit.delimiters.RES ? com.cognitect.transit.delimiters.ESC + a : a;
  }
  return a;
};
com.cognitect.transit.impl.writer.JSONMarshaller = function(a) {
  this.opts = a || {};
  this.preferStrings = null != this.opts.preferStrings ? this.opts.preferStrings : !0;
  this.objectBuilder = this.opts.objectBuilder || null;
  this.handlers = new com.cognitect.transit.handlers.Handlers;
  if (a = this.opts.handlers) {
    if (com.cognitect.transit.util.isArray(a) || !a.forEach) {
      throw Error('transit writer "handlers" option must be a map');
    }
    var b = this;
    a.forEach(function(a, d) {
      b.handlers.set(d, a);
    });
  }
  this.unpack = this.opts.unpack || function(a) {
    return com.cognitect.transit.types.isArrayMap(a) && null === a.backingMap ? a._entries : !1;
  };
  this.verbose = this.opts && this.opts.verbose || !1;
};
com.cognitect.transit.impl.writer.JSONMarshaller.prototype.handler = function(a) {
  var b = this.handlers.get(com.cognitect.transit.handlers.constructor(a));
  return null != b ? b : (a = a && a.transitTag) ? this.handlers.get(a) : null;
};
com.cognitect.transit.impl.writer.JSONMarshaller.prototype.registerHandler = function(a, b) {
  this.handlers.set(a, b);
};
com.cognitect.transit.impl.writer.JSONMarshaller.prototype.emitNil = function(a, b) {
  return a ? this.emitString(com.cognitect.transit.delimiters.ESC, "_", "", a, b) : null;
};
com.cognitect.transit.impl.writer.JSONMarshaller.prototype.emitString = function(a, b, c, d, e) {
  a = a + b + c;
  return e ? e.write(a, d) : a;
};
com.cognitect.transit.impl.writer.JSONMarshaller.prototype.emitBoolean = function(a, b, c) {
  return b ? this.emitString(com.cognitect.transit.delimiters.ESC, "?", a.toString()[0], b, c) : a;
};
com.cognitect.transit.impl.writer.JSONMarshaller.prototype.emitInteger = function(a, b, c) {
  return Infinity === a ? this.emitString(com.cognitect.transit.delimiters.ESC, "z", "INF", b, c) : -Infinity === a ? this.emitString(com.cognitect.transit.delimiters.ESC, "z", "-INF", b, c) : isNaN(a) ? this.emitString(com.cognitect.transit.delimiters.ESC, "z", "NaN", b, c) : b || "string" === typeof a || a instanceof goog.math.Long ? this.emitString(com.cognitect.transit.delimiters.ESC, "i", a.toString(), b, c) : a;
};
com.cognitect.transit.impl.writer.JSONMarshaller.prototype.emitDouble = function(a, b, c) {
  return b ? this.emitString(a.ESC, "d", a, b, c) : a;
};
com.cognitect.transit.impl.writer.JSONMarshaller.prototype.emitBinary = function(a, b, c) {
  return this.emitString(com.cognitect.transit.delimiters.ESC, "b", a, b, c);
};
com.cognitect.transit.impl.writer.JSONMarshaller.prototype.emitQuoted = function(a, b, c) {
  if (a.verbose) {
    a = {};
    var d = this.emitString(com.cognitect.transit.delimiters.ESC_TAG, "'", "", !0, c);
    a[d] = com.cognitect.transit.impl.writer.marshal(this, b, !1, c);
    return a;
  }
  return[this.emitString(com.cognitect.transit.delimiters.ESC_TAG, "'", "", !0, c), com.cognitect.transit.impl.writer.marshal(this, b, !1, c)];
};
com.cognitect.transit.impl.writer.emitObjects = function(a, b, c) {
  var d = [];
  if (com.cognitect.transit.util.isArray(b)) {
    for (var e = 0;e < b.length;e++) {
      d.push(com.cognitect.transit.impl.writer.marshal(a, b[e], !1, c));
    }
  } else {
    b.forEach(function(b, e) {
      d.push(com.cognitect.transit.impl.writer.marshal(a, b, !1, c));
    });
  }
  return d;
};
com.cognitect.transit.impl.writer.emitArray = function(a, b, c, d) {
  return com.cognitect.transit.impl.writer.emitObjects(a, b, d);
};
com.cognitect.transit.impl.writer.isStringableKey = function(a, b) {
  if ("string" !== typeof b) {
    var c = a.handler(b);
    return c && 1 === c.tag(b).length;
  }
  return!0;
};
com.cognitect.transit.impl.writer.stringableKeys = function(a, b) {
  var c = a.unpack(b), d = !0;
  if (c) {
    for (var e = 0;e < c.length && (d = com.cognitect.transit.impl.writer.isStringableKey(a, c[e]), d);e += 2) {
    }
    return d;
  }
  if (b.keys && (c = b.keys(), c.next)) {
    for (step = c.next();!step.done;) {
      d = com.cognitect.transit.impl.writer.isStringableKey(a, step.value);
      if (!d) {
        break;
      }
      step = c.next();
    }
    return d;
  }
  if (b.forEach) {
    return b.forEach(function(b, c) {
      d = d && com.cognitect.transit.impl.writer.isStringableKey(a, c);
    }), d;
  }
  throw Error("Cannot walk keys of object type " + com.cognitect.transit.handlers.constructor(b).name);
};
com.cognitect.transit.impl.writer.emitMap = function(a, b, c, d) {
  if (b.constructor === Object || null != b.forEach) {
    if (a.verbose) {
      if (null != b.forEach) {
        if (com.cognitect.transit.impl.writer.stringableKeys(a, b)) {
          var e = {};
          b.forEach(function(b, c) {
            e[com.cognitect.transit.impl.writer.marshal(a, c, !0, !1)] = com.cognitect.transit.impl.writer.marshal(a, b, !1, d);
          });
        } else {
          var f = a.unpack(b), g = [], h = a.emitString(com.cognitect.transit.delimiters.ESC_TAG, "cmap", "", !0, d);
          if (f) {
            for (c = 0;c < f.length;c += 2) {
              g.push(com.cognitect.transit.impl.writer.marshal(a, f[c], !0, !1)), g.push(com.cognitect.transit.impl.writer.marshal(a, f[c + 1], !1, d));
            }
          } else {
            b.forEach(function(b, c) {
              g.push(com.cognitect.transit.impl.writer.marshal(a, c, !0, !1));
              g.push(com.cognitect.transit.impl.writer.marshal(a, b, !1, d));
            });
          }
          e = {};
          e[h] = g;
        }
      } else {
        for (e = {}, f = com.cognitect.transit.util.objectKeys(b), c = 0;c < f.length;c++) {
          e[com.cognitect.transit.impl.writer.marshal(a, f[c], !0, !1)] = com.cognitect.transit.impl.writer.marshal(a, b[f[c]], !1, d);
        }
      }
      return e;
    }
    if (null != b.forEach) {
      if (com.cognitect.transit.impl.writer.stringableKeys(a, b)) {
        f = a.unpack(b);
        e = ["^ "];
        if (f) {
          for (c = 0;c < f.length;c += 2) {
            e.push(com.cognitect.transit.impl.writer.marshal(a, f[c], !0, d)), e.push(com.cognitect.transit.impl.writer.marshal(a, f[c + 1], !1, d));
          }
        } else {
          b.forEach(function(b, c) {
            e.push(com.cognitect.transit.impl.writer.marshal(a, c, !0, d));
            e.push(com.cognitect.transit.impl.writer.marshal(a, b, !1, d));
          });
        }
        return e;
      }
      f = a.unpack(b);
      g = [];
      h = a.emitString(com.cognitect.transit.delimiters.ESC_TAG, "cmap", "", !0, d);
      if (f) {
        for (c = 0;c < f.length;c += 2) {
          g.push(com.cognitect.transit.impl.writer.marshal(a, f[c], !0, d)), g.push(com.cognitect.transit.impl.writer.marshal(a, f[c + 1], !1, d));
        }
      } else {
        b.forEach(function(b, c) {
          g.push(com.cognitect.transit.impl.writer.marshal(a, c, !0, d));
          g.push(com.cognitect.transit.impl.writer.marshal(a, b, !1, d));
        });
      }
      return[h, g];
    }
    e = ["^ "];
    f = com.cognitect.transit.util.objectKeys(b);
    for (c = 0;c < f.length;c++) {
      e.push(com.cognitect.transit.impl.writer.marshal(a, f[c], !0, d)), e.push(com.cognitect.transit.impl.writer.marshal(a, b[f[c]], !1, d));
    }
    return e;
  }
  if (null != a.objectBuilder) {
    return a.objectBuilder(b, function(b) {
      return com.cognitect.transit.impl.writer.marshal(a, b, !0, d);
    }, function(b) {
      return com.cognitect.transit.impl.writer.marshal(a, b, !1, d);
    });
  }
  c = com.cognitect.transit.handlers.constructor(b).name;
  f = Error("Cannot write " + c);
  f.data = {obj:b, type:c};
  throw f;
};
com.cognitect.transit.impl.writer.emitTaggedMap = function(a, b, c, d, e) {
  return a.verbose ? (d = {}, d[a.emitString(com.cognitect.transit.delimiters.ESC_TAG, b, "", !0, e)] = com.cognitect.transit.impl.writer.marshal(a, c, !1, e), d) : [a.emitString(com.cognitect.transit.delimiters.ESC_TAG, b, "", !0, e), com.cognitect.transit.impl.writer.marshal(a, c, !1, e)];
};
com.cognitect.transit.impl.writer.emitEncoded = function(a, b, c, d, e, f, g) {
  if (1 === c.length) {
    if ("string" === typeof d) {
      return a.emitString(com.cognitect.transit.delimiters.ESC, c, d, f, g);
    }
    if (f || a.preferStrings) {
      (d = a.verbose && b.getVerboseHandler()) ? (c = d.tag(e), d = d.stringRep(e, d)) : d = b.stringRep(e, b);
      if (null !== d) {
        return a.emitString(com.cognitect.transit.delimiters.ESC, c, d, f, g);
      }
      a = Error('Tag "' + c + '" cannot be encoded as string');
      a.data = {tag:c, rep:d, obj:e};
      throw a;
    }
  }
  return com.cognitect.transit.impl.writer.emitTaggedMap(a, c, d, f, g);
};
com.cognitect.transit.impl.writer.marshal = function(a, b, c, d) {
  var e = a.handler(b), f = e ? e.tag(b) : null, g = e ? e.rep(b) : null;
  if (null != e && null != f) {
    switch(f) {
      case "_":
        return a.emitNil(c, d);
      case "s":
        return a.emitString("", "", com.cognitect.transit.impl.writer.escape(g), c, d);
      case "?":
        return a.emitBoolean(g, c, d);
      case "i":
        return a.emitInteger(g, c, d);
      case "d":
        return a.emitDouble(g, c, d);
      case "b":
        return a.emitBinary(g, c, d);
      case "'":
        return a.emitQuoted(a, g, d);
      case "array":
        return com.cognitect.transit.impl.writer.emitArray(a, g, c, d);
      case "map":
        return com.cognitect.transit.impl.writer.emitMap(a, g, c, d);
      default:
        return com.cognitect.transit.impl.writer.emitEncoded(a, e, f, g, b, c, d);
    }
  } else {
    throw (a = com.cognitect.transit.handlers.constructor(b).name, c = Error("Cannot write " + a), c.data = {obj:b, type:a}, c);
  }
};
com.cognitect.transit.impl.writer.maybeQuoted = function(a, b) {
  var c = a.handler(b);
  if (null != c) {
    return 1 === c.tag(b).length ? com.cognitect.transit.types.quoted(b) : b;
  }
  var c = com.cognitect.transit.handlers.constructor(b).name, d = Error("Cannot write " + c);
  d.data = {obj:b, type:c};
  throw d;
};
com.cognitect.transit.impl.writer.marshalTop = function(a, b, c, d) {
  return JSON.stringify(com.cognitect.transit.impl.writer.marshal(a, com.cognitect.transit.impl.writer.maybeQuoted(a, b), c, d));
};
com.cognitect.transit.impl.writer.Writer = function(a, b) {
  this._marshaller = a;
  this.options = b || {};
  this.cache = !1 === this.options.cache ? null : this.options.cache ? this.options.cache : new com.cognitect.transit.caching.WriteCache;
};
com.cognitect.transit.impl.writer.Writer.prototype.marshaller = function() {
  return this._marshaller;
};
com.cognitect.transit.impl.writer.Writer.prototype.marshaller = com.cognitect.transit.impl.writer.Writer.prototype.marshaller;
com.cognitect.transit.impl.writer.Writer.prototype.write = function(a, b) {
  var c = null, c = b || {}, d = c.asMapKey || !1, e = this._marshaller.verbose ? !1 : this.cache, c = !1 === c.marshalTop ? com.cognitect.transit.impl.writer.marshal(this._marshaller, a, d, e) : com.cognitect.transit.impl.writer.marshalTop(this._marshaller, a, d, e);
  null != this.cache && this.cache.clear();
  return c;
};
com.cognitect.transit.impl.writer.Writer.prototype.write = com.cognitect.transit.impl.writer.Writer.prototype.write;
com.cognitect.transit.impl.writer.Writer.prototype.register = function(a, b) {
  this._marshaller.registerHandler(a, b);
};
com.cognitect.transit.impl.writer.Writer.prototype.register = com.cognitect.transit.impl.writer.Writer.prototype.register;
var TRANSIT_DEV = !0, TRANSIT_NODE_TARGET = !0, TRANSIT_BROWSER_TARGET = !1, TRANSIT_BROWSER_AMD_TARGET = !1;
com.cognitect.transit.reader = function(a, b) {
  if ("json" === a || "json-verbose" === a || null == a) {
    var c = new com.cognitect.transit.impl.reader.JSONUnmarshaller(b);
    return new com.cognitect.transit.impl.reader.Reader(c, b);
  }
  throw Error("Cannot create reader of type " + a);
};
com.cognitect.transit.writer = function(a, b) {
  if ("json" === a || "json-verbose" === a || null == a) {
    "json-verbose" === a && (null == b && (b = {}), b.verbose = !0);
    var c = new com.cognitect.transit.impl.writer.JSONMarshaller(b);
    return new com.cognitect.transit.impl.writer.Writer(c, b);
  }
  c = Error('Type must be "json"');
  c.data = {type:a};
  throw c;
};
com.cognitect.transit.makeWriteHandler = function(a) {
  var b = function() {
  };
  b.prototype.tag = a.tag;
  b.prototype.rep = a.rep;
  b.prototype.stringRep = a.stringRep;
  b.prototype.getVerboseHandler = a.getVerboseHandler;
  return new b;
};
com.cognitect.transit.makeBuilder = function(a) {
  var b = function() {
  };
  b.prototype.init = a.init;
  b.prototype.add = a.add;
  b.prototype.finalize = a.finalize;
  b.prototype.fromArray = a.fromArray;
  return new b;
};
com.cognitect.transit.date = com.cognitect.transit.types.date;
com.cognitect.transit.integer = com.cognitect.transit.types.intValue;
com.cognitect.transit.isInteger = com.cognitect.transit.types.isInteger;
com.cognitect.transit.uuid = com.cognitect.transit.types.uuid;
com.cognitect.transit.isUUID = com.cognitect.transit.types.isUUID;
com.cognitect.transit.bigInt = com.cognitect.transit.types.bigInteger;
com.cognitect.transit.isBigInt = com.cognitect.transit.types.isBigInteger;
com.cognitect.transit.bigDec = com.cognitect.transit.types.bigDecimalValue;
com.cognitect.transit.isBigDec = com.cognitect.transit.types.isBigDecimal;
com.cognitect.transit.keyword = com.cognitect.transit.types.keyword;
com.cognitect.transit.isKeyword = com.cognitect.transit.types.isKeyword;
com.cognitect.transit.symbol = com.cognitect.transit.types.symbol;
com.cognitect.transit.isSymbol = com.cognitect.transit.types.isSymbol;
com.cognitect.transit.binary = com.cognitect.transit.types.binary;
com.cognitect.transit.isBinary = com.cognitect.transit.types.isBinary;
com.cognitect.transit.uri = com.cognitect.transit.types.uri;
com.cognitect.transit.isURI = com.cognitect.transit.types.isURI;
com.cognitect.transit.map = com.cognitect.transit.types.map;
com.cognitect.transit.isMap = com.cognitect.transit.types.isMap;
com.cognitect.transit.set = com.cognitect.transit.types.set;
com.cognitect.transit.isSet = com.cognitect.transit.types.isSet;
com.cognitect.transit.list = com.cognitect.transit.types.list;
com.cognitect.transit.isList = com.cognitect.transit.types.isList;
com.cognitect.transit.quoted = com.cognitect.transit.types.quoted;
com.cognitect.transit.isQuoted = com.cognitect.transit.types.isQuoted;
com.cognitect.transit.tagged = com.cognitect.transit.types.taggedValue;
com.cognitect.transit.isTaggedValue = com.cognitect.transit.types.isTaggedValue;
com.cognitect.transit.link = com.cognitect.transit.types.link;
com.cognitect.transit.isLink = com.cognitect.transit.types.isLink;
com.cognitect.transit.hash = com.cognitect.transit.eq.hashCode;
com.cognitect.transit.hashMapLike = com.cognitect.transit.eq.hashMapLike;
com.cognitect.transit.hashMapLike = com.cognitect.transit.eq.hashArrayLike;
com.cognitect.transit.equals = com.cognitect.transit.eq.equals;
com.cognitect.transit.extendToEQ = com.cognitect.transit.eq.extendToEQ;
com.cognitect.transit.mapToObject = function(a) {
  var b = {};
  a.forEach(function(a, d) {
    if ("string" !== typeof d) {
      throw Error("Cannot convert map with non-string keys");
    }
    b[d] = a;
  });
  return b;
};
com.cognitect.transit.decoder = com.cognitect.transit.impl.decoder.decoder;
com.cognitect.transit.UUIDfromString = com.cognitect.transit.types.UUIDfromString;
com.cognitect.transit.randomUUID = com.cognitect.transit.types.randomUUID;
com.cognitect.transit.stringableKeys = com.cognitect.transit.impl.writer.stringableKeys;
TRANSIT_BROWSER_TARGET && (goog.exportSymbol("transit.reader", com.cognitect.transit.reader), goog.exportSymbol("transit.writer", com.cognitect.transit.writer), goog.exportSymbol("transit.makeBuilder", com.cognitect.transit.makeBuilder), goog.exportSymbol("transit.makeWriteHandler", com.cognitect.transit.makeWriteHandler), goog.exportSymbol("transit.date", com.cognitect.transit.types.date), goog.exportSymbol("transit.integer", com.cognitect.transit.types.intValue), goog.exportSymbol("transit.isInteger", 
com.cognitect.transit.types.isInteger), goog.exportSymbol("transit.uuid", com.cognitect.transit.types.uuid), goog.exportSymbol("transit.isUUID", com.cognitect.transit.types.isUUID), goog.exportSymbol("transit.bigInt", com.cognitect.transit.types.bigInteger), goog.exportSymbol("transit.isBigInt", com.cognitect.transit.types.isBigInteger), goog.exportSymbol("transit.bigDec", com.cognitect.transit.types.bigDecimalValue), goog.exportSymbol("transit.isBigDec", com.cognitect.transit.types.isBigDecimal), 
goog.exportSymbol("transit.keyword", com.cognitect.transit.types.keyword), goog.exportSymbol("transit.isKeyword", com.cognitect.transit.types.isKeyword), goog.exportSymbol("transit.symbol", com.cognitect.transit.types.symbol), goog.exportSymbol("transit.isSymbol", com.cognitect.transit.types.isSymbol), goog.exportSymbol("transit.binary", com.cognitect.transit.types.binary), goog.exportSymbol("transit.isBinary", com.cognitect.transit.types.isBinary), goog.exportSymbol("transit.uri", com.cognitect.transit.types.uri), 
goog.exportSymbol("transit.isURI", com.cognitect.transit.types.isURI), goog.exportSymbol("transit.map", com.cognitect.transit.types.map), goog.exportSymbol("transit.isMap", com.cognitect.transit.types.isMap), goog.exportSymbol("transit.set", com.cognitect.transit.types.set), goog.exportSymbol("transit.isSet", com.cognitect.transit.types.isSet), goog.exportSymbol("transit.list", com.cognitect.transit.types.list), goog.exportSymbol("transit.isList", com.cognitect.transit.types.isList), goog.exportSymbol("transit.quoted", 
com.cognitect.transit.types.quoted), goog.exportSymbol("transit.isQuoted", com.cognitect.transit.types.isQuoted), goog.exportSymbol("transit.tagged", com.cognitect.transit.types.taggedValue), goog.exportSymbol("transit.isTaggedValue", com.cognitect.transit.types.isTaggedValue), goog.exportSymbol("transit.link", com.cognitect.transit.types.link), goog.exportSymbol("transit.isLink", com.cognitect.transit.types.isLink), goog.exportSymbol("transit.hash", com.cognitect.transit.eq.hashCode), goog.exportSymbol("transit.hashMapLike", 
com.cognitect.transit.eq.hashMapLike), goog.exportSymbol("transit.hashArrayLike", com.cognitect.transit.eq.hashArrayLike), goog.exportSymbol("transit.equals", com.cognitect.transit.eq.equals), goog.exportSymbol("transit.extendToEQ", com.cognitect.transit.eq.extendToEQ), goog.exportSymbol("transit.mapToObject", com.cognitect.transit.mapToObject), goog.exportSymbol("transit.decoder", com.cognitect.transit.impl.decoder.decoder), goog.exportSymbol("transit.UUIDfromString", com.cognitect.transit.types.UUIDfromString), 
goog.exportSymbol("transit.randomUUID", com.cognitect.transit.types.randomUUID), goog.exportSymbol("transit.stringableKeys", com.cognitect.transit.impl.writer.stringableKeys));
TRANSIT_NODE_TARGET && (module.exports = {reader:com.cognitect.transit.reader, writer:com.cognitect.transit.writer, makeBuilder:com.cognitect.transit.makeBuilder, makeWriteHandler:com.cognitect.transit.makeWriteHandler, date:com.cognitect.transit.types.date, integer:com.cognitect.transit.types.intValue, isInteger:com.cognitect.transit.types.isInteger, uuid:com.cognitect.transit.types.uuid, isUUID:com.cognitect.transit.types.isUUID, bigInt:com.cognitect.transit.types.bigInteger, isBigInt:com.cognitect.transit.types.isBigInteger, 
bigDec:com.cognitect.transit.types.bigDecimalValue, isBigDec:com.cognitect.transit.types.isBigDecimal, keyword:com.cognitect.transit.types.keyword, isKeyword:com.cognitect.transit.types.isKeyword, symbol:com.cognitect.transit.types.symbol, isSymbol:com.cognitect.transit.types.isSymbol, binary:com.cognitect.transit.types.binary, isBinary:com.cognitect.transit.types.isBinary, uri:com.cognitect.transit.types.uri, isURI:com.cognitect.transit.types.isURI, map:com.cognitect.transit.types.map, isMap:com.cognitect.transit.types.isMap, 
set:com.cognitect.transit.types.set, isSet:com.cognitect.transit.types.isSet, list:com.cognitect.transit.types.list, isList:com.cognitect.transit.types.isList, quoted:com.cognitect.transit.types.quoted, isQuoted:com.cognitect.transit.types.isQuoted, tagged:com.cognitect.transit.types.taggedValue, isTaggedValue:com.cognitect.transit.types.isTaggedValue, link:com.cognitect.transit.types.link, isLink:com.cognitect.transit.types.isLink, hash:com.cognitect.transit.eq.hashCode, hashArrayLike:com.cognitect.transit.eq.hashArrayLike, 
hashMapLike:com.cognitect.transit.eq.hashMapLike, equals:com.cognitect.transit.eq.equals, extendToEQ:com.cognitect.transit.eq.extendToEQ, mapToObject:com.cognitect.transit.mapToObject, decoder:com.cognitect.transit.impl.decoder.decoder, UUIDfromString:com.cognitect.transit.types.UUIDfromString, randomUUID:com.cognitect.transit.types.randomUUID, stringableKeys:com.cognitect.transit.impl.writer.stringableKeys});


},{}],149:[function(require,module,exports){
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

},{"immutable":4,"transit-js":148}],"react":[function(require,module,exports){
module.exports = require('./lib/React');

},{"./lib/React":31}]},{},[1]);
