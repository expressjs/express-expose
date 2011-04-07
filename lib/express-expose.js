
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
 * Default local variable name.
 */

exports.name = 'javascript';

/**
 * Expose the given `obj` to the client-side, with
 * an optional `namespace` defaulting to "express".
 *
 * @param {Object|String} obj
 * @param {String} namespace
 * @param {String} name
 * @return {HTTPServer} for chaining
 * @api public
 */

HTTPServer.prototype.expose =
HTTPSServer.prototype.expose = function(obj, namespace, name){
  this._exposed = this._exposed || {};
  name = name || exports.name;
  namespace = namespace || exports.namespace;

  // register dynamic helper
  if (!this._exposed[name]) {
    this._exposed = {};
    var helpers = {};
    helpers[name] = function(){ return this.exposed(name); };
    this.dynamicHelpers(helpers);
  }

  // buffer
  this.js = this.js || {};
  var buf = this.js[name] = this.js[name] || [];
  buf.push(renderNamespace(namespace) + ' = (function(){');
  buf.push('  var exports = {};');
  buf.push(renderObject(obj));
  buf.push('  return exports;');
  buf.push('})();');
  buf.push('\n');
};

/**
 * Render the exposed javascript.
 *
 * @return {String}
 * @api private
 */

HTTPServer.prototype.exposed =
HTTPSServer.prototype.exposed = function(name){
  name = name || exports.name;
  if (!this.js[name]) throw new Error('no javascript buffered for "' + name + '"');
  return this.js[name].join('\n');
};

/**
 * Render the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function renderObject(obj) {
  return Object.keys(obj).map(function(key){
    var val = obj[key];
    return '  exports["' + key + '"] = ' + string(val) + ';';
  }).join('\n');
}

/**
 * Render a namespace from the given `str`.
 *
 * Examples:
 *
 *    renderNamespace('foo.bar.baz');
 *
 *    var foo = foo || {};
 *    foo.bar = foo.bar || {};
 *    foo.bar.baz
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function renderNamespace(str){
  var parts = []
    , split = str.split('.')
    , len = split.length;
 
  return str.split('.').map(function(part, i){
    parts.push(part);
    part = parts.join('.');
    var js = i ? '' : 'var ';
    if (i < len - 1) {
      js += part + ' = ' + part + ' || {};';
    } else {
      js += part;
    }
    return js;
  }).join('\n');
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