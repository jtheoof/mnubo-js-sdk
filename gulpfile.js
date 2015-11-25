'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var typescript = require('gulp-typescript');

var Builder = require('systemjs-builder');
var tsProject = typescript.createProject('tsconfig.json');

var config = {
  path: {
    src: 'src',
    build: 'build/es5/mnubo',
    dist: 'dist'
  }
};

gulp.task('watch', function() {
  gulp.watch(config.path.src + '/**/*.ts', ['build']);
});

gulp.task('build', function() {
  return tsProject
    .src()
    .pipe(typescript(tsProject))
    .js
    .pipe(rename(function(path) {
      path.dirname = path.dirname.substring(4); /* src/ */
    }))
    .pipe(gulp.dest(config.path.build));
});

gulp.task('bundle', ['build'], function() {
  var builder = new Builder('build/es5');
  var builderConfig = {
    defaultJSExtensions: true,
    paths: {
      'lodash': './node_modules/lodash/index.js',
    },
    meta: {
      'http': {
        build: false
      },
      'https': {
        build: false
      }
    },
    warnings: true
  };

  var bundleSuccess = function() {
    console.log('systemjs bundle was created');
  };

  var bundleError = function(error) {
    console.trace();
    console.error('error while creating systemjs bundle', error);
  };

  builder.config(builderConfig);

  builder.bundle('mnubo/mnubo.js', config.path.dist + '/mnubo.js')
    .then(bundleSuccess)
    .catch(bundleError);

  builder.buildStatic('mnubo/mnubo.js', config.path.dist + '/mnubo.static.js')
    .then(bundleSuccess)
    .catch(bundleError);
});

gulp.task('dist', ['bundle'], function() { });
