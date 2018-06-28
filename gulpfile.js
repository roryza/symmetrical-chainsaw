// from https://babeljs.io/en/setup.html#installation
var gulp = require("gulp");
var babel = require("gulp-babel");
var runSequence = require('run-sequence');
var del = require('del');

gulp.task("default", function (callback) {
  runSequence('clean', ['copy', 'transform', 'transform-sw'], callback);
}
);

gulp.task('clean', function (done) {
  return del(['./dist/'], done);
});

gulp.task('copy',function(){
  return gulp.src([
      './src/main.css',
      './src/index.html'
  ],  {base: './src/'}) 
  .pipe(gulp.dest('./dist/'));
});

gulp.task("transform", function () {
  return gulp.src("src/app.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task("transform-sw", function () {
  return gulp.src("src/serviceworker.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});