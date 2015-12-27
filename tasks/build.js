var gulp = require('gulp');
var bower = require('gulp-bower');

gulp.task('build', function() {
  return bower()
    .pipe(gulp.dest('./src/lib'));
});

gulp.task('build-watch', [], function() {
  return gulp.watch(['./src/**', './gulpfile.js'], ['bower']);
});
