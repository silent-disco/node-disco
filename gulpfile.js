'use strict';

var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    size = require('gulp-size'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    stylish = require('jshint-stylish'),
    less = require('gulp-less'),
    errorify = require('errorify'),
    watchify = require('watchify'),
    browserify = require('browserify'),
    mocha = require('gulp-mocha'),
    karma = require('karma').server,
    open = require('open'),
    del = require('del'),
    errorify = require('errorify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    gutil = require('gulp-util'),
    sequence = require('gulp-sequence'),
    livereload = require('gulp-livereload'),
    nodemon = require('gulp-nodemon'),
    assign = require('lodash/object/assign');


var dest = 'public';

// add custom browserify options here
var browserifyOptions = {
  entries: ['./client/index.js'],
  debug: true
};

// add transformations here
// i.e. b.transform(coffeeify);

function bundle(options) {

  var bundler,
      bundleOptions;

  function build() {
    return bundler
             .bundle()
               .pipe(plumber())
               .pipe(source('index.js'))
               .pipe(buffer())
               .pipe(gulp.dest(dest))
               .pipe(livereload())
               .pipe(rename({ extname: '.min.js' }))
               .pipe(uglify())
               .pipe(gulp.dest(dest))
               .pipe(livereload());
  }

  if (options && options.watch) {

    bundleOptions = assign({}, watchify.args, browserifyOptions);

    bundler = watchify(browserify(bundleOptions));

    bundler.plugin(errorify);

    bundler.on('update', build);
    bundler.on('log', gutil.log);
  } else {
    bundler = browserify(browserifyOptions);
  }

  bundler.build = build;

  return bundler;
}

function copy(src, dir) {
  return gulp.src(src)
             .pipe(gulp.dest(dest + (dir ? '/' + dir : '')))
             .pipe(livereload());
}

function lint(src) {
  return gulp.src(src)
             .pipe(plumber())
             .pipe(jshint('.jshintrc'))
             .pipe(jshint.reporter(stylish));
}

gulp.task('client:build:watch', function() {
  return bundle({ watch: true }).build();
});

gulp.task('client:build', function() {
  return bundle().build();
});

gulp.task('client:clean', function(cb) {
  return del('public/**/*', cb);
});

gulp.task('client:less', function() {
  return gulp.src('client/style.less')
             .pipe(plumber())
             .pipe(less())
             .pipe(autoprefixer())
             .pipe(gulp.dest(dest))
             .pipe(livereload());
});

gulp.task('client:lint', function() {
  return lint('client/**/*.js');
});

gulp.task('client:copy', sequence([ 'client:copy:html', 'client:copy:font' ]));

gulp.task('client:copy:html', function() {
  return copy('client/index.html');
});

gulp.task('client:copy:font', function() {
  return copy('client/font/**', 'font');
});

gulp.task('client:size', function() {
  return gulp.src(dest + '/**').pipe(size({ showFiles: true }));
});

gulp.task('client:watch', function() {
  gulp.watch(['public/**/*'], ['client:size']);

  gulp.watch(['client/**/*.js'], ['client:lint']);
  gulp.watch(['client/**/*.less'], ['client:less']);
  gulp.watch(['client/index.html'], ['client:copy']);
});

gulp.task('server', sequence('nodemon'));

gulp.task('server:livereload', function() {
  livereload.listen();
});

gulp.task('client:test', function(done) {
  karma.start({
    configFile: __dirname + '/client/js/test/config/karma.unit.js'
  }, done);
});


gulp.task('client:test:watch', function(done) {
  karma.start({
    configFile: __dirname + '/client/js/test/config/karma.unit.js',
    singleRun: false,
    autoWatch: true
  }, done);
});


gulp.task('server:test', function() {

  // init expect
  require('./api/test/expect');

  // init co-mocha
  require('co-mocha');

  gulp.src('api/test/**/*.js')
      .pipe(plumber())
      .pipe(mocha({ ui: 'bdd' }));
});

gulp.task('nodemon', function(cb) {
  var called = false;
  return nodemon({
    script: 'index.js',
    watch: ['api/**/*.js'],
    ignore: ['node_modules', 'public/bower_components']
  })
  .on('start', function onStart() {
    if (!called) {
      cb();
    }
    called = true;
    console.log('Starting...');
  });
});

gulp.task('test', sequence('client:test', 'server:test'));

gulp.task('open', function() {
  return open('http://localhost:3000');
});

gulp.task('clean', sequence('client:clean'));

gulp.task('default', sequence('clean', 'build'));

gulp.task('build', sequence(
  'client:lint',
  'client:copy',
  'client:less',
  'client:build',
  'client:size'
));

gulp.task('serve', sequence(
  [
    'client:copy',
    'client:less',
    'client:build:watch'
  ],
  [
    'server',
    'client:lint'
  ],
  [
    'server:livereload',
    'client:watch',
    'open'
  ]
));
