var gulp = require('gulp'),
    less = require('gulp-less'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    runSequence = require('run-sequence'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    miniCss = require('gulp-clean-css'),
    clean = require('gulp-clean'),
    rev = require('gulp-rev'),
    replace = require('gulp-replace'),
    revCollector = require('gulp-rev-collector');


var cssSrc = ['./app/stylesheets/**/*.css'],
    jsLibSrc = ['./app/components/**.js'];

//less文件编译
gulp.task('less', function() {
    gulp.src('less/*.less')
        .pipe(less())
        .pipe(gulp.dest('app/stylesheets'));        
});

//es6文件编译
gulp.task('babel', function() {
    gulp.src('demo.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('test'));
});

gulp.task('concat', function () {
    //css合并,并压缩
    return gulp.src(['./app/stylesheets/**/*.css', '!./app/stylesheets/bootstrap.min.css', '!./app/stylesheets/bootstrap-switch.css', '!./app/stylesheets/highlight.css', '!./app/stylesheets/all.css'])
        .pipe(concat('combined.css'))
        .pipe(miniCss())
        .pipe(gulp.dest('./app/stylesheets'));

});

//文件的复制
gulp.task('copy', function () {
    "use strict";
    //modules
    //gulp.src(['./app/partials/**', './app/main.js']).pipe(gulp.dest('./online/partials'));
    //images
    //gulp.src(['./app/images/**']).pipe(gulp.dest('./online/images'));
    //components
    gulp.src(['./app/components/**']).pipe(gulp.dest('./online/components'));
    //main文件
    gulp.src('./app/main.js').pipe(replace('kt-2016', 'kt-2016' + new Date().valueOf())).pipe(gulp.dest('./online'));
    //字体文件
    gulp.src('./app/stylesheets/fonts/**').pipe(gulp.dest('./online/stylesheets/fonts'));
});


gulp.task('cleanFiles', function () {
    console.log('..........开始构建...........');
    return gulp.src('./online/', {read: false})
            .pipe(clean());
});


gulp.task('build',function () {
    runSequence(
        //清楚文件  合并压缩css
        ['cleanFiles', 'concat'],
        //获取图片的版本号  获取合并压缩后的css版本号,并替换img的url  获取partials内的html版本号
        ['revIMG', 'revCSS', 'revPartials'],
        //替换router里html的版本号  复制静态文件
        ['revPartialsCollector', 'revHtmlCollector','copy'], function () {
            console.log('..........构建完毕..........');
        }
    )
});

//图片获取版本号
gulp.task('revIMG', function () {
    return gulp.src('./app/images/**')
            .pipe(rev())
            .pipe(gulp.dest('./online/images'))
            .pipe(rev.manifest())
            .pipe(gulp.dest('./app/rev/img'));
});


//css文件获取版本号并替换IMG的url地址
gulp.task('revCSS', function () {
    return gulp.src(['./app/rev/img/*.json','./app/stylesheets/combined.css'])
            .pipe(revCollector())
            .pipe(rev())
            .pipe(gulp.dest('./online/stylesheets'))
            .pipe(rev.manifest())
            .pipe(gulp.dest('./app/rev/css'));
});

gulp.task('revJS', function () {
    return gulp.src();
});

//partials里面获取版本号(部分html页面直接引入img标签)
gulp.task('revPartials', function () {
    return gulp.src(['./app/rev/**/*.json', './app/partials/**/*.html'])
            .pipe(revCollector())
            .pipe(rev())
            .pipe(gulp.dest('./online/partials'))
            .pipe(rev.manifest())
            .pipe(gulp.dest('./app/rev/partials'));
});

//router里面替换partials里的版本号
gulp.task('revPartialsCollector', function () {
    return gulp.src(['./app/rev/**/*.json', './app/partials/**/*.js'])
            .pipe(revCollector())
            .pipe(gulp.dest('./online/partials'))
});

//html里替换css版本号
gulp.task('revHtmlCollector', function () {
    return gulp.src(['./app/rev/**/*.json', './app/*.html'])
            .pipe(revCollector())
            .pipe(gulp.dest('./online'));
});

gulp.task('watch', function() {
    gulp.watch('less/*.less', [less]);
    gulp.watch('demo.js', [babel]);
});

gulp.task('default', ['watch']);
