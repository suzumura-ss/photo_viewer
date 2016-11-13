'use strict';

// http://docs.sequelizejs.com/en/v3/docs/models-definition/
const Sequelize = require('sequelize');
const PhotosDatabase = {
  connect: function(database_path) {
    const sequelize = new Sequelize('app', '', '', {
      dialect: 'sqlite',
      storage: database_path
    });

    const Album = sequelize.define('Album', {
      Name:  Sequelize.STRING(192)
    });

    const Photo = sequelize.define('Photo', {
      FileName: {
        type: Sequelize.STRING(192),
        allowNull: false
      },
      Directory: {
        type: Sequelize.STRING(192),
        allowNull: false
      },
      ISO:                    Sequelize.FLOAT,
      FNumber:                Sequelize.FLOAT,
      ShutterSpeed:           Sequelize.STRING(64),
      ExposureCompensation:   Sequelize.FLOAT,
      ExposureProgram:        Sequelize.STRING,
      FocalLength:            Sequelize.STRING,
      LensID:                 Sequelize.STRING(192),
      AFAreas:                Sequelize.STRING(192),
      DateTimeOriginal:       Sequelize.DATE,
      Orientation:            Sequelize.STRING,
      ImageWidth: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ImageHeight:  {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
    Album.hasMany(Photo);

    const Thumbnail = sequelize.define('Thumbnail', {
      Image: {
        type: Sequelize.BLOB('long'),
        allowNull: false
      },
      ImageWidth: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ImageHeight:  {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
    Photo.hasOne(Thumbnail);

    const Preview = sequelize.define('Preview', {
      ImageWidth: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ImageHeight:  {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
    Photo.hasOne(Preview);

    return {Photo:Photo, Thumbnail:Thumbnail, Preview:Preview, Album:Album};
  }
};


module.exports = PhotosDatabase;
