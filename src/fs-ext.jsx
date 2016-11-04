'use strict';

const FS = require('fs');
const Sugar = require('Sugar');
Sugar.extend();

function enumFilesSync(dir, body_pattern) {
  if (!/\/$/.test(dir)) {
    dir += '/';
  }
  var result = FS.readdirSync(dir).map((file)=>{
    var path = dir + file;
    if (FS.statSync(path).isDirectory()) {
      return enumFilesSync(path, body_pattern);
    }
    if (body_pattern.test(file)) {
      return path;
    }
    return undefined;
  });
  return result.flatten().filter((a)=>{ return !!a});
};


function enumFiles(dir, body_pattern) {
  return new Promise((resolve, reject)=>{
    resolve(enumFilesSync(dir, body_pattern));
  });
};


module.exports = {
  enumFiles,
  enumFilesSync,
  extend: function(className) {
    className.enumFiles = enumFiles;
    className.enumFilesSync = enumFilesSync;
  }
}
