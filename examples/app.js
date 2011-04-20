
// $ npm install express jade

/**
 * Module dependencies.
 */

var express = require('express')
  , expose = require('../')
  , app = express.createServer()
  , url = require('url');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('title', 'Example');
app.set('default language', 'en');

// expose all the settings to the client-side,
// with "express" as the default namespace.
// for example "express.title == 'Example'"
app.expose(app.settings);

// funtions are fine too, here we namespace as utils instead.
// use as "utils.add(1,2);"

// note that here we expose these functions as local variables
// to the template, as well as the client. 
var math = { add: function(a,b){ return a + b; } };
app.expose(math, 'utils').helpers(math);

app.expose({ sub: function(a,b){ return a - b; } }, 'express.utils');

// Sometimes you might want to output to a different area,
// so for this we can pass an additional param "languages"
// which tells express which buffer to write to, which ends
// up providing us with the local variable "languages"
app.expose({ en: 'English', fr: 'French' }, 'express', 'languages');

// we can also expose "raw" javascript
// by passing a string
app.expose('var some = "variable";');

// exposing a named function is easy too, simply pass it in
// with an optional buffer param for placement within a template

app.expose(function someFunction(){
  return 'yay';
}, 'foot');

// another alternative is passing an anonymous function,
// which executes itself, creating a "wrapper" function.

app.expose(function(){
  function notify() {
    alert('this will execute right away :D');
  }
  notify();
});

// expose entire modules to retain their own scope is simple too,
// simply pass the path, with optional namespace / buffer name.

// the following exposes "color.dark()", "color.light()" etc by default
// however we pass "utils.color" as a custom namespace.
app.exposeModule(__dirname + '/color', 'utils.color');

app.get('/', function(req, res){
  // we might want to expose some user
  // as the "express.current.user" global to the client
  var user = { name: 'tj' };
  res.expose(user, 'express.current.user');
  res.render('index', { layout: false });
});

app.listen(3000);
console.log('listening on port 3000');