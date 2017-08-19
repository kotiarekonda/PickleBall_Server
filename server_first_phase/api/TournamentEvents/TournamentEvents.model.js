'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TournamentEventsSchema = new Schema({
  EventId:{
  	type: Schema.Types.ObjectId,
  	ref:"MasterEvents"
  },
  TournamentId:{
  	type: Schema.Types.ObjectId,
  	ref:"TournamentDetails"
  },
  active: Boolean
});

module.exports = mongoose.model('TournamentEvents', TournamentEventsSchema, "TournamentEvents");