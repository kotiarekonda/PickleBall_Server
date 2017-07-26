'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventPlayerListSchema = new Schema({
  EventId:{
  	type: Schema.Types.ObjectId,
  	ref: 'TournamentEvents'
  },
  TournamentId:{
  	type: Schema.Types.ObjectId,
  	ref: 'TournamentDetails'
  },
  Player1Id:{
  	type: Schema.Types.ObjectId,
  	ref: 'Users'
  },
  Player2Id:{
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  Selected:{
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('EventPlayerList', EventPlayerListSchema, "EventPlayerList");