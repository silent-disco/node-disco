require("babelify/polyfill");

var Config = require('../../../config/key-value');

var SoundCloud = require('../../../player/soundcloud');


describe('player/soundcloud', function() {

  var config = new Config({
    soundcloudClientId: 'e158f9f9cb11f3e88ab951b19ac39544'
  });


  var soundCloud = new SoundCloud('soundcloud', config);


  describe('isSong', function() {

    it('should detect valid url', async function() {

      // given
      var validUrl = 'https://soundcloud.com/allefarben/alle-farben-fusion-secret-gig';

      // when
      var isValid = await soundCloud.isSong(validUrl);

      // then
      expect(isValid).to.be.true;
    });


    it('should detect invalid url', async function() {

      // given
      var invalidUrl = 'http://not-a-song';

      // when
      var isValid = await soundCloud.isSong(invalidUrl);

      // then
      expect(isValid).to.be.false;
    });

  });


  describe('fetchInfo', function() {

    it('should fetch info by url', async function() {

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
      var song = await soundCloud.fetchInfo(songUrl);

      // then
      expect(song).to.eql(expectedSong);
    });


    it('should handle invalid url with error', async function() {

      // given
      var songUrl = 'http://not-a-song';

      // when
      try {
        await soundCloud.fetchInfo(songUrl);

        throw new Error('expected exception');
      } catch (e) {
        // then
        expect(e.message).to.eql('404 - Not Found');
      }
    });


    it('should handle playlist url with error', async function() {

      // given
      var playlistUrl = 'https://soundcloud.com/hi-speed/sets/jamz-buschpiratencamp';

      // when
      try {
        await soundCloud.fetchInfo(playlistUrl);
      } catch(e) {
        // then
        expect(e.message).to.eql('not a track but a playlist');
      }
    });

  });


  describe('play', function() {

    this.timeout(10000);


    afterEach(async function() {
      await soundCloud.stop();
    });

    async function play(url) {
      var song = await soundCloud.fetchInfo(url);
      return soundCloud.play(song);
    }


    it('should play song', async function() {

      // given
      var songUrl = 'https://soundcloud.com/allefarben/alle-farben-fusion-secret-gig';

      // when
      var song = await play(songUrl);

      // then
      expect(song.playState).to.eql(1);
    });


    it('should stop previous playing song', async function() {

      // given
      var songUrl = 'https://soundcloud.com/allefarben/alle-farben-fusion-secret-gig';
      var otherSongUrl = 'https://soundcloud.com/bebetta/bebetta-at-ploetzlich-am-meer';

      var song = await play(songUrl);

      // when
      var otherSong = await play(otherSongUrl);

      // then
      expect(otherSong.playState).to.eql(1);
      expect(song.playState).to.eql(0);
    });

  });

});