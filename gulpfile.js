const gulp = require('gulp');
const babel = require('gulp-babel');
const sass  = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const config = require(__dirname + '/package.json');

gulp.task('babel', ()=>{
  var bbl = babel(config.babel);
  return gulp.src('src/*.js*')
    .pipe(sourcemaps.init())
    .pipe(bbl.on('error', (e)=>{
      console.log(e.message);
      console.log(e.codeFrame);
      bbl.emit('end');
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('js'));
});

gulp.task('scss', ()=>{
  return gulp.src('src/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('css'));
});

gulp.task('build', ['babel', 'scss']);

gulp.task('watch', ()=>{
  gulp.watch('src/*.js*', ['babel']);
  gulp.watch('src/*.scss', ['scss']);
});
