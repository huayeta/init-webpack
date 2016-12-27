'use strict';

var path=require('path');
var webpack=require('webpack');

var JS_PATH=path.resolve(__dirname,'./public/src/');
var node_modules=path.resolve(__dirname,'./node_modules/');
var bower_components=path.resolve(__dirname,'./bower_components/');
var DATE=Date.now();

var isProduction=(process.env.NODE_ENV==='production'?true:false);

var plugins=[
  new webpack.ProvidePlugin({
    'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
  }),
  new webpack.DefinePlugin({
      'process.env.NODE_ENV': (!isProduction?'"development"':'"production"')
  }),
  new webpack.NoErrorsPlugin()
];

if(isProduction){
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            test:/(\.jsx|\.js|\.es6)$/,
            compress:{
                warnings:false
            }
        })
    )
}
//插件
var processors=global.processors;
var jsPlugins= ['transform-runtime'];
//得到入口文件
var files;
files=fs.readdirSync('./public/js/src/entry/').filter((file) => {
    return (file.indexOf('.')!==-1) && (/\.js$/.test(file));
});

var config ={
    context:__dirname+'./public/js/src/',
    resolve:{
        alias:{
            'lib':path.resolve(__dirname,'./public/js/lib'),
            'src':path.resolve(__dirname,'./public/js/src'),
            'images':path.resolve(__dirname,'./public/images'),
        },
        root:[
            node_modules,bower_components
        ],
        extensions:['','.js','.jsx','.es6']
    },
    entry:files,
    output:{
        path:path.join(__dirname,'./js/'),
        publicPath:'/dest/js/',
        chunkFilename:'[name]-[chunkhash].js',
        filename:'[name].js'
    },
    module:{
        loaders:[
            {test:/\.css$/,loader:'style-loader!css-loader!postcss-loader'},
            {
                test:/\.jsx$/,
                loader:'babel',
                exclude: /(node_modules)/,
                query:{
                    cacheDirectory:true,
                    presets:['es2015','react','stage-0'],
                    plugins: jsPlugins
                }
            },
            {
                test:/\.es6$/,
                loader:'babel',
                exclude: /(node_modules)/,
                query:{
                    cacheDirectory:true,
                    presets:['es2015','stage-0'],
                    plugins: jsPlugins
                }
            },
            {test: /.(png|jpg)$/, loader: "url-loader?limit=25000"}
        ],
        noParse:[]
    },
    postcss:function(){
        return processors;
    },
    plugins:plugins,
    devtool : isProduction?null:'source-map'
}


module.exports = config;
