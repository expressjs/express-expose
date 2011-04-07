
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
 * To render the expose javascript simply invoke `app.expose([name])`.
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
  name = name || 'exposed';
  obj = obj || 'exposed';
  namespace = namespace || exports.namespace;

  // render
  if ('string' == typeof obj) return this.renderExposedJavaScript(obj);

  // register dynamic helper
  if (!this._exposed[name]) {
    this._exposed = {};
    var helpers = {};
    helpers[name] = function(){ return this.expose(name); };
    this.dynamicHelpers(helpers);
  }

  // buffer
  this.js = this.js || {};
  this.js[name] = this.js[name] || [];
  this.js[name].push({
      namespace: namespace
    , obj: obj
  });
};

/**
 * Render the exposed javascript.
 *
 * @return {String}
 * @api private
 */

HTTPServer.prototype.renderExposedJavaScript =
HTTPSServer.prototype.renderExposedJavaScript = function(name){
  if (!this.js[name]) throw new Error('no javascript buffered for "' + name + '"');
  return this.js[name].map(function(js){
    var namespace = js.namespace
      , obj = js.obj
      , buf = [];

    buf.push(renderNamespace(namespace));
    buf.push(namespace + ' = (function(){');
    buf.push('  var exports = {};');

    Object.keys(obj).forEach(function(key){
      var val = obj[key];
      buf.push('  exports["' + key + '"] = ' + string(val) + ';');
    });

    buf.push('  return exports;');
    buf.push('})();');

    return buf.join('\n');
  }).join('\n\n');
};

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
  var parts = [];
  return str.split('.').map(function(part, i){
    parts.push(part);
    part = parts.join('.');
    return (i ? '' : 'var ') + part + ' = ' + part + ' || {};';
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