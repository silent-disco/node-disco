'use strict';

module.exports = function(karma) {
  karma.set({

    basePath: '../../',

    frameworks: [ 'browserify', 'mocha', 'chai' ],

    files: [
      '**/test/spec/**/*.js'
    ],

    preprocessors: {
      '**/test/spec/**/*.js': [ 'browserify' ]
    },

    browsers: [ 'Chrome' ],

    browserNoActivityTimeout: 30000,

    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
      debug: true,
      transform: [
        [ 'babelify', { optional: [ 'es7.asyncFunctions' ] } ]
      ]
    },

    mocha: {
      reporter: 'spec'
    }
  });
};
