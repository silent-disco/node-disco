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
    del = require('del'),
    errorify = require('errorify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    gutil = require('gulp-util'),
    runSequence = require('run-sequence'),
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

  var bro,
      bundler,
      bundleOptions;

  function build() {
    return bundler
            .bundle()
            .pipe(plumber())
            .pipe(source('client.js'))
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

    bro = browserify(bundleOptions);
    bro.plugin(errorify);

    bundler = watchify(bro);

    bundler.plugin(errorify);

    bundler.on('update', build);
    bundler.on('log', gutil.log);
  } else {
    bro = browserify(browserifyOptions);
    bro.plugin(errorify);
    bundler = bro;
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

gulp.task('client:build:watch', ['client:lint'], function() {
  return bundle({ watch: true }).build();
});

gulp.task('client:build', [ 'client:lint' ], function() {
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

gulp.task('client:copy', [ 'client:copy:html', 'client:copy:font' ]);

gulp.task('client:copy:html', function() {
  return copy('client/index.html');
});

gulp.task('client:copy:font', function() {
  return copy('client/font/**', 'font');
});

gulp.task('client:size', function() {
  return gulp.src(dest + '/**').pipe(size({ showFiles: true }));
});

gulp.task('server', ['nodemon'], function() {
  livereload.listen();

  gulp.watch(['public/**/*'], [ 'client:size' ]);

  gulp.watch(['client/**/*.less'], ['client:less']);
  gulp.watch(['client/index.html'], [ 'client:copy' ]);
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


gulp.task('default', ['build']);

gulp.task('build', function() {
  runSequence('client:clean', 'client:copy', 'client:less', 'client:build', 'client:size');
});

gulp.task('serve', function() {
  runSequence( 'client:copy', 'client:less', 'client:build:watch', 'server');
});
