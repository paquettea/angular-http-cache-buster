var gulp = require('gulp');

var $ = require('gulp-load-plugins')();
var del = require('del');

var paths = {
    dist: {
        root: 'dist/',
        js: 'dist/',
        sourcemaps: 'maps/',
        toClean: ['dist/']
    },
    angularApp: {
        js: [
            'src/**/module.js',
            'src/**/config.js',
            'src/**/*.js']
    }
};

function buildAngularAppTask() {
    return gulp.src(paths.angularApp.js)
        //eslint crashes the watch if there is a js PARSE error. plumb prevent the watch to stop on those errors
        .pipe($.plumber({
            errorHandler: function () {
                $.util.beep();
            }
        }))
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.eslint.failOnError())

        .pipe($.sourcemaps.init())
        .pipe($.ngAnnotate())
        .pipe($.concat('angular-http-cache-buster.min.js'))
        .pipe($.sourcemaps.write(paths.dist.sourcemaps))
        .pipe(gulp.dest(paths.dist.js));
}

function eslintTask() {
    return gulp.src(paths.angularApp.js)
        .pipe($.plumber({
            errorHandler: function () {
                $.util.beep();
            }
        }))
        .pipe($.eslint())
        .pipe($.eslint.failOnError())
        .pipe($.eslint.format());

}

function watchTask(cb) {

    gulp.watch(paths.angularApp.js, gulp.series(buildAngularAppTask));
    $.util.log('watching angular js files');

    cb();
}

function cleanTask(cb) {
    del(paths.dist.toClean).then(function () {
        cb();
    });
}

gulp.task('clean', gulp.series(cleanTask));

gulp.task('eslint', gulp.series(eslintTask));

gulp.task('default',
    gulp.series(
        'clean',
        buildAngularAppTask));

gulp.task('dev',
    gulp.series('default',
        watchTask));

gulp.task('dist',
    gulp.series('default'));
