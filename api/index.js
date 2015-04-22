var redis  = require('redis'),
    redisClient = redis.createClient();

var co = require('co');

var coRedis = require('co-redis')(redisClient);

var Rooms = require('./rooms');


var rooms = new Rooms(coRedis);

co(function*() {

  // rooms
  console.log('get room aaa');
  var room = yield rooms.get('aaa');

  console.log('rooms', yield rooms.getAll());


  // members
  console.log('members (0)', yield room.members.getAll());

  console.log('add member klaus');
  yield room.members.add({ id: 'Klaus' });

  console.log('members (1)', yield room.members.getAll());

  console.log('remove member klaus');
  yield room.members.remove({ id: 'Klaus' });

  console.log('members (2)', yield room.members.getAll());


  // songs
  console.log('songs (0)', yield room.songs.getAll());

  console.log('add song abba');
  yield room.songs.add({ id: 'Abba' });

  console.log('add song foobar after Abba');
  yield room.songs.add({ id: 'foobar' }, 'AFTER', 'Abba');

  console.log('add song Kind before Abba');
  yield room.songs.add({ id: 'Kind' }, 'BEFORE', 'Abba');

  console.log('songs (1)', yield room.songs.getAll());

  console.log('remove song abba');
  yield room.songs.remove({ id: 'Abba' });

  console.log('songs (2)', yield room.songs.getAll());

  console.log('remove room aaa');
  yield rooms.remove('aaa');

  console.log('rooms', yield rooms.getAll());

  console.log('recreate room aaa');
  room = yield rooms.get('aaa');

  console.log('songs (3)', yield room.songs.getAll());
});