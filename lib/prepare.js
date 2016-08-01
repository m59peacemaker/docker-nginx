const gulp  = require('gulp')
const ejs   = require('gulp-ejs')
const loadData = require('./load-data')

const confGlob = '/nginx/**/*.conf'
const dest = '/etc/nginx/'
const src = glob => gulp.src(glob, {base: '/nginx'})

const prepare = () => {
  const confPromise = new Promise((resolve, reject) => {
    const locals = {env: process.env, data: loadData('/nginx/data')}
    src(confGlob)
      .pipe(ejs(locals))
      .on('error', reject)
      .pipe(gulp.dest(dest))
      .on('end', resolve)
  })

  const otherPromise = new Promise((resolve, reject) => {
    src(['/nginx/**/*', '!' + confGlob])
      .on('error', reject)
      .pipe(gulp.dest(dest))
      .on('end', resolve)
  })

  return Promise.all([confPromise, otherPromise])
}

module.exports = prepare
