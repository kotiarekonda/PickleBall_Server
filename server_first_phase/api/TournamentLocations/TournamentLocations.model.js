'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LocationsSchema = new Schema({
  name:{
  	type: String
  },
  Zip:{
  	type: String
  },
  locations:[
  	{
  	  image:{
	  	type: String
	  },
	  Address1:{
	  	type: String
	  },
	  Address2:{
	  	type: String
	  },
	  City:{
	  	type: String
	  },
	  State:{
	  	type: String
	  },
	  Distance:{
	  	type: String
	  },
	  Status:{
	  	type: Boolean,
	  	default: true
	  }
  	}
  ]
});

module.exports = mongoose.model('Locations', LocationsSchema);