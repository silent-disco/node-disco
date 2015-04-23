var co = require('co'),
    db = require('./api/db');

var dbClient = db.createClient();

var Rooms = require('./api/rooms');

var rooms = new Rooms(dbClient);

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
  console.log('songs (0)', yield room.playlist.getAll());

  console.log('add song abba');
  yield room.playlist.add({ id: 'Abba' });

  console.log('add song foobar after Abba');
  yield room.playlist.add({ id: 'foobar' }, 'AFTER', 'Abba');

  console.log('add song Kind before Abba');
  yield room.playlist.add({ id: 'Kind' }, 'BEFORE', 'Abba');

  console.log('songs (1)', yield room.playlist.getAll());

  console.log('remove song abba');
  yield room.playlist.remove({ id: 'Abba' });

  console.log('songs (2)', yield room.playlist.getAll());

  console.log('remove room aaa');
  yield rooms.remove('aaa');

  // remove room
  console.log('rooms', yield rooms.getAll());

  // recreate it
  console.log('recreate room aaa');
  room = yield rooms.get('aaa');

  console.log('songs (3)', yield room.playlist.getAll());
  console.log('members (3)', yield room.members.getAll());

  dbClient.quit();
});