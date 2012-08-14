
/**
 * Module dependencies.
 */

var express = require('express')
  , expose = require('../')
  , assert = require('assert')
  , should = require('should')
  , vm = require('vm')
  , request = require('supertest');

module.exports = {
  'test app.expose(name)': function(){
    var app = express();
    app.expose({ one: 1, two: 2, three: 3 });
    app.expose({ title: 'My Site' }, 'app.settings');
    app.expose({ add: function(a, b){ return a + b; } }, 'utils');
    app.expose({ en: 'English' }, 'langs', 'langs');

    var js = app.exposed()
      , scope = {};

    scope.window = scope;
    vm.runInNewContext(js, scope);
    scope.app.one.should.equal(1);
    scope.app.two.should.equal(2);
    scope.app.three.should.equal(3);
    
    scope.app.settings.title.should.equal('My Site');
    scope.utils.add(1,5).should.equal(6);

    var js = app.exposed('langs')
      , scope = {};

    scope.window = scope;
    vm.runInNewContext(js, scope);
    scope.should.not.have.property('express');
    scope.langs.en.should.equal('English');
  },
  
  'test app.expose(str)': function(){
    var app = express();

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
    var app = express();

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
    var app = express()
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
    var app = express()
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

  'test res.expose(str)': function(done){
    var app = express();
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');

    app.expose('var user = { name: "tj" };')
    app.expose('user.id = 50;')

    app.get('/', function(req, res) {
      res.expose('var lang = "en";');
      res.expose('var country = "no";');
      res.render('index');
    });

    request(app)
      .get('/')
      .end(function(err, res) {
        if (err) throw err;

        var scope = {};
        vm.runInNewContext(res.text, scope);
        scope.user.name.should.equal('tj');
        scope.user.id.should.equal(50);
        scope.country.should.equal('no');
        scope.lang.should.equal('en');
        done();
      });
  },
};