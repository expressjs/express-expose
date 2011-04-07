
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
  
  'test app.expose(obj)': function(){
    var app = express.createServer();
    app.set('title', 'My Site');
    app.set('default language', 'en');
    app.expose(app.settings);
     app.js.exposed.should.have.length(1);
  },
  
  'test app.expose(obj, namespace, name)': function(){
    var app = express.createServer();
    app.set('title', 'My Site');
    app.set('default language', 'en');
    app.expose(app.settings, 'express.settings', 'settings');
    app.expose({ foo: 'bar' }, 'express.utils', 'settings');
     app.js.settings.should.have.length(2);
  },
  
  'test app.expose()': function(){
    var app = express.createServer();
    app.expose({ one: 1, two: 2, three: 3 });
    app.expose({ title: 'My Site' }, 'express.settings');
    app.expose({ add: function(a, b){ return a + b; } }, 'utils');
    var js = app.expose()
      , scope = {};
    
    vm.runInNewContext(js, scope);
    scope.express.one.should.equal(1);
    scope.express.two.should.equal(2);
    scope.express.three.should.equal(3);
    
    scope.express.settings.title.should.equal('My Site');
    scope.utils.add(1,5).should.equal(6);
  }
};