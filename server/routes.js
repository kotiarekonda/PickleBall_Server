/**
 * Main application routes
 */

'use strict';

var path = require('path');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/TournamentRefereess', require('./api/TournamentReferees'));
  app.use('/api/TournamentEventss', require('./api/TournamentEvents'));
  app.use('/api/MasterEventss', require('./api/MasterEvents'));
  app.use('/api/MasterFormatss', require('./api/MasterFormats'));
  app.use('/api/TournamentLocationss', require('./api/TournamentLocations'));
  app.use('/api/EventPlayerLists', require('./api/EventPlayerList'));
  app.use('/api/TournamentDetailss', require('./api/TournamentDetails'));
  app.use('/api/Courtss', require('./api/Courts'));
  app.use('/api/ScoreBoards', require('./api/ScoreBoard'));
  app.use('/api/TournamentFormatss', require('./api/TournamentFormats'));
  app.use('/api/SheduledMatchess', require('./api/SheduledMatches'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/Users', require('./api/Users'));

  app.use('/auth', require('./auth'));
  

};
