
/**
 * Module dependencies.
 */

var express = require('express')
  , expose = require('../')
  , assert = require('assert')
  , should = require('should')
  , vm = require('vm');

module.exports = {
  'test .version': function(){
    expose.version.should.match(/^\d+\.\d+\.\d+$/);
  },
  
  'test app.expose(name)': function(){
    var app = express.createServer();
    app.expose({ one: 1, two: 2, three: 3 });
    app.expose({ title: 'My Site' }, 'express.settings');
    app.expose({ add: function(a, b){ return a + b; } }, 'utils');
    app.expose({ en: 'English' }, 'langs', 'langs');

    var js = app.exposed()
      , scope = {};

    scope.window = scope;
    vm.runInNewContext(js, scope);
    scope.express.one.should.equal(1);
    scope.express.two.should.equal(2);
    scope.express.three.should.equal(3);
    
    scope.express.settings.title.should.equal('My Site');
    scope.utils.add(1,5).should.equal(6);

    var js = app.exposed('langs')
      , scope = {};

    scope.window = scope;
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
  },
  
  'test app.expose(fn) self-calling function': function(){
    var app = express.createServer()
      , err;

    app.expose('var foo;')
    app.expose(function(){
      foo = 'bar';
      var bar = 'bar';
    });

    app.expose('var name;', 'foot');
    app.expose(function(){
      name = 'tj';
    }, 'foot');

    var js = app.exposed()
      , scope = {};

    vm.runInNewContext(js, scope);
    scope.foo.should.equal('bar');
    scope.should.not.have.property('bar');
    scope.should.not.have.property('name');

    var js = app.exposed('foot')
      , scope = {};

    scope.window = scope;
    vm.runInNewContext(js, scope);
    scope.should.not.have.property('foo');
    scope.name.should.equal('tj');
  },
  
  'test app.expose(fn) named function': function(){
    var app = express.createServer()
      , err;

    app.expose(function add(a, b){
      return a + b;
    });

    app.expose(function sub(a, b){
      return a - b;
    }, 'foot');

    var js = app.exposed()
      , scope = {};

    scope.window = scope;
    vm.runInNewContext(js, scope);
    scope.add(1,3).should.equal(4);
    scope.should.not.have.property('sub');

    var js = app.exposed('foot')
      , scope = {};

    scope.window = scope;
    vm.runInNewContext(js, scope);
    scope.sub(8,7).should.equal(1);
    scope.should.not.have.property('add');
  },
  
  'test app.exposeModule(path)': function(){
    var app = express.createServer();

    app.exposeModule(__dirname + '/fixtures/color');

    var js = app.exposed()
      , scope = {};

    scope.window = scope;
    vm.runInNewContext(js, scope);
    scope.color.light('#ffffff').should.be.true;
    scope.color.light('#000000').should.be.false;
  },
  
  'test app.exposeModule(path, namespace)': function(){
    var app = express.createServer();

    app.exposeModule(__dirname + '/fixtures/color', 'utils.color');

    var js = app.exposed()
      , scope = {};

    scope.window = scope;
    vm.runInNewContext(js, scope);
    scope.utils.color.light('#ffffff').should.be.true;
    scope.utils.color.light('#000000').should.be.false;
  },
  
  // 'test res.expose(path)': function(){
  //   var app = express.createServer()
  //     , calls = 0;
  // 
  //   app.set('views', __dirname + '/views');
  //   app.set('view options', { layout: false });
  // 
  //   app.expose({ one: 1 });
  // 
  //   app.get('/', function(req, res){
  //     res.expose({ two: 2 });
  //     if (++calls == 1) res.expose({ name: 'tj' }, 'express.current.user');
  //     res.render('index.jade');
  //   });
  // 
  //   assert.response(app,
  //     { url: '/' },
  //     function(res){
  //       var scope = {};
  //       vm.runInNewContext(res.body, scope);
  //       if (1 == calls) scope.express.current.user.name.should.equal('tj');
  //       else should.equal(null, scope.express.current);
  //       scope.express.one.should.equal(1);
  //       scope.express.two.should.equal(2);
  //     });
  // 
  //   assert.response(app,
  //     { url: '/' },
  //     function(res){
  //       var scope = {};
  //       vm.runInNewContext(res.body, scope);
  //       if (1 == calls) scope.express.current.user.name.should.equal('tj');
  //       else should.equal(null, scope.express.current);
  //       scope.express.one.should.equal(1);
  //       scope.express.two.should.equal(2);
  //     });
  // },
  
  'test app.exposeRequire()': function(){
    var app = express.createServer();

    app.set('title', 'something');
    app.exposeRequire();
    app.expose(app.settings, 'settings');
    app.exposeModule(__dirname + '/fixtures/color');
    app.exposeModule(__dirname + '/fixtures/color', 'express/utils/color');

    app.exposeModule(__dirname + '/fixtures/math');
    app.exposeModule(__dirname + '/fixtures/math/sub', 'math/sub');

    var js = app.exposed()
      , scope = {};

    scope.window = scope;
    vm.runInNewContext(js, scope);
    scope.require('settings').title.should.equal('something');
    scope.require('express/utils/color').light('ffffff').should.be.true;
    scope.require('color').light('ffffff').should.be.true;
    scope.require('math/sub').sub(3, 3).should.equal(6);
  }
};