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


SoundCloud.prototype.changed = function(current) {

  if (current) {
    this._current = assign({}, this._current, current);
  } else {
    this._current = current;
  }

  this.emit('update', this._current);
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

  if (this.isPlaying()) {
    await this.stop();
  }

  var current = this._current;

  var sound;

  // make sure we use the current song / position
  // data if nothing is provided by the caller
  if (current) {

    if (!song) {
      song = current.song;
    }

    if (!position) {
      position = current.position;
    }

    // make sure we reuse the existing sound object
    if (song === current.song) {
      sound = current.sound;
    }
  }

  position = position || 0;

  sound = sound || await this.createStream(song);

  this.changed({
    song: song,
    sound: sound,
    position: position
  });


  // skip to position
  await this._skipTo(sound, position);

  // play
  return this._play(sound);
};

SoundCloud.prototype.updateLoading = function(position) {
  this.changed({
    playState: 'loading',
    position: position
  });
};

SoundCloud.prototype.updatePlaying = function(position) {
  this.changed({
    position: position
  });
};

SoundCloud.prototype.createStream = async function(song) {

  var sc = await this.sc();

  return new Promise(function(resolve, reject) {

    sc.stream(song.streamUrl, function(sound, err) {
      if (err) {
        reject(err);
      } else {
        resolve(sound);
      }
    });
  });
};

SoundCloud.prototype._skipTo = async function(sound, position) {

  var self = this;

  this.changed({
    playState: 'loading'
  });

  return new Promise(function(resolve, reject) {

    function updateLoading() {
      self.changed({
        loaded: sound.duration
      });

      if (sound.duration >= position) {
        sound.setPosition(position);
        resolve(sound);
      }
    }

    sound.load({
      whileplaying: null,
      whileloading: updateLoading,
      onstop: function() {
        console.log('SOUND stop', this);
      },
      onfinish: function() {
        console.log('SOUND finish', this);
      }
    });

    updateLoading();
  });
};

SoundCloud.prototype._play = function(sound) {

  this.changed({
    playState: 'playing'
  });

  function updatePlaying() {
    this.changed({
      position: sound.position
    });
  }

  sound.play({
    whileloading: null,
    whileplaying: updatePlaying.bind(this)
  });

  console.log(sound);
  return sound;
};

SoundCloud.prototype.isPlaying = function() {
  return this._current && this._current.playState === 'playing';
};

/**
 * Stop playing of the given song
 *
 * @return {Promise<Song>} the song that got stopped
 */
SoundCloud.prototype.stop = async function() {
  var current = this._current,
      song,
      sound,
      result;

  if (current) {
    song = current.song;
    sound = current.sound;

    result = {
      position: sound.position,
      song: song
    };

    sound.stop({
      whileplaying: null,
      whileloading: null
    });
  }

  this.changed({
    playState: 'stopped'
  });

  return result;
};