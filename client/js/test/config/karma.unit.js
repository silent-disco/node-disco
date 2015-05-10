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

    browsers: [ 'PhantomJS' ],

    browserNoActivityTimeout: 30000,

    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
      debug: true
    },

    mocha: {
      reporter: 'spec'
    }
  });
};
