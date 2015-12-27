var gulp = require('gulp');
var runServer = require('gulp-server-livereload');

gulp.task('server', [], function () {
  console.log('Spinning up a DEV server on 1337...');

  return gulp.src('src')
    .pipe(runServer({
      log: false,
      port: 1337,
      directoryListing: false,
      livereload: true,
      open: true
    }));

});
