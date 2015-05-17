var inherits = require('inherits');

var assign = require('lodash/object/assign'),
    transform = require('lodash/object/transform'),
    get = require('lodash/object/get'),
    set = require('lodash/object/set');

var Emitter = require('events');

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

function SoundCloud(config) {

  this.sc = function() {
    return loadSC().then(function(sc) {
      sc.initialize({
        client_id: config.get('soundcloudClientId')
      });

      return sc;
    });
  };
}

inherits(SoundCloud, Emitter);

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


SoundCloud.prototype.changed = function(status) {

  if (status) {
    this._status = assign({}, this._status, status);
  } else {
    this.status = status;
  }

  this.emit('update', this._status);
};


/**
 * Play a song after skipping the given amount of time.
 *
 * @param {Song} song
 * @param {Number} [position=0]
 *
 * @return {Promise<Sound>}
 */
SoundCloud.prototype.play = async function(song, position) {

  var playing = this._status;

  if (playing) {
    await this.stop();
  }

  var sound = await this.createStream(song);

  this.changed({
    song: song,
    sound: sound,
    position: 0,
    playState: 'stopped'
  });

  if (position) {
    await this._skipTo(position);
  }

  return this._play(sound, position);
};

SoundCloud.prototype.updateLoading = function(position) {
  this.changed({
    loaded: position
  });
};

SoundCloud.prototype.updatePlaying = function(position) {
  this.changed({
    position: position
  });
};

SoundCloud.prototype.createStream = async function(song) {

  var sc = await this.sc();

  var self = this;

  var streamOptions = {
    whileloading: function() {
      self.updateLoading(this.duration);
    },
    whileplaying: function() {
      self.updatePlaying(this.position);
    },
    onfinish: function() {
      console.log('onfinish');
      // self.setFinished();
    }
  };

  return new Promise(function(resolve, reject) {

    sc.stream(song.streamUrl, streamOptions, function(sound, err) {
      if (err) {
        reject(err);
      } else {
        resolve(sound);
      }
    });
  });
};

SoundCloud.prototype._play = function(sound, position) {

  if (position !== undefined) {
    sound.setPosition(position);
  }

  sound.play();

  this.changed({
    playState: 'playing'
  });

  return sound;
};

SoundCloud.prototype.isPlaying = function() {
  return this._status;
};

/**
 * Stop playing of the given song
 *
 * @return {Promise<Song>} the song that got stopped
 */
SoundCloud.prototype.stop = async function() {
  var playing = this._status,
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

  this.changed(null);

  return result;
};