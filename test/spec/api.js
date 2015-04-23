var db = require('../../api/db');

var Rooms = require('../../api/rooms');


describe('api', function() {

  var dbClient;

  before(function() {
    dbClient = db.createClient();
  });

  after(function() {
    dbClient.quit();
  });


  describe('rooms', function() {

    var rooms;

    beforeEach(function() {
      rooms = new Rooms(dbClient);
    });

    afterEach(function*() {
      yield rooms.clear();
    });


    it('should get', function*() {

      // when
      yield rooms.get('aaa');

      // then
      expect(yield rooms.getAll()).to.eql([ 'aaa' ]);
    });


    it('should remove', function*() {

      // given
      yield rooms.get('aaa');

      // when
      yield rooms.remove('aaa');

      // then
      expect(yield rooms.getAll()).to.be.empty;
    });


    describe('members', function() {

      it('should access', function*() {

        // given
        var room = yield rooms.get('aaa');

        // then
        var members = yield room.members.getAll();

        // then
        expect(members).to.be.empty;
      });


      it('should add', function*() {

        // given
        var room = yield rooms.get('aaa');

        // when
        yield room.members.add({ id: 'Klaus' });

        // then
        var members = yield room.members.getAll();

        expect(members).to.eql({ 'Klaus': { id: 'Klaus' } });
      });


      it('should remove', function*() {

        // given
        var room = yield rooms.get('aaa');

        // with member
        yield room.members.add({ id: 'Klaus' });


        // when
        room.members.remove('Klaus');

        // then
        var members = yield room.members.getAll();

        expect(members).to.be.empty;
      });

    });


    describe('playlist', function() {

      it('should access', function*() {

        // given
        var room = yield rooms.get('aaa');

        // then
        var playlist = yield room.playlist.getAll();

        // then
        expect(playlist).to.be.empty;
      });


      it('should add', function*() {

        // given
        var room = yield rooms.get('aaa');

        // when
        yield room.playlist.add({ id: 'Abba' });

        // then
        var playlist = yield room.playlist.getAll();

        expect(playlist).to.eql([ { id: 'Abba' } ]);
      });


      it('should append', function*() {

        // given
        var room = yield rooms.get('aaa');

        // with Abba
        yield room.playlist.add({ id: 'Abba' });

        // when
        yield room.playlist.add({ id: 'foobar' });

        // then
        var playlist = yield room.playlist.getAll();

        expect(playlist).to.eql([ { id: 'Abba' }, { id: 'foobar' } ]);
      });


      it('should insert before', function*() {

        // given
        var room = yield rooms.get('aaa');

        // with two songs
        yield room.playlist.add({ id: 'Abba' });
        yield room.playlist.add({ id: 'Beethoven' });

        // when
        yield room.playlist.add({ id: 'foobar' }, 'BEFORE', 'Beethoven');

        // then
        var playlist = yield room.playlist.getAll();

        expect(playlist).to.eql([ { id: 'Abba' }, { id: 'foobar' }, { id: 'Beethoven' } ]);
      });


      it('should insert after', function*() {

        // given
        var room = yield rooms.get('aaa');

        // with two songs
        yield room.playlist.add({ id: 'Abba' });
        yield room.playlist.add({ id: 'Beethoven' });

        // when
        yield room.playlist.add({ id: 'foobar' }, 'AFTER', 'Beethoven');

        // then
        var playlist = yield room.playlist.getAll();

        expect(playlist).to.eql([ { id: 'Abba' }, { id: 'Beethoven' }, { id: 'foobar' } ]);
      });


      it('should remove', function*() {

        // given
        var room = yield rooms.get('aaa');

        // with two songs
        yield room.playlist.add({ id: 'Abba' });
        yield room.playlist.add({ id: 'Beethoven' });

        // when
        yield room.playlist.remove({ id: 'Abba' });

        // then
        var playlist = yield room.playlist.getAll();

        expect(playlist).to.eql([ { id: 'Beethoven' } ]);
      });


      it('should empty', function*() {

        // given
        var room = yield rooms.get('aaa');

        // with one songs
        yield room.playlist.add({ id: 'Beethoven' });

        // when
        yield room.playlist.remove('Beethoven');

        // then
        var playlist = yield room.playlist.getAll();

        expect(playlist).to.be.empty;
      });

    });

  });

});