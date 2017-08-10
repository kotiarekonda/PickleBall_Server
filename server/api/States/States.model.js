'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StatesSchema = new Schema({
  State:{
  	type: String
  }/*,
  ShortForm:{
  	type: String
  }*/,
  Country:{
  	type: Schema.Types.ObjectId,
  	ref: 'Country'
  }

});

module.exports = mongoose.model('States', StatesSchema);