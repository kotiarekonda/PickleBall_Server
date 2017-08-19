'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TournamentDetailsSchema = new Schema({
  TournamentName:{
  	type: String
  },
  TournamentOwner:{
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  Logo:{
  	type: String
  },
  StartDate:{
  	type: Date
  },
  EndDate:{
  	type: Date
  },
  RegistrationStartDate:{
  	type: Date
  },
  RegistrationEndDate:{
  	type: Date
  },
  TournamentEvents:{
  	type: Array
  },
  TournamentFormates:{
  	type: Array
  },
  Description:{
  	type: String
  },
  City:{
  	type: String
  },
  State:{
  	type: String
  },
  Country:{
  	type: String
  },
  ZipCode:{
  	type: Number
  }

});

module.exports = mongoose.model('TournamentDetails', TournamentDetailsSchema, "TournamentDetails");