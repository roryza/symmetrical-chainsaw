// basic build
const gulp = require("gulp");
const babel = require("gulp-babel");
const runSequence = require('run-sequence');
const del = require('del');

gulp.task("default", done => 
  runSequence('clean', ['copy', 'transform'], done)
);

gulp.task('clean', done => del(['./docs/'], done));

gulp.task('copy', x => gulp.src([
      './src/main.css',
      './src/index.html',
      './src/idb.js',
      './src/favicons/*',
      './src/pwaicons/*',
      './src/manifest.json',
      './src/browserconfig.xml',
      './src/favicon.ico'
  ],  {base: './src/'}) 
  .pipe(gulp.dest('./docs/'))
);

gulp.task("transform", x =>
  gulp.src(['src/app.js', 'src/idbcurrencyconverter.js', 'src/serviceworker.js'])
    .pipe(babel())
    .pipe(gulp.dest("docs"))
);
