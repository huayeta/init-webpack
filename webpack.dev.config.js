const path=require('path');
const fs=require('fs');

const entry_path=path.resolve(__dirname,'./public/src/js/src/entry/');
let entry_files={};
fs.readdirSync(entry_path).filter(function(file){
    return file.indexOf('.js')!==-1;
}).forEach(function(file){
    let result=/^(.+)\.js$/.exec(file);
    entry_files[result[1]?result[1]:file]=path.resolve(__dirname,'./public/js/src/entry/'+file);
})

var configs={
    entry:entry_files,
    output:{
        path:__dirname+'./',
        filename:'[name].js',
        sourceMapFilename:'[file].map'
    }
}
module.exports = configs;
