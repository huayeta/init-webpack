var isProduction=(process.env.NODE_ENV==='production'?true:false);

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
];
if(isProduction)processors.push(require('cssnano'));

module.exports=processors
