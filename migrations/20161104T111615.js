'use strict';

const PhotosDatabase = require(__dirname + '/../js/photo_database.js');

module.exports = {
  up: function () {
    return new PhotosDatabase.connect(function (resolve, reject) {
      // Describe how to achieve the task.
      // Call resolve/reject at some point.
    });
  },
  down: function () {
    return new PhotosDatabase.connect(function (resolve, reject) {
      // Describe how to revert the task.
      // Call resolve/reject at some point.
    });
  }
}
