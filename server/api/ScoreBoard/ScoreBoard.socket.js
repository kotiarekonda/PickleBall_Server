/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Scoreboard = require('./ScoreBoard.model');
var Sheduledmatches = require('../../api/SheduledMatches/SheduledMatches.model');
function handleError(res, err) {
  return res.status(500).send(err);
}

exports.register = function(socket) {
  Scoreboard.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Scoreboard.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  Sheduledmatches.find({_id: doc.MatchId},{GameStatus: 1, TournamentId: 1}, function(err, matchedetails){
  	if(err){ return handleError(res, err); }
    if(matchedetails[0].GameStatus === 1 || matchedetails[0].GameStatus === 2){
      if(doc.ScoreBoard !== undefined && doc.TeamsWithServeDetails !== undefined){
        var obj = {};
        obj.MatchId = doc.MatchId;
        obj.TeamAPoints = doc.TeamsWithServeDetails.Team1.TeamAPoints;
        obj.TeamBPoints = doc.TeamsWithServeDetails.Team2.TeamBPoints;
        obj.Team1Active = doc.TeamsWithServeDetails.Team1Active;
        obj.Team2Active = doc.TeamsWithServeDetails.Team2Active;
        obj.GameStatus = matchedetails[0].GameStatus;
          socket.emit('livescore'+matchedetails[0].TournamentId, obj);
          socket.emit('livescore'+doc.MatchId, doc);
      }
    }
  }) 
}

function onRemove(socket, doc, cb) {
  socket.emit('scoreboard:remove', doc);
}