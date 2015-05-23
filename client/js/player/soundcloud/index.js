var inherits = require('inherits');

var assign = require('lodash/object/assign'),
    transform = require('lodash/object/transform'),
    get = require('lodash/object/get'),
    set = require('lodash/object/set');

var now = require('../../util/now');

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

  var t = now();

  var current = this._current;

  var sound;

  if (current) {

    // make sure we use the current song / position
    // data if nothing is provided by the caller
    if (!song) {
      song = current.song;
    }

    if (current.song === song) {
      await this.stop();

      // make sure we reuse the existing sound object
      sound = current.sound;
      position = isNaN(position) ? current.position : position;
    } else {
      await this.unload();
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
  var ready = await this._skipTo(sound, position, t);

  // play
  if (ready) {
    return this._play(sound);
  } else {
    return null;
  }
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


/**
 * Skip to the given position within a sound.
 *
 * @param  {SMSound} sound
 * @param  {Number} position
 * @param  {Number} [t=now()] time to compensate for during skipping
 *
 * @return {SMSound}
 */
SoundCloud.prototype._skipTo = async function(sound, position, t) {

  var self = this;

  // start of skipping
  t = t || now();

  this.changed({
    playState: 'loading'
  });

  return new Promise(function(resolve, reject) {

    function finished() {
      var current = self._current;

      self.changed({
        playState: 'finished'
      });

      self.emit('finish', current && current.song);
    }

    function updateLoading() {

      // compensate skipping time
      var n = now();
      var delta = (n - t);

      var actualPosition = position + delta;

      // if we waited beyond estimated duration,
      // finish instead of continuing to load
      if (sound.durationEstimate && actualPosition > sound.durationEstimate) {
        resolve(null);
        return finished();
      }

      self.changed({
        loaded: sound.duration
      });

      if (sound.duration >= actualPosition) {
        sound.setPosition(actualPosition);
        resolve(sound);
      }
    }

    sound.load({
      whileplaying: null,
      whileloading: updateLoading,
      onfinish: finished
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

  if (this.muted) {
    sound.mute();
  }

  sound.play({
    whileloading: null,
    whileplaying: updatePlaying.bind(this)
  });

  return sound;
};

SoundCloud.prototype.isPlaying = function() {
  return this._current && this._current.playState === 'playing';
};

/**
 * Stop playing of the given song
 *
 * @return {Promise<Object>} the { song, position } where
 *                           playing was stopped
 */
SoundCloud.prototype.stop = async function() {
  var current = this._current,
      song,
      sound,
      result;

  if (current && current.playState !== 'stopped') {
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

    this.changed({
      playState: 'stopped'
    });
  }

  return result;
};

SoundCloud.prototype.setMuted = function(muted) {

  this.muted = muted;

  var current = this._current;

  if (current && current.sound) {
    if (muted) {
      current.sound.mute();
    } else {
      current.sound.unmute();
    }
  }
};

/**
 * Unload the current internal sound object to free resources.
 */
SoundCloud.prototype.unload = async function() {

  var current = this._current,
      sound;

  if (current) {
    sound = current.sound;

    if (sound) {
      sound.destruct();

      this.changed({
        playState: 'stopped',
        sound: null
      });
    }
  }
};