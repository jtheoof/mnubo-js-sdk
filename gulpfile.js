'use strict';

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var gulp = require('gulp');
var rename = require('gulp-rename');
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');

var tsProject = typescript.createProject('tsconfig.json');

var config = {
  path: {
    out: 'out',
    dist: 'dist'
  }
};

gulp.task('watch', function() {
  gulp.watch(config.path.out + '/**/*.js', ['build']);
});

gulp.task('build', function() {
  return tsProject
    .src()
    .pipe(typescript(tsProject))
    .js
    .pipe(rename(function(path) {
      path.dirname = path.dirname.substring(4); /* src/ */
    }))
    .pipe(gulp.dest(config.path.dist));
});

gulp.task('browserify', ['build'], function() {
  var b = browserify({
    entries: config.path.dist + '/mnubo.static.js',
    debug: true,
  });

  return b.bundle()
    .pipe(source('mnubo.static.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.path.dist + '/browserify/'));
});

gulp.task('dist', ['build'], function() { });
