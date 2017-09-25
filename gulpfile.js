const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const cssnano = require('gulp-cssnano');
const sourcemaps = require('gulp-sourcemaps')
const size = require('gulp-size')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const header = require('gulp-header')
const browserSync = require('browser-sync').create()
const PRODUCTION = process.env.NODE_ENV === 'production'
const DIST = 'dist/'
const template = require('gulp-template')
const pkg = require('./package.json')
const config = require('./blog-config.js')

const banner = {
  full: [
    '/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @license <%= pkg.license %>',
    ' * @copyright <%= pkg.author.name %>',
    ' * @link <%= pkg.homepage %>',
    ' */',
    ''
  ].join('\n'),
  min:
    '/* <%= pkg.name %> v<%= pkg.version %> | (c) ' +
    new Date().getFullYear() +
    ' <%= pkg.author.name %> | <%= pkg.license %> License */' +
    '\n'
}

const fs = require('fs')

function templateData() {
  const files = {}
  ;[
    './src/scripts/polyfill-promise.js',
    './src/scripts/utils.js',
    './src/scripts/github-api.js',
    './src/scripts/index.js',
    './src/scripts/article.js',
    './src/scripts/main.js',
    './build/temp/templates.js',
  ].forEach(function(path) {
    let str
    if (path === './build/temp/templates.js' && PRODUCTION) {
      str = fs.readFileSync('./build/temp/templates.min.js', 'utf-8')
    } else {
      str = fs.readFileSync(path, 'utf-8')
    }
    files[path] = str
  })

  return {
    files: files,
    config: config,
    pkg: pkg,
    banner: PRODUCTION ? banner.min : banner.full
  }
}

const AUTOPREFIXER_BROWSERS = [
  'ie >= 6',
  'ie_mob >= 1',
  'ff >= 1',
  'chrome >= 1',
  'safari >= 1',
  'opera >= 1',
  'ios >= 1',
  'android >= 1',
  'bb >= 1'
]

gulp.task('dev:css', function() {
  return gulp
    .src('./src/app.scss')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass({
      outputStyle: 'expanded',
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe(autoprefixer({
        browsers: AUTOPREFIXER_BROWSERS,
        cascade: false
    }))
    .pipe(
      sourcemaps.write('./maps/', {
        addComment: true
      })
    )
    .pipe(gulp.dest(DIST))
    .pipe(header(banner.full, {pkg: pkg}))
    .pipe(size({title: 'app.scss'}))
    .pipe(browserSync.stream())
})

gulp.task('build:css', function() {
  return gulp
    .src('./src/app.scss')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass({
      outputStyle: 'expanded',
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe(autoprefixer({
        browsers: AUTOPREFIXER_BROWSERS,
        cascade: false
    }))
    .pipe(cssnano())
    .pipe(
      sourcemaps.write('./maps/', {
        addComment: false
      })
    )
    .pipe(gulp.dest(DIST))
    .pipe(header(banner.full, {pkg: pkg}))
    .pipe(size({title: 'app.scss'}))
})

gulp.task('dev:js', function() {
  return gulp
    .src('./src/app.js')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(template(templateData()))
    .pipe(
      babel({
        presets: ['env']
      }).on('error', console.log)
    )
    .pipe(
      sourcemaps.write('./maps/', {
        addComment: true
      })
    )
    .pipe(gulp.dest(DIST))
    .pipe(header(banner.full, {pkg: pkg}))
    .pipe(size({title: 'app.js'}))
    .pipe(browserSync.stream())
})

gulp.task('build:js', function() {
  return (gulp
      .src('./src/app.js')
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(template(templateData()))
      .pipe(
        babel({
          presets: ['env']
        }).on('error', console.log)
      )
      .pipe(
        babel({
          presets: ['minify']
        }).on('error', console.log)
      )
      .pipe(
        sourcemaps.write('./maps/', {
          addComment: false
        })
      )
      .pipe(header(banner.min, {pkg: pkg}))
      .pipe(gulp.dest(DIST))
      .pipe(size({title: 'app.js'})) )
})

gulp.task('dev:html', function() {
  return gulp
    .src('./src/app.html')
    .pipe(rename('index.html'))
    .pipe(template(templateData()))
    .pipe(gulp.dest(DIST))
    .pipe(size({title: 'app.html'}))
    .pipe(browserSync.stream())
})

gulp.task('build:html', function() {
  return gulp
    .src('./src/app.html')
    .pipe(rename('index.html'))
    .pipe(template(templateData()))
    .pipe(gulp.dest(DIST))
    .pipe(size({title: 'app.html'}))
})

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: DIST,
      index: 'index.html',
      open: true,
      directory: true
    }
  })
})

gulp.task('default', ['dev:js', 'dev:css', 'dev:html', 'serve'], function() {
  gulp.watch('./src/**/*.js', ['dev:js'])
  gulp.watch('./src/**/*.html', ['dev:html'])
  gulp.watch('./src/**/*.scss', ['dev:css'])
})

gulp.task('build', ['build:js', 'build:css', 'build:html'], function() {})
