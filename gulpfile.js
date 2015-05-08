'use strict';

const SOURCE_DIR = './src';
const BUILD_DIR = process.env.BUILD_DIR || 'dist';
const PORT = process.env.PORT || 3000;

const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');

const gulp = require('gulp');
const jade = require('gulp-jade');
const stylus = require('gulp-stylus');

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
     .pipe(jade({doctype: 'html'}))
     .on('error', onError)
     .pipe(gulp.dest(BUILD_DIR))
     .pipe(browserSync.reload({stream: true}));
});

gulp.task('stylus', function() {
  return gulp.src(SOURCE_DIR + '/*.styl')
     .pipe(stylus())
     .on('error', onError)
     .pipe(gulp.dest(BUILD_DIR))
     .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', function() {
  gulp.watch([SOURCE_DIR + '/*.jade'], ['jade']);
  gulp.watch([SOURCE_DIR + '/*.styl'], ['stylus']);
})

gulp.task('clean', del.bind(null, [BUILD_DIR]));

gulp.task('default', ['clean'], function(cb) {
  return runSequence(
    ['stylus', 'jade'],
    ['browser-sync', 'watch'],
    cb
  );
});
