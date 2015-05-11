var Config = require('../../../config/key-value');

var SoundCloud = require('../../../player/soundcloud');

var Promise = require('promise');


describe('player/soundcloud', function() {

  var config = new Config({
    soundcloudClientId: 'e158f9f9cb11f3e88ab951b19ac39544'
  });


  var soundCloud = new SoundCloud(config);


  describe('isSong', function() {

    it('should detect valid url', function() {

      // given
      var validUrl = 'https://soundcloud.com/allefarben/alle-farben-fusion-secret-gig';

      // when
      var isValid = Promise.resolve(soundCloud.isSong(validUrl));

      // then
      expect(isValid).to.eventually.be.true;
    });


    it('should detect invalid url', function() {

      // given
      var invalidUrl = 'http://not-a-song';

      // when
      var isValid = Promise.resolve(soundCloud.isSong(invalidUrl));

      // then
      return Promise.all([
        expect(isValid).to.eventually.be.false,
      ]);
    });

  });


  describe('fetchInfo', function() {

    it('should fetch info by url', function() {

      // given
      var songUrl = 'https://soundcloud.com/5d-records/jamason-busch-piraten-camp-572014-pt1';

      var expectedSong = {
        name: 'Jamason @ Busch Piraten Camp - 5.7.2014  Pt.1',
        description: 'Wildlife experience',
        duration: 11889361,
        streamable: true,
        streamUrl: 'https://api.soundcloud.com/tracks/157399267/stream',
        permalinkUrl: 'http://soundcloud.com/5d-records/jamason-busch-piraten-camp-572014-pt1',
        pictureUrl: 'https://i1.sndcdn.com/artworks-000084315884-xwg05i-large.jpg',
        uri: 'https://api.soundcloud.com/tracks/157399267',
        artist: {
          name: '5D=↑5',
          pictureUrl: 'https://i1.sndcdn.com/avatars-000121515607-lpu000-large.jpg',
          permalinkUrl: 'http://soundcloud.com/5d-records',
          uri: 'https://api.soundcloud.com/users/372608'
        }
      };

      // when
      var song = soundCloud.fetchInfo(songUrl);

      // then
      return Promise.all([
        expect(song).to.eventually.eql(expectedSong)
      ]);
    });


    it('should handle invalid url with error', function() {

      // given
      var songUrl = 'http://not-a-song';

      // when
      var song = soundCloud.fetchInfo(songUrl);

      // then
      return Promise.all([
        expect(song).to.eventually.be.rejectedWith('404 - Not Found')
      ]);
    });


    it('should handle playlist url with error', function() {

      // given
      var playlistUrl = 'https://soundcloud.com/hi-speed/sets/jamz-buschpiratencamp';

      // when
      var song = soundCloud.fetchInfo(playlistUrl);

      // then
      return Promise.all([
        expect(song).to.eventually.be.rejectedWith('not a track but a playlist')
      ]);
    });

  });


  describe('play', function() {

    this.timeout(10000);


    afterEach(function() {
      return soundCloud.stop().then(function(result) {
        console.log('stopped', result);

        return result;
      });
    });

    function wait(time) {

      return function(result) {
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve(result);
          }, time);
        });
      };
    }

    function play(url) {
      return soundCloud.fetchInfo(url).then(function(song) {
        return soundCloud.play(song);
      }).then(wait(1000));
    }


    it('should play song', function() {

      // given
      var songUrl = 'https://soundcloud.com/allefarben/alle-farben-fusion-secret-gig';

      // when
      var playSong = play(songUrl);

      // then
      return playSong.then(function(song) {
        expect(song.playState).to.eql(1);
      });
    });


    it('should stop previous playing song', function() {

      // given
      var songUrl = 'https://soundcloud.com/allefarben/alle-farben-fusion-secret-gig';
      var otherSongUrl = 'https://soundcloud.com/bebetta/bebetta-at-ploetzlich-am-meer';

      var playSong = play(songUrl);

      var song;

      // when
      return playSong.then(function(_song) {
        song = _song;

        return play(otherSongUrl);
      })
      .then(function(otherSong) {
        expect(otherSong.playState).to.eql(1);
        expect(song.playState).to.eql(0);
      });
    });

  });

});