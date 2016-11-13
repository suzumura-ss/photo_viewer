let app;
try {
  const remote = require('electron').remote;
  app = remote.require('electron').app;
} catch (e) {
  app = require('electron').app;
}
const DbFileName = app.getPath('userData') + '/application.sqlite3';
const {Photo, Thumbnail, Preview, Album} = require(__dirname + '/photo_database').connect(DbFileName);
const ExifReader = require(__dirname + '/exifreader');


function createThumbnailAndPreview(photo, exif) {
  var t = Thumbnail.create({
    ImageWidth: exif.Thumbnail.ImageWidth,
    ImageHeight: exif.Thumbnail.ImageWidth,
    Image: exif.ThumbnailImage,
    PhotoId: photo.id
  });
  var p = Preview.create({
    ImageWidth: exif.Preview.ImageWidth,
    ImageHeight: exif.Preview.ImageWidth,
    PhotoId: photo.id
  });
  return Promise.all([photo, t, p]);
}


class Image {
  /*
    @return Promise of [photo, thumbnail, preview]
  */
  static findOrCreateWithFile(filePath) {
    const parts = filePath.split('/');
    const fileName = parts[parts.length-1];
    return Photo.find({where: {FileName: fileName}}).then((photo)=>{
      if (photo) {
        return Promise.all([photo, photo.getThumbnail(), photo.getPreview()]);
      }
      return ExifReader.parse(filePath).then((exif)=>{
        return Image.createWithExif(exif);
      });
    });
  }

  /*
    @return Promise of [photo, thumbnail, preview]
  */
  static findOrCreateWithExif(exif) {
    return Photo.findOrCreate({
      where: { FileName: exif.FileName},
      defaults: exif
    }).then((result)=>{
      var photo = result[0];
      if (result[1]) {
        return createThumbnailAndPreview(photo, exif);
      } else {
        return Promise.all([photo, photo.getThumbnail(), photo.getPreview()]);
      }
    });
  }

  /*
    @return Promise of [photo, thumbnail, preview]
  */
  static createWithExif(exif) {
    return Photo.create(exif).then((photo)=>{
      return createThumbnailAndPreview(photo, exif);
    });
  }

  static migrate() {
    const run_migrate = ()=>{
      // https://github.com/sequelize/umzug
      const Umzug = require('umzug');
      const Sequelize = require('sequelize');
      const umzugs = [Photo, Thumbnail, Preview, Album].map((model)=>{
        return new Umzug({
          storage: 'Sequelize',
          storageOptions: {
            model: model,
            columnName: 'migration',
            columnType: new Sequelize.STRING(100)
          }
        });
      });
      console.log('database file', DbFileName);
      umzugs.forEach((umzug)=>{
        umzug.execute({migrations:[''], method: 'up'})
        .then(umzug, console.log)
      });
    }
    Photo.count().catch((e)=>{
      run_migrate();
    });
  }
}

module.exports = {Image, Photo, Thumbnail, Preview, Album};
