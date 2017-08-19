'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TournamentRefereesSchema = new Schema({
  RefereeId: {
  	type: Schema.Types.ObjectId,
  	ref: 'Users'
  },
  TournamentId: {
  	type: Schema.Types.ObjectId,
  	ref: 'TournamentDetails'
  },
  Selected:{
  	type: Boolean,
  	default: false
  }
});

module.exports = mongoose.model('TournamentReferees', TournamentRefereesSchema);