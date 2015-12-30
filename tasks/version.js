var gulp = require('gulp');
var bump = require('gulp-bump');

gulp.task('patch', function() {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump())
    .pipe(gulp.dest('./'));

});

gulp.task('minor', function() {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump({ type: 'minor' }))
    .pipe(gulp.dest('./'));
});

gulp.task('major', function() {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump({ type: 'major' }))
    .pipe(gulp.dest('./'));
});
