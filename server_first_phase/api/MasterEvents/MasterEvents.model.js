'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MasterEventsSchema = new Schema({
  EventName: String,
  EventType: String,
  Description: String
});

module.exports = mongoose.model('MasterEvents', MasterEventsSchema, "MasterEvents");