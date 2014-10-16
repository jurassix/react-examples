var AppDispatcher, Dispatcher, copyProperties;

Dispatcher = require('flux').Dispatcher;
copyProperties = require("react/lib/copyProperties")

AppDispatcher = copyProperties(new Dispatcher(), {/* custom props here */});

module.exports = AppDispatcher;
