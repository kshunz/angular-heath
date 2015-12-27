global.gulp = require('gulp');
global.gutil = require('gulp-util');
var taskListing = require('gulp-task-listing');
var fs = require('fs');

var files = fs.readdirSync('./tasks');

global.log = global.gutil.log;
global.c = global.gutil.colors;

files.forEach(function (file) {
  if(file !== 'plugins') {
    require('./tasks' + '/' + file);
  }
});

gulp.task('help', taskListing);

gulp.task('default', ['help']);
