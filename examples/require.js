
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
app.set('boot', new Date);

// tell express-expose that we want to
// use the commonjs module system, and
// not namespacing
app.exposeRequire();

// we can expose arrays as modules if we wish
app.expose([function(){ return 'yay'; }], 'array');

// or regular objects, the functions are always
// serialized appropriately
app.expose(app.settings, 'settings');
app.expose({ add: function(a, b){ return a + b; }}, 'utils');

// by default the module name be the basename, so
// "color" in this case, however we explicitly pass "utils/color"
app.exposeModule(__dirname + '/color', 'utils/color');

app.get('/', function(req, res){
  res.render('index', { layout: false });
});

app.listen(3000);
console.log('listening on port 3000');