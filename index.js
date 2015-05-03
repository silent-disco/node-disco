var staticCache = require('koa-static-cache');
var koa = require('koa.io');
var path = require('path');
var fs = require('fs');

var db = require('./api/db');

var app = koa();

var port = process.env.PORT || 3000,
    host = process.env.HOST || '127.0.0.1';

var redisAuth = null,
    redisPort = 6379,
    redisHost = '127.0.0.1';

if (process.env.NODE_ENV === 'openshift') {
  port = process.env.OPENSHIFT_DIY_PORT;
  host = process.env.OPENSHIFT_DIY_IP;

  redisAuth = process.env.REDIS_PASSWORD;
  redisHost = process.env.OPENSHIFT_REDIS_HOST;
  redisPort = process.env.OPENSHIFT_REDIS_PORT;
}

var dbClient = db.createClient(redisPort, redisHost, { auth_pass: redisAuth });


// config

app.use(staticCache(path.join(__dirname, 'public')));

app.use(function*() {
  this.body = fs.createReadStream(path.join(__dirname, 'public/index.html'));
  this.type = 'html';
});

app.listen(port, host, function() {
  console.log('[node-disco] server listening at port %d', port);
});


// components

var Emitter = require('co-emitter'),
    RoomsModel = require('./api/rooms/model'),
    RoomsEndpoint = require('./api/rooms/endpoint'),
    LifeCycle = require('./api/life-cycle');


var events = new Emitter();

var rooms = new RoomsModel(dbClient);

LifeCycle.configure(events);

RoomsEndpoint.configure(events, rooms, app);
