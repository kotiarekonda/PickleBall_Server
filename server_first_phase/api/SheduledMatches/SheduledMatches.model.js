'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SheduledmatchesSchema = new Schema({
  Date:{
    type: Date,
    default: Date.now
  },
  Time: {
    type: String
  },
  RefereeName:{
    type: String,
    lowercase: true
  },
  TournamentId: {
    type: Schema.Types.ObjectId,
    ref: 'TournamentDetails'
  },
  TournmentOwner:{
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  CourtId: {
    type: Schema.Types.ObjectId,
    ref: 'Courts'
  },
  EventId: {
  	type: Schema.Types.ObjectId,
  	ref: 'TournamentEvents'
  },
  FormatId: {
  	type: Schema.Types.ObjectId,
  	ref: 'TournamentFormats'
  },
  TeamA_Player1_Id:{
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  TeamA_Player2_Id:{
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  TeamB_Player1_Id:{
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  TeamB_Player2_Id:{
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  RefereeId:{
  	type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  GameStatus:{
    type: Number,
    default: 0
  },
  RefereePassword:{
    type: String,
    lowercase: true
  }

});

module.exports = mongoose.model('SheduledMatches', SheduledmatchesSchema, "SheduledMatches");