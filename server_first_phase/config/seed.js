/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// Insert seed models below
var States = require('../api/States/States.model');
var Country = require('../api/Country/Country.model');
var TournamentReferees = require('../api/TournamentReferees/TournamentReferees.model');
var TournamentEvents = require('../api/TournamentEvents/TournamentEvents.model');
var MasterEvents = require('../api/MasterEvents/MasterEvents.model');
var MasterFormats = require('../api/MasterFormats/MasterFormats.model');
var Locations = require('../api/locations/locations.model');
var EventPlayerList = require('../api/EventPlayerList/EventPlayerList.model');
var TournamentDetails = require('../api/TournamentDetails/TournamentDetails.model');
var Players = require('../api/players/players.model');
var Courts = require('../api/courts/courts.model');
var Scoreboard = require('../api/scoreboard/scoreboard.model');
var Formates = require('../api/formates/formates.model');
var Events = require('../api/events/events.model');
var Sheduledmatches = require('../api/sheduledmatches/sheduledmatches.model');
var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');

// Insert seed data below
var StatesSeed = require('../api/States/States.seed.json');
var CountrySeed = require('../api/Country/Country.seed.json');
var TournamentRefereesSeed = require('../api/TournamentReferees/TournamentReferees.seed.json');
var TournamentEventsSeed = require('../api/TournamentEvents/TournamentEvents.seed.json');
var MasterEventsSeed = require('../api/MasterEvents/MasterEvents.seed.json');
var MasterFormatsSeed = require('../api/MasterFormats/MasterFormats.seed.json');
var locationsSeed = require('../api/locations/locations.seed.json');
var EventPlayerListSeed = require('../api/EventPlayerList/EventPlayerList.seed.json');
var TournamentDetailsSeed = require('../api/TournamentDetails/TournamentDetails.seed.json');
var playersSeed = require('../api/players/players.seed.json');
var courtsSeed = require('../api/courts/courts.seed.json');
var scoreboardSeed = require('../api/scoreboard/scoreboard.seed.json');
var formatesSeed = require('../api/formates/formates.seed.json');
var eventsSeed = require('../api/events/events.seed.json');
var sheduledmatchesSeed = require('../api/sheduledmatches/sheduledmatches.seed.json');
var thingSeed = require('../api/thing/thing.seed.json');

// Insert seed inserts below
States.find({}).remove(function() {
	States.create(StatesSeed);
});

Country.find({}).remove(function() {
	Country.create(CountrySeed);
});

TournamentReferees.find({}).remove(function() {
	TournamentReferees.create(TournamentRefereesSeed);
});

TournamentEvents.find({}).remove(function() {
	TournamentEvents.create(TournamentEventsSeed);
});

MasterEvents.find({}).remove(function() {
	MasterEvents.create(MasterEventsSeed);
});

MasterFormats.find({}).remove(function() {
	MasterFormats.create(MasterFormatsSeed);
});

Locations.find({}).remove(function() {
	Locations.create(locationsSeed);
});

EventPlayerList.find({}).remove(function() {
	EventPlayerList.create(EventPlayerListSeed);
});

TournamentDetails.find({}).remove(function() {
	TournamentDetails.create(TournamentDetailsSeed);
});

Players.find({}).remove(function() {
	Players.create(playersSeed);
});

Courts.find({}).remove(function() {
	Courts.create(courtsSeed);
});

Scoreboard.find({}).remove(function() {
	Scoreboard.create(scoreboardSeed);
});

Formates.find({}).remove(function() {
	Formates.create(formatesSeed);
});

Events.find({}).remove(function() {
	Events.create(eventsSeed);
});

Sheduledmatches.find({}).remove(function() {
	Sheduledmatches.create(sheduledmatchesSeed);
});

Thing.find({}).remove(function() {
  Thing.create(thingSeed);
});