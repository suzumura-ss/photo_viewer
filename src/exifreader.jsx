'use strict';

const StreamBuffer = require('stream-buffers');
const ExifTool2 = require('exiftool2');

function toBase64Image(imageStr) {
  if (imageStr && imageStr.substr(0, 7) === 'base64:') {
    return 'data:image/jpeg;base64,' + imageStr.substr(7, imageStr.length-7);
  } else {
    return undefined;
  }
}


function read_exif(options, parseSubImages, block) {
  let result;
  ExifTool2.exec(options).on('exif', (e)=>{
    let thumbStr, previewStr
    var readSubImage = (type, base64)=>{
      if (!base64) {
        result[type] = '';
        return;
      }
      var img = new StreamBuffer.ReadableStreamBuffer();
      var bin = new Buffer(base64.substr(7, base64.length-7), 'base64');
      img.put(bin);
      img.stop();
      img.pipe(ExifTool2.exec(['-']).on('exif', (t)=>{
        result[type] = t[0];
        if (result.Thumbnail && result.Preview) block(result);
      }));
    };
    if (e[0].ThumbnailImage && e[0].ThumbnailImage.substr(0, 7) === 'base64:') {
      thumbStr = e[0].ThumbnailImage;
    }
    if (e[0].PreviewImage && e[0].PreviewImage.substr(0, 7) === 'base64:') {
      previewStr = e[0].PreviewImage;
    }
    result = e[0];
    if (result.DateTimeOriginal) {
      result.DateTimeOriginal = result.DateTimeOriginal.replace(':', '-').replace(':', '-')
    }
    if (parseSubImages) {
      readSubImage('Thumbnail', thumbStr);
      readSubImage('Preview', previewStr);
      result.ThumbnailImage = toBase64Image(result.ThumbnailImage);
      result.PreviewImage = undefined;
      if (!thumbStr && !previewStr) block(result);
    } else {
      block(result);
    }
  });
};


const Queue = require('queue')({
  concurrency: 5
});


class ExifReader {
  static parse(fileName) {
    return new Promise((resolve, reject)=>{
      Queue.push((cb)=>{
        read_exif(['-b', fileName], true, (r)=>{
          resolve(r);
          cb();
        });
      });
      Queue.start();
    });
  }

  static thumbnail(fileName) {
    return new Promise((resolve, reject)=>{
      Queue.push((cb)=>{
        read_exif(['-b', '-ThumbnailImage', fileName], false, (r)=>{
          resolve(toBase64Image(r.ThumbnailImage));
          cb();
        });
      });
      Queue.start();
    });
  }

  static preview(fileName) {
    return new Promise((resolve, reject)=>{
      Queue.push((cb)=>{
        read_exif(['-b', '-PreviewImage', fileName], false, (r)=>{
          resolve(toBase64Image(r.PreviewImage));
          cb();
        });
      });
      Queue.start();
    });
  }
}

module.exports = ExifReader;
