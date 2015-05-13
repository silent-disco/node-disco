var transform = require('lodash/object/transform'),
    get = require('lodash/object/get'),
    set = require('lodash/object/set');

var Promise = require('promise');

var SONG_URL_PATTERN = /^https\:\/\/soundcloud\.com\/[^\/]+\/[^\/]+$/;

var loadSC = require('../../util/load-sdk')('https://connect.soundcloud.com/sdk.js', 'SC');

var songMapping = {
  'name': 'title',
  'description': 'description',
  'duration': 'duration',
  'streamable': 'streamable',
  'streamUrl': 'stream_url',
  'permalinkUrl': 'permalink_url',
  'pictureUrl': 'artwork_url',
  'uri': 'uri',
  'artist.name': 'user.username',
  'artist.pictureUrl': 'user.avatar_url',
  'artist.permalinkUrl': 'user.permalink_url',
  'artist.uri': 'user.uri'
};


function extractSong(data) {

  return transform(songMapping, function(result, sourceKey, targetKey) {
    set(result, targetKey, get(data, sourceKey));
  });
}

function SoundCloud(id, config) {

  this.id = id;

  this.sc = function() {
    return loadSC().then(function(sc) {
      sc.initialize({
        client_id: config.get('soundcloudClientId')
      });

      return sc;
    });
  };
}

module.exports = SoundCloud;


/**
 * Is this a valid song identifier for the given url?
 *
 * @param  {String} identifier
 *
 * @return {Promise<Boolean>}
 */
SoundCloud.prototype.isSong = async function(identifier) {
  return SONG_URL_PATTERN.test(identifier);
};

/**
 * Fetch information about a song
 *
 * @param {String} url
 *
 * @return {Promise<Song>}
 */
SoundCloud.prototype.fetchInfo = async function(url) {

  var sc = await this.sc();

  return new Promise(function(resolve, reject) {
    sc.get('/resolve.json', { url: url }, function(result, err) {

      if (err) {
        reject(err);
      } else {
        if (result.kind !== 'track') {
          return reject(new Error('not a track but a ' + result.kind));
        }

        resolve(extractSong(result));
      }
    });
  });
};


/**
 * Play a song after skipping the given amount of time.
 *
 * @param {Song} song
 * @param {Number} [skip=0]
 *
 * @return {Promise<Sound>}
 */
SoundCloud.prototype.play = async function(song, skip) {

  var self = this;

  await this.stop();

  var sc = await this.sc();

  return new Promise(function(resolve, reject) {
    sc.stream(song.streamUrl, function(sound, err) {
      if (err) {
        reject(err);
      } else {
        sound.play();
        self._playing = {
          song: song,
          sound: sound
        };

        resolve(sound);
      }
    });
  });
};

SoundCloud.prototype.isPlaying = function() {
  return this._playing;
};

/**
 * Stop playing of the given song
 *
 * @return {Promise<Song>} the song that got stopped
 */
SoundCloud.prototype.stop = async function() {
  var playing = this._playing,
      song,
      sound,
      result;

  if (playing) {
    song = playing.song;
    sound = playing.sound;

    result = {
      position: sound.position,
      song: song
    };

    sound.stop();
  }

  this._playing = null;

  return result;
};