var gulp = require('gulp');
var rename = require('gulp-rename');

gulp.task('publish', function() {
  return gulp.src('./src/ng-app.js')
    .pipe(rename('angular-heath.js'))
    .pipe(gulp.dest('./dist/'));
});
