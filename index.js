var staticCache = require('koa-static-cache');
var koa = require('koa.io');
var path = require('path');
var fs = require('fs');

var db = require('./api/db'),
    RoomsModel = require('./api/rooms/model'),
    RoomsEndpoint = require('./api/rooms/endpoint');


var app = koa();

var port = process.env.PORT || 3000;

// Routing
app.use(staticCache(path.join(__dirname, 'public')));

app.use(function*() {
  this.body = fs.createReadStream(path.join(__dirname, 'public/index.html'));
  this.type = 'html';
});

app.listen(port, function() {
  console.log('Server listening at port %d', port);
});


var dbClient = db.createClient();

var rooms = new RoomsModel(dbClient);

RoomsEndpoint.configure(rooms, app);