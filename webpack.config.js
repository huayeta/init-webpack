const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

/**
 * （postcss的插件）
 */
let processors = require('./postcss.config.js');
/*
 * （提取css文件）
 * */
const ExtractTextPlugin = require("extract-text-webpack-plugin");
/*
 * （验证config文件是否正确）
 * */
var validate = require('webpack-validator');
/*
 * （清空发布目录）
 * */
var CleanWebpackPlugin = require('clean-webpack-plugin');
/*
 * （创建html文件）
 * */
var HtmlWebpackPlugin = require('html-webpack-plugin');
/*
 *  （合并config文件）
 * */
var Merge = require('webpack-merge');
/*
 * （自动打开浏览器）
 * */
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
/*
 *  Detect how npm is run and branch based on that
 *  （当前 npm 运行）
 * */
var currentTarget = process.env.npm_lifecycle_event;

var debug,          // is debug
    devServer,      // is hrm mode
    minimize,       // is minimize
    proxy;       // is proxy


if (currentTarget == "build") { // online mode （线上模式）

    debug = false, devServer = false, minimize = true, proxy=false;

} else if (currentTarget == "dev") { // dev mode （开发模式）

    debug = true, devServer = false, minimize = false, proxy=false;

} else if (currentTarget == "dev-hrm") { // dev HRM mode （热更新模式）

    debug = true, devServer = true, minimize = false, proxy=false;
} else if (currentTarget == "dev-hrm-proxy"){ // 热替换并代理服务器

    debug = true, devServer = true, minimize = false, proxy=true;
}

var PATHS = {
    /*
     * （发布目录）
     * */
    publicPath: '/dist/',


    /*
     * public resource path
     * （公共资源目录）
     * */
    libsPath: path.resolve(process.cwd(), './libs'),


    /**
     * (bower_components)
     */
     bowersPath:path.resolve(process.cwd(), './bower_components/'),

    /*
     * resource path
     * （src 目录）
     * */
    srcPath: path.resolve(process.cwd(), 'src'),


    /*
    * node_modules path
    */
    node_modulesPath: path.resolve('./node_modules'),
}

var resolve = {
    /*
     * An array of extensions that should be used to resolve modules
     * （引用时可以忽略后缀）
     * */
    extensions: ['', '.js', '.css', '.es6', '.less', '.scss' , '.png', '.jpg', '.html', '.htm'],


    /*
     * The directory (absolute path) that contains your modules
     * */
    root: [
        PATHS.node_modulesPath
    ],


    /*
     * Replace modules with other modules or paths.
     * （别名，引用时直接可以通过别名引用）
     * */
    alias: {
        /**
         * 目录
         */
         css:path.resolve(PATHS.srcPath,'./css'),
         js:path.resolve(PATHS.srcPath,'./js'),
         fonts:path.resolve(PATHS.srcPath,'./fonts'),
         views:path.resolve(PATHS.srcPath,'views'),
         images:path.resolve(PATHS.srcPath,'images'),

        /*
         * js
         */
        jquery: path.join(PATHS.bowersPath, "./jquery/dist/jquery.min.js"),


        /*
         * css
         */
        animatecss: path.join(PATHS.bowersPath, "animate.css/animate.min.css"),
        normalizecss: path.join(PATHS.bowersPath, "normalize-css/normalize.css"),
    }
}

/**
 * 入口文件
 */
const entry_path = path.resolve(__dirname, './src/js/');
let entry_files = {};
fs.readdirSync(entry_path).filter(function(file) {
    // return file.indexOf('.js')!==-1;
    return true;
}).forEach(function(file) {
    let result = /^(.+)\.\w+?$/.exec(file);
    entry_files[result[1] ? result[1] : file] = path.resolve(entry_path, file);
})
var entry=entry_files;

/*
 * （webpack 编译后输出标识）
 * */
var output = {
    /*
     *  （输出目录）
     * */
    path: path.join(__dirname, 'dist'),

    /*
     * The publicPath specifies the public URL address of the output files when referenced in a browser
     * （发布后，资源的引用目录）
     * */
    publicPath: PATHS.publicPath,

    /*
     * Specifies the name of each output file on disk
     * （文件名称）
     * */
    filename: devServer ? 'js/[name].js' : 'js/[name]-[chunkhash:8].js',

    /*
     * The filename of non-entry chunks as relative path inside the output.path directory.
     * （按需加载模块时输出的文件名称）
     * */
    chunkFilename: devServer ? 'js/[name].js' : 'js/[name]-[chunkhash:8].js'
}

var loaders = [

    /*
     * （html loader）
     * */
    {
        test: /\.(htm|html)$/,
        loader:"raw-loader",
        // loader: "html"
        // loader: "html?-minimize"
    },


    /*
     * img loader
     * */
    {
        test: /\.(png|gif|jpe?g)$/,
        loader: 'url-loader',
        query: {
            /*
             *  limit=10000 ： 10kb
             *  图片大小小于10kb 采用内联的形式，否则输出图片
             * */
            limit: 10000,
            name: '/images/[name]-[hash:8].[ext]'
        }
    },


    /*
     * font loader
     * */
    {
        test: /\.(eot|woff|woff2|ttf|svg)$/,
        loader: 'url-loader',
        query: {
            limit: 5000,
            name: '/font/[name]-[hash:8].[ext]'
        }
    },


    /*
     * Extract css files
     * （提取css到单独文件loader）
     */
    {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!postcss-loader", {
            publicPath: '../'
        })
    },
    {
        test: /\.jsx$/,
        loader: 'babel',
        exclude: /(node_modules)/,
        query: {
            cacheDirectory: true,
            presets: ['es2015', 'react', 'stage-0'],
            plugins: ['transform-runtime']
        },
        exclude:/node_modules/
    }, {
        test: /\.es6$/,
        loader: 'babel',
        exclude: /(node_modules)/,
        query: {
            cacheDirectory: true,
            presets: ['es2015', 'stage-0'],
            plugins: ['transform-runtime']
        }
    },

];

var plugins = [
    new webpack.ProvidePlugin({
        'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch',
        // $: "jquery",
        // jQuery: "jquery",
        // "window.jQuery": "jquery"
    }),

    /*
     * gloabal flag
     * （全局标识）
     * */
    new webpack.DefinePlugin({
        /*
         * dev flag
         * （开发标识）
         * */
        __DEV__: debug,

        /*
         * proxy flag
         * （代理的标识）
         * */
        __DEVAPI__: devServer ? "/devApi/" : "''",
    }),

    new webpack.NoErrorsPlugin(),

    /*
     * common js
     * （公共js）
     * */
    new webpack.optimize.CommonsChunkPlugin(
        devServer ?
        {name: "common", filename: "js/common.js"}:
        {names: ["common", "webpackAssets"]}
    ),

    /*
     * extract css
     * （提取css文件到单独的文件中）
     */
    new ExtractTextPlugin(devServer ? "css/[name].css" : "css/[name]-[chunkhash:8].css", {allChunks: true}),

    /*
     * （发布前清空发布目录）
     * */
    new CleanWebpackPlugin(['dist'], {
        root: __dirname, // An absolute path for the root  of webpack.config.js
        verbose: true,// Write logs to console.
        dry: false // Do not delete anything, good for testing.
    }),

    /*
     * （避免在文件不改变的情况下hash值不变化）
     * */
    new webpack.optimize.OccurrenceOrderPlugin(true),

    /*
     * （删除重复依赖的文件）
     */
    new webpack.optimize.DedupePlugin(),

    /*
     *create html file
     * （创建html文件）
     * */
     new HtmlWebpackPlugin({
         filename:'views/index.htm',
         template:__dirname+'/src/views/index.htm',
         inject: 'true',

         // 需要依赖的模块
         chunks: ['common', 'index','webpackAssets'],

         // 根据依赖自动排序
         chunksSortMode: 'dependency',
         minify:{
             removeComments:true, //移除HTML中的注释
             collapseWhitespace:false, //删除空白符与换行符
         }
     }),
];

if (minimize) {
    plugins.push(
        /*
         * （压缩）
         * */
         new webpack.optimize.UglifyJsPlugin({ // js、css都会压缩
             mangle: {
                 except: ['$super', '$', 'exports', 'require', 'module', '_']
             },
             compress: {
                 warnings: false
             },
             output: {
                 comments: false,
             }
         })
    )
}

var config = {
    // context:path.resolve(__dirname,'./public/src/'),
    // entry: entry,
    entry: {
        index:__dirname+'/src/js/index',
    },
    output: output,
    module: {
        // noParse: /react|react-dom|jquery/,
        loaders: loaders,
    },
    devtool: debug ? 'source-map' : false,
    resolve: resolve,
    postcss: function() {
        return processors;
    },
    plugins: plugins,
    // externals:{
    //     'react':'React',
    //     'react-dom':'ReactDOM'
    // }
}

/*
 * （开启热更新，并自动打开浏览器）
 * */
if (devServer) {

    var port=8888;

    if(proxy){
        /*
         * （代理访问地址）
         * */
        var proxyTarget = 'http://localhost:8081/';

        config = Merge(
            config,
            {
                plugins: [
                    new webpack.HotModuleReplacementPlugin({
                        multiStep: true
                    }),
                    // new OpenBrowserPlugin({url: 'http://localhost:'+port})
                ],
                devServer: {
                    historyApiFallback: true,
                    hot: true,
                    inline: true,
                    stats: 'errors-only',
                    host: "localhost", // Defaults to `localhost`   process.env.HOST
                    port: port,  // Defaults to 8080   process.env.PORT
                    /*
                     *  代理访问
                     *  1、可以绕过同源策略 和 webpack '热更新'结合使用
                     */
                    proxy: {
                        '*': {
                            target: proxyTarget,
                            secure: true,
                            /*
                             * rewrite 的方式扩展性更强，不限制服务的名称
                             * */
                            rewrite: function (req) {
                                // req.url = req.url.replace(/^\/devApi/, '');
                            }
                        }
                    }
                }
            }
        );
    }else{

        /**
         * 热替换
         */
        config = Merge(
            config,
            {
                plugins: [
                    new webpack.HotModuleReplacementPlugin({
                        multiStep: true
                    }),
                    // new OpenBrowserPlugin({url: 'http://localhost:'+port+'/dist/views/index.htm'}),
                ],
                devServer: {
                    historyApiFallback: true,
                    hot: true,
                    inline: true,
                    stats: 'errors-only',
                    host: "localhost", // Defaults to `localhost`   process.env.HOST
                    port: port,  // Defaults to 8080   process.env.PORT]
                }
            }
        );
    }
}
module.exports = validate(config);
