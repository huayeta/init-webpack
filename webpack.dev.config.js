const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
let processors = require('./postcss.config.js');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const entry_path = path.resolve(__dirname, './public/src/js/entry/');
let entry_files = {};
fs.readdirSync(entry_path).filter(function(file) {
    // return file.indexOf('.js')!==-1;
    return true;
}).forEach(function(file) {
    let result = /^(.+)\.\w+?$/.exec(file);
    entry_files[result[1] ? result[1] : file] = path.resolve(entry_path, file);
})

var isProduction = (process.env.NODE_ENV === 'production' ? true : false);

var plugins = [
    new webpack.ProvidePlugin({
        'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    }),
    new webpack.DefinePlugin({
        __DEV__: isProduction,
        __PRERELEASE__: isProduction
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin("commons", "commons.js"),
    new ExtractTextPlugin("[name].css"),
];

if (isProduction) {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            test: /(\.jsx|\.js|\.es6)$/,
            compress: {
                warnings: false
            }
        })
    )
}

var configs = {
    // context:path.resolve(__dirname,'./public/src/'),
    entry: entry_files,
    output: {
        path: path.resolve(__dirname, './dist/js/'),
        publicPath: '/dist/js/',
        chunkFilename: '[id]-[name]-[hash]-[chunkhash].js',
        filename: '[name].js'
    },
    module: {
        noParse: /react|react-dom/,
        loaders: [{
            test: /\.css$/,
            // loader: 'style-loader!css-loader!postcss-loader'
            loader:ExtractTextPlugin.extract("style-loader", "css-loader",'postcss-loader')
        }, {
            test: /\.jsx$/,
            loader: 'babel',
            exclude: /(node_modules)/,
            query: {
                cacheDirectory: true,
                presets: ['es2015', 'react', 'stage-0'],
                plugins: ['transform-runtime']
            }
        }, {
            test: /\.es6$/,
            loader: 'babel',
            exclude: /(node_modules)/,
            query: {
                cacheDirectory: true,
                presets: ['es2015', 'stage-0'],
                plugins: ['transform-runtime']
            }
        }, {
            test: /.(png|jpg)$/,
            loader: "url-loader?limit=8192"
        }]
    },
    devtool: isProduction ? null : 'source-map',
    resolve: {
        extensions: ['', '.js', '.json', '.es6', '.jsx','.css'],
        modules: [path.resolve(__dirname, './node_modules'), path.resolve(__dirname, './bower_components')],
        // mainFields:['main','index'],
        // descriptionFiles:['package.json','bower.json'],
        moduleExtensions: ['-loader'],
        alias: {
            js: path.resolve(__dirname, './public/src/js/'),
            css: path.resolve(__dirname, './public/src/css/')
        },
    },
    postcss: function() {
        return processors;
    },
    plugins: plugins
}
module.exports = configs;
