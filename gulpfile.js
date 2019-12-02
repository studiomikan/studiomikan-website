// const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('sass', gulp.series(function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./docs/css/'));
}));

gulp.task('sass-watch', gulp.series(['sass'], function () {
  const watcher = gulp.watch('./sass/**/*.scss', gulp.series(['sass']));
  watcher.on('change', function (event) {});
}));

gulp.task('default', gulp.series(['sass-watch']));