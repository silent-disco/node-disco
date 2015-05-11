'use strict';

module.exports = function(karma) {
  karma.set({

    basePath: '../../',

    frameworks: [ 'browserify', 'mocha', 'chai-as-promised', 'chai' ],

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
      debug: true
    },

    mocha: {
      reporter: 'spec'
    }
  });
};
