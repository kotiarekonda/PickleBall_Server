'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CountrySchema = new Schema({
  Country:{
  	type: String
  },
  CountryCode:{
  	type: String
  },
  Status:{
  	type: Boolean
  }
});

module.exports = mongoose.model('Country', CountrySchema);