'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FormatesSchema = new Schema({
  FormatId:{
    type: Schema.Types.ObjectId,
    ref: 'MasterFormats'
  },
  TournamentId:{
    type: Schema.Types.ObjectId,
    ref: 'TournamentDetails'
  }
});

module.exports = mongoose.model('TournamentFormats', FormatesSchema, "TournamentFormats");