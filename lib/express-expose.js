
/*!
 * express-expose
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var express = require('express')
  , HTTPSServer = express.HTTPSServer
  , HTTPServer = express.HTTPServer;

/**
 * Library version.
 */

exports.version = '0.0.1';

/**
 * Default namespace.
 */

exports.namespace = 'express';

/**
 * Expose the given `obj` to the client-side, with
 * an optional `namespace` defaulting to "express".
 *
 * To render the expose javascript simply invoke `app.expose()`.
 *
 * @param {Object} obj
 * @param {String} namespace
 * @return {HTTPServer} for chaining
 * @api public
 */

HTTPServer.prototype.expose =
HTTPSServer.prototype.expose = function(obj, namespace){
  if (!arguments.length) return this.renderExposedJavaScript();
  this.js = this.js || [];
  namespace = namespace || exports.namespace;
  this.js.push({
      namespace: namespace
    , obj: obj
  })
};

/**
 * Render the exposed javascript.
 *
 * @return {String}
 * @api private
 */

HTTPServer.prototype.renderExposedJavaScript =
HTTPSServer.prototype.renderExposedJavaScript = function(){
  return this.js.map(function(js){
    var namespace = js.namespace
      , obj = js.obj
      , buf = [];

    if (~namespace.indexOf('.')) {
      buf.push(namespace + ' = (function(){');
    } else {
      buf.push('var ' + namespace + ' = (function(){');
    }

    buf.push('  var exports = {};');

    Object.keys(obj).forEach(function(key){
      var val = obj[key];
      buf.push('  exports.' + key + ' = ' + string(val) + ';');
    });

    buf.push('  return exports;');
    buf.push('})();');

    return buf.join('\n');
  }).join('\n\n');
};

/**
 * Return a string representation of `obj`.
 *
 * @param {Mixed} obj
 * @return {String}
 * @api private
 */

function string(obj) {
  if ('function' == typeof obj) {
    return obj.toString();
  } else {
    return JSON.stringify(obj);
  }
}