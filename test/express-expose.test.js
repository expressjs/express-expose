
/**
 * Module dependencies.
 */

var express = require('express')
  , expose = require('express-expose')
  , should = require('should');

module.exports = {
  'test .version': function(){
    expose.version.should.match(/^\d+\.\d+\.\d+$/);
  }
};