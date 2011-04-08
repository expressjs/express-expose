
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
 * @param {Object|String|Function} obj
 * @param {String} namespace
 * @param {String} name
 * @return {HTTPServer} for chaining
 * @api public
 */

HTTPServer.prototype.expose =
HTTPSServer.prototype.expose = function(obj, namespace, name){
  this._exposed = this._exposed || {};

  // support second arg as name
  // when a string or function is given
  if ('string' == typeof obj || 'function' == typeof obj) {
    name = namespace || exports.name;
  } else {
    name = name || exports.name;
    namespace = namespace || exports.namespace;    
  }


  // register dynamic helper
  if (!this._exposed[name]) {
    this._exposed = {};
    var helpers = {};
    helpers[name] = function(){ return this.exposed(name); };
    this.dynamicHelpers(helpers);
  }

  // buffer string
  if ('string' == typeof obj) {
    this.js = this.js || {};
    var buf = this.js[name] = this.js[name] || [];
    buf.push(obj);
  // buffer function
  } else if ('function' == typeof obj && obj.name) {
  // buffer self-calling function
  } else if ('function' == typeof obj) {
    this.expose(';(' + obj + ')();');
  // buffer object
  } else {
    namespace = renderNamespace(namespace);
    this.expose(namespace.string, name);
    this.expose(renderObject(obj, namespace.prop), name);
    this.expose('\n');
  }

  return this;
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
 * Render the given `obj` against `namespace`.
 *
 * @param {Object} obj
 * @param {String} namespace
 * @return {String}
 * @api private
 */

function renderObject(obj, namespace) {
  return Object.keys(obj).map(function(key){
    var val = obj[key];
    return namespace + '["' + key + '"] = ' + string(val) + ';';
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
 *    foo.bar.baz = foo.bar.baz || {};
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function renderNamespace(str){
  var parts = []
    , split = str.split('.')
    , len = split.length
    , ret = {};
 
  ret.string = str.split('.').map(function(part, i){
    parts.push(part);
    part = parts.join('.');
    ret.prop = part;
    return (i ? '' : 'var ') + part + ' = ' + part + ' || {};';
  }).join('\n');

  return ret;
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