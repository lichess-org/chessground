var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var watchify = require('watchify');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');

gulp.task('lint', function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function() {
  var bundleStream = browserify('./src/main.js',{debug: true}).bundle();

  return bundleStream
    .on('error', function(error) { gutil.log(gutil.colors.red(error.message)); })
    .pipe(source('chessground.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('prod-scripts', function() {
  var bundleStream = browserify('./src/main.js').bundle();

  return bundleStream
    .on('error', function(error) { gutil.log(gutil.colors.red(error.message)); })
    .pipe(source('chessground.prod.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./'));
});

gulp.task('watch-scripts', function() {
  var opts = watchify.args;
  opts.debug = true;
  var bundleStream = watchify(browserify('./src/main.js', opts));

  function rebundle() {
    return bundleStream.bundle()
      .on('error', function(error) { gutil.log.bind(gutil, gutil.colors.red(error.message)); })
      .pipe(source('chessground.js'))
      .pipe(gulp.dest('./'));
  }

  bundleStream.on('update', rebundle);
  bundleStream.on('log', gutil.log);

  return rebundle();
});

gulp.task('dev', ['scripts']);
gulp.task('dev-watch', ['watch-scripts']);
gulp.task('prod', ['prod-scripts']);

// Default Task
gulp.task('default', ['dev-watch']);
