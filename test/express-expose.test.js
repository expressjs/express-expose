
/**
 * Module dependencies.
 */

var express = require('express')
  , expose = require('express-expose')
  , should = require('should')
  , vm = require('vm');

module.exports = {
  'test .version': function(){
    expose.version.should.match(/^\d+\.\d+\.\d+$/);
  },
  
  'test app.expose(name)': function(){
    var app = express.createServer();
    app.expose({ one: 1, two: 2, three: 3 }, 'express');
    app.expose({ title: 'My Site' }, 'express.settings');
    app.expose({ add: function(a, b){ return a + b; } }, 'utils');
    app.expose({ en: 'English' }, 'langs', 'langs');

    var js = app.exposed()
      , scope = {};
    
    vm.runInNewContext(js, scope);
    scope.express.one.should.equal(1);
    scope.express.two.should.equal(2);
    scope.express.three.should.equal(3);
    
    scope.express.settings.title.should.equal('My Site');
    scope.utils.add(1,5).should.equal(6);

    var js = app.exposed('langs')
      , scope = {};

    vm.runInNewContext(js, scope);
    scope.should.not.have.property('express');
    scope.langs.en.should.equal('English');
  },
  
  'test app.expose(str)': function(){
    var app = express.createServer();

    app
      .expose('var user = { name: "tj" };')
      .expose('var lang = "en";');

    var js = app.exposed()
      , scope = {};

    vm.runInNewContext(js, scope);
    scope.lang.should.equal('en');
    scope.user.name.should.equal('tj');
  },
  
  'test app.expose(str, null, scope)': function(){
    var app = express.createServer();

    app
      .expose('var user = { name: "tj" };', 'foot')
      .expose('var lang = "en";');

    var js = app.exposed()
      , scope = {};

    vm.runInNewContext(js, scope);
    scope.lang.should.equal('en');
    scope.should.not.have.property('user');

    js = app.exposed('foot');
    vm.runInNewContext(js, scope = {});
    scope.should.not.have.property('lang');
    scope.user.name.should.equal('tj');
  }
};