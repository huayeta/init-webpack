const path=require('path');
const fs=require('fs');

const entry_path=path.resolve(__dirname,'./public/src/js/entry/');
let entry_files={};
fs.readdirSync(entry_path).filter(function(file){
    // return file.indexOf('.js')!==-1;
    return true;
}).forEach(function(file){
    let result=/^(.+)\.\w+?$/.exec(file);
    entry_files[result[1]?result[1]:file]=path.resolve(__dirname,'./public/src/js/entry/'+file);
})

var configs={
    context:path.resolve(__dirname,'./public/src/'),
    entry:entry_files,
    output:{
        path:__dirname+'./',
        filename:'[name].js'
    },
    module:{
        noParse:/react|react-dom/,
        loaders:[
            {
                test:/\.css$/,
                loader:'style-loader!css-loader!postcss-loader'
            },
            {
                test:/\.es6$/,
                loader:'babel-loader',
                exclude: /(node_modules)/,
                query:{
                    cacheDirectory:true,
                    presets:['es2015','stage-0']
                }
            }
        ]
    },
}
module.exports = configs;
