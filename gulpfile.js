let gulp = require("gulp");
let babel = require("gulp-babel");
let runSequence = require('run-sequence');
let del = require('del');

gulp.task("default", done => 
  runSequence('clean', ['copy', 'transform', 'transform-sw'], done)
);

gulp.task('clean', done => del(['./docs/'], done));

gulp.task('copy', x => gulp.src([
      './src/main.css',
      './src/index.html'
  ],  {base: './src/'}) 
  .pipe(gulp.dest('./docs/'))
);

gulp.task("transform", x =>
  gulp.src("src/app.js")
    .pipe(babel())
    .pipe(gulp.dest("docs"))
);

gulp.task("transform-sw", x =>
  gulp.src("src/serviceworker.js")
    .pipe(babel())
    .pipe(gulp.dest("docs"))
);
