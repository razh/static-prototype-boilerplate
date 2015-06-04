'use strict';

const SOURCE_DIR = './src';
const BUILD_DIR = process.env.BUILD_DIR || 'dist';
const PORT = process.env.PORT || 3000;

const _ = require('lodash');
const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const del = require('del');
const glob = require('glob');
const mergeStream = require('merge-stream');
const path = require('path');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');
const watchify = require('watchify');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

function onError(error) {
  console.log(error.message);
  this.emit('end');
}

gulp.task('browser-sync', function() {
  browserSync.init({
    browser: [],
    port: PORT,
    server: {
      baseDir: BUILD_DIR
    }
  });
});

gulp.task('jade', function() {
  return gulp.src(SOURCE_DIR + '/*.jade')
     .pipe($.jade({doctype: 'html'}))
     .on('error', onError)
     .pipe(gulp.dest(BUILD_DIR))
     .pipe(browserSync.reload({stream: true}));
});

gulp.task('stylus', function() {
  return gulp.src(SOURCE_DIR + '/*.styl')
     .pipe($.stylus({
       'include css': true
     }))
     .on('error', onError)
     .pipe(gulp.dest(BUILD_DIR))
     .pipe(browserSync.reload({stream: true}));
});

gulp.task('js', function() {
  const entries = glob.sync(SOURCE_DIR + '/*.js');

  function bundle(entry) {
    const bundler = watchify(browserify(entry,
      _.assign({
        debug: true
      }, watchify.args)));

    bundler.transform(babelify);

    function rebundle() {
      return bundler.bundle()
        .on('error', onError)
        .pipe(source(path.basename(entry)))
        .pipe(gulp.dest(BUILD_DIR))
        .pipe(browserSync.reload({stream: true}));
    }

    bundler
      .on('log', $.util.log)
      .on('update', rebundle);

    return rebundle();
  }

  return mergeStream.apply(null, entries.map(bundle));
});

gulp.task('watch', function() {
  gulp.watch([SOURCE_DIR + '/*.jade'], ['jade']);
  gulp.watch([SOURCE_DIR + '/*.styl'], ['stylus']);
});

gulp.task('clean', del.bind(null, [BUILD_DIR]));

gulp.task('default', ['clean'], function(cb) {
  return runSequence(
    ['stylus', 'jade', 'js'],
    ['browser-sync', 'watch'],
    cb
  );
});
