const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const sourcemaps = require('gulp-sourcemaps')
const size = require('gulp-size')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const header = require('gulp-header')
const browserSync = require('browser-sync').create()
const fs = require('fs')

const PRODUCTION = process.env.NODE_ENV === 'production'
const DIST = 'dist/'
const template = require('gulp-template')
const package_ = require('./package.json')
const config = require('./blog-config.js')
const babelConfig = require('./.babelrc.js')

const banner = {
  full: [
    '/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @license <%= pkg.license %>',
    ' * @copyright <%= pkg.author.name || pkg.author %>',
    ' * @link <%= pkg.homepage %>',
    ' */',
    '',
  ].join('\n'),
  min:
    `/* <%= pkg.name %> v<%= pkg.version %> | (c) ${new Date().getFullYear()} <%= pkg.author.name || pkg.author %> | <%= pkg.license %> License */` +
    `\n`,
}

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
    let string
    if (path === './build/temp/templates.js' && PRODUCTION) {
      string = fs.readFileSync('./build/temp/templates.min.js', 'utf-8')
    } else {
      string = fs.readFileSync(path, 'utf-8')
    }
    files[path] = string
  })

  if (!config.$cdn) {
    let cdn = []
    cdn = cdn
      .concat(Object.values(config.paths))
      .concat(Object.values(config.require.paths))
      .map(function(path) {
        return path
          .split('/')
          .slice(0, 3)
          .join('/')
      })
      .reduce(function(accumulator, cdn) {
        return accumulator.includes(cdn)
          ? accumulator
          : accumulator.concat([cdn])
      }, [])
      .sort()
    config.$cdn = cdn
  }

  if (!config.$js) {
    const jsConfig = {...config}

    // fix config.require
    const {paths} = jsConfig.require
    // eslint-disable-next-line guard-for-in
    for (const key in paths) {
      const path = paths[key]
      if (path.slice(-3) === '.js') {
        paths[key] = path.slice(0, -3)
      }
    }

    delete jsConfig.paths
    delete jsConfig.$cdn

    config.$js = jsConfig
  }

  return {
    files,
    config,
    pkg: package_,
    banner: PRODUCTION ? banner.min : banner.full,
  }
}

gulp.task('dev:css', function() {
  return gulp
    .src('./src/app.scss')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(
      sass({
        outputStyle: 'expanded',
        precision: 10,
        onError: console.error.bind(console, 'Sass error:'),
      })
    )
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      sourcemaps.write('./maps/', {
        addComment: true,
      })
    )
    .pipe(header(banner.full, {pkg: package_}))
    .pipe(gulp.dest(DIST))
    .pipe(size({title: 'app.scss'}))
    .pipe(browserSync.stream())
})

gulp.task('build:css', function() {
  return gulp
    .src('./src/app.scss')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(
      sass({
        outputStyle: 'expanded',
        precision: 10,
        onError: console.error.bind(console, 'Sass error:'),
      })
    )
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(
      sourcemaps.write('./maps/', {
        addComment: false,
      })
    )
    .pipe(header(banner.min, {pkg: package_}))
    .pipe(gulp.dest(DIST))
    .pipe(size({title: 'app.scss'}))
})

gulp.task('dev:js', function() {
  return gulp
    .src('./src/app.js.jst')
    .pipe(rename('app.js'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(template(templateData()))
    .pipe(babel(babelConfig).on('error', console.log))
    .pipe(
      sourcemaps.write('./maps/', {
        addComment: true,
      })
    )
    .pipe(header(banner.full, {pkg: package_}))
    .pipe(gulp.dest(DIST))
    .pipe(size({title: 'app.js'}))
    .pipe(browserSync.stream())
})

gulp.task('build:js', function() {
  return gulp
    .src('./src/app.js.jst')
    .pipe(rename('app.js'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(template(templateData()))
    .pipe(babel(babelConfig).on('error', console.log))
    .pipe(
      babel({
        presets: ['minify'],
      }).on('error', console.log)
    )
    .pipe(
      sourcemaps.write('./maps/', {
        addComment: false,
      })
    )
    .pipe(header(banner.min, {pkg: package_}))
    .pipe(gulp.dest(DIST))
    .pipe(size({title: 'app.js'}))
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

gulp.task('build:asset', function() {
  return gulp
    .src('./src/*.ico')
    .pipe(gulp.dest(DIST))
    .pipe(size({title: 'asset'}))
})

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: DIST,
      index: 'index.html',
      open: true,
      directory: true,
    },
  })
})

gulp.task(
  'default',
  gulp.series(
    'dev:js',
    'dev:css',
    'dev:html',
    'build:asset',
    'serve',
    function() {
      gulp.watch('./src/**/*.js', ['dev:js'])
      gulp.watch('./src/**/*.html', ['dev:html'])
      gulp.watch('./src/**/*.scss', ['dev:css'])
    }
  )
)

gulp.task(
  'build',
  gulp.series('build:js', 'build:css', 'build:html', 'build:asset')
)
