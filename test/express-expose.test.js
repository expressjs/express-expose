
/**
 * Module dependencies.
 */

var express-expose = require('express-expose')
  , should = require('should');

module.exports = {
  'test .version': function(){
    express-expose.version.should.match(/^\d+\.\d+\.\d+$/);
  }
};