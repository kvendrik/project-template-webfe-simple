var gulp = require('gulp'),
    connect = require('gulp-connect'),
    sass = require('gulp-sass'),
    htmlmin = require('gulp-htmlmin'),
    ejsLocals = require('gulp-ejs-locals'),
    gutil = require('gulp-util'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');

var pkg = require('./package.json'),
    rootPaths = {
        public: 'public',
        dev: 'dev'
    },
    paths = {
        html: {
            all: [rootPaths.dev+'/html/**/*.ejs'],
            src: [rootPaths.dev+'/html/**/*.ejs', '!'+rootPaths.dev+'/html/_inc/**/*.ejs'],
            destFolder: rootPaths.public
        },
        js: {
            src: [rootPaths.dev+'/js/main.js'],
            srcAll: [rootPaths.dev+'/**/*.js'],
            destFile: 'app.js',
            destFileMin: 'app.min.js',
            destFolder: rootPaths.public+'/js/'
        },
        sass: {
            src: [rootPaths.dev+'/sass/main.scss'],
            all: [rootPaths.dev+'/sass/**/*.scss'],
            destFile: 'main.min.css',
            destFolder: rootPaths.public+'/css/'
        }
    };
 
gulp.task('connect', function(){
    connect.server({
        livereload: true,
        host: '0.0.0.0',
        port: 3000,
        root: rootPaths.public
    });
});

gulp.task('watch', function(){
    gulp.watch(paths.html.all, ['ejs']);
    gulp.watch(paths.js.srcAll, ['browserify']);
    gulp.watch(paths.sass.all, ['sass']);
});

gulp.task('ejs', function(){
    gulp.src(paths.html.src)
        .pipe(ejsLocals().on('error', gutil.log))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(paths.html.destFolder))
        .pipe(connect.reload());
});

gulp.task('sass', function () {
    gulp.src(paths.sass.src)
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            expand: true,
            flatten: true,
            browsers: ['last 20 versions', 'ie 8', 'ie 9']
        }))
        .pipe(rename(paths.sass.destFile))
        .pipe(gulp.dest(paths.sass.destFolder))
        .pipe(connect.reload());
});

gulp.task('browserify', () => {
    browserify(paths.js.src, { debug: true })
      .transform('babelify', { presets: ["es2015"], sourceMaps: true })
      .bundle()
      .pipe(source(paths.js.destFile))
      .pipe(buffer())
      .pipe(gulp.dest(paths.js.destFolder))

      .pipe(rename(paths.js.destFileMin))
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(paths.js.destFolder))

      .pipe(connect.reload());
});

gulp.task('default', ['connect', 'watch']);
gulp.task('build', ['ejs', 'sass', 'browserify']);
