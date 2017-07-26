'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CourtsSchema = new Schema({
  CourtName:{
  	type: String
  },
  CourtNumber:{
  	type: Number
  },
  TournamentId:{
    type: Schema.Types.ObjectId,
    ref: 'TournamentDetails'
  },
  Selected:{
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Courts', CourtsSchema, "Courts");