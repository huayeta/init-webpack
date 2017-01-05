const path=require('path');
const fs=require('fs');
const webpack=require('webpack');
let processors=require('./postcss.config.js');

const entry_path=path.resolve(__dirname,'./public/src/js/entry/');
let entry_files={};
fs.readdirSync(entry_path).filter(function(file){
    // return file.indexOf('.js')!==-1;
    return true;
}).forEach(function(file){
    let result=/^(.+)\.\w+?$/.exec(file);
    entry_files[result[1]?result[1]:file]='./js/entry/'+file;
})

var isProduction=(process.env.NODE_ENV==='production'?true:false);

var plugins=[
  new webpack.ProvidePlugin({
    'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
  }),
  new webpack.DefinePlugin({
      'process.env.NODE_ENV': (!isProduction?'"development"':'"production"')
  }),
  new webpack.NoErrorsPlugin(),
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

var configs={
    context:path.resolve(__dirname,'./public/src/'),
    entry:entry_files,
    output:{
        path:__dirname,
        filename:'[name].js',
        libraryTarget: 'umd'
    },
    module:{
        noParse:/react|react-dom/,
        loaders:[
            {
                test:/\.css$/,
                loader: [
                  'style-loader',
                  { loader: 'css-loader', options: { modules: true, importLoaders: 1 } },
                //   { loader: 'postcss-loader', options: { plugins: () => [...processors] } },
                ],
                include:['./css'],
            },
            {
                test:/\.es6$/,
                loader:'babel-loader',
                query:{
                    presets:['es2015','stage-0'],
                    cacheDirectory:true,
                    plugins: ['transform-runtime']
                },
                include:['./js'],
                exclude:/(node_modules|bower_components)/
            }
        ]
    },
    devtool: isProduction?null:'source-map',
    resolve:{
        extensions:['.js','.json','.es6','.jsx'],
        modules:['node_modules','bower_components'],
        alias:{
            js:path.resolve(__dirname,'./public/src/js/'),
            css:path.resolve(__dirname,'./public/src/css/')
        }
    },
    plugins:plugins
}
module.exports = configs;
