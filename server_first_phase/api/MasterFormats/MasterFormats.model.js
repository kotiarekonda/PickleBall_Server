'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MasterFormatsSchema = new Schema({
  FormatName: String,
  ScoreFormat: Object,
  Description: String
});

module.exports = mongoose.model('MasterFormats', MasterFormatsSchema, "MasterFormats");