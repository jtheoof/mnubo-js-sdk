'use strict';

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var gulp = require('gulp');
var rename = require('gulp-rename');
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var config = {
  path: {
    out: 'out',
    dist: 'dist'
  }
};

var tsProject = typescript.createProject('tsconfig.json');

var browserifyConfig = browserify({
  entries: config.path.dist + '/mnubo.js',
  debug: true,
});

var sourceMapsConfig = {
  loadMaps: true
};

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

gulp.task('bundle.dev', ['build'], function() {
  return browserifyConfig.bundle()
    .pipe(source('mnubo.sfx.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init(sourceMapsConfig))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.path.dist));
});

gulp.task('bundle.prod', ['build'], function() {
  return browserifyConfig.bundle()
    .pipe(source('mnubo.sfx.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init(sourceMapsConfig))
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.path.dist));
});

gulp.task('bundle', ['bundle.dev', 'bundle.prod']);

gulp.task('dist', ['build'], function() { });
