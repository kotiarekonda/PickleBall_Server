'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ScoreboardSchema = new Schema({
  MatchId:{
  	type: Schema.Types.ObjectId,
  	ref: 'SheduledMatches'
  },
  TournamentId:{
    type: Schema.Types.ObjectId,
    ref:"TournamentDetails"
  },
  MatchStartTime:{
    type: String
  },
  MatchEndTime:{
    type: String
  },
  ServingTeamWristBandInfo:{
    type: String
  },
  ReceivingTeamWristBandInfo:{
    type: String
  },
  TeamsWithServeDetails:{
    type: Object
  },
  ScoreBoard:{
    type: Object
  }
});

module.exports = mongoose.model('Scoreboard', ScoreboardSchema);