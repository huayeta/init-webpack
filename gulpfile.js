var gulp=require('gulp');
var del=require('del');
var postcss=require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var browserSync=require('browser-sync').create();
var runSequence=require('gulp-run-sequence');
var gulpWebpack=require('webpack-stream');
var webpack=require('webpack');
var changed=require('gulp-changed');

var isProduction=(process.env.NODE_ENV==='production'?true:false);

var postcssFunctions = require('postcss-functions')({
    functions: {
        px:function(px){
            return px*15/640+'rem';
        }
    }
});
var processors=[
    require('postcss-import'),//合并@import的样式到主样式里面
    // require('cssnext'),
    require('precss'),//预处理语言
    require('postcss-will-change'),//提前动画
    require('postcss-color-rgba-fallback'),//rgba的兼容
    require('postcss-opacity'),//opacity的兼容
    require('postcss-pseudoelements'),//::伪元素的兼容
    require('postcss-vmin'),//vmin单位的兼容
    require('pixrem'),//rem单位的兼容
    require('css-mqpacker'),//合并媒体查询的样式
    require('autoprefixer'),//自动添加前缀
    require('postcss-each'),//each循环
    // require('cssnano'),//压缩合并优化
    postcssFunctions,
];
if(isProduction)processors.push(require('cssnano'));
global.processors=processors;

gulp.task('default',['server'])

// 发布
gulp.task('publish',function(cb){
    runSequence('clean','postcss',cb);
})

//清理项目文件
gulp.task('clean',['postcss-clean'])

//webpack
gulp.task('webpack',function(){
    return gulp.src('./public/src/js//entry/index.js')
    .pipe(gulpWebpack(require('./webpack.config.js'),webpack))
    .pipe(gulp.dest('./dest/js/'))
})

//postcss
var baseCss=['./public/**/*.css'];
//插件
gulp.task('postcss',function(){
    if(isProduction){
        return gulp.src(baseCss)
            .pipe(postcss(processors))
            .pipe(gulp.dest('./dest/'))
    }else{
        return gulp.src(baseCss)
            .pipe(changed('./dest/'))
            .pipe( sourcemaps.init() )
            .pipe(postcss(processors))
            .pipe( sourcemaps.write('.') )
            .pipe(gulp.dest('./dest/'))
            .pipe(browserSync.stream({once:true}));
    }
})
gulp.task('postcss-w',function(){
    gulp.watch(baseCss,['postcss']);
})
gulp.task('postcss-clean',function(cb){
    del(['./dest/']).then((path) => {
        console.log(path);
        cb();
    })
})
gulp.task('postcss-start',['postcss','postcss-w']);

//本地服务器
gulp.task('server',['postcss-start'],function(cb){
    browserSync.init({
        server: {
            baseDir: "./"
        },
        port:8080,
        open:false
    });
    // 自动刷新
    var watch_htm=['./views/*.htm','./views/**/*.htm'];
    var watch_js=['./public/js/*.js','./public/js/**/*.js'];
    gulp.watch(watch_htm).on('change', browserSync.reload);
    gulp.watch(watch_js).on('change', browserSync.reload);
});
