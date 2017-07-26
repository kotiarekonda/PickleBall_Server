/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Sheduledmatches = require('./SheduledMatches.model');

exports.register = function(socket) {
  Sheduledmatches.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Sheduledmatches.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
	/*var obj = {};
	obj.MatchId = doc._id;
	obj.TeamAPoints = doc.FirstServe.Team1.TeamAPoints;
	obj.TeamBPoints = doc.FirstServe.Team2.TeamBPoints;
	obj.Team1Active = doc.FirstServe.Team1Active;
	obj.Team2Active = doc.FirstServe.Team2Active;
  obj.MatchStatus = doc.MatchStatus;
  socket.emit('livescore'+doc.TournamentId, obj);*/
}

function onRemove(socket, doc, cb) {
  socket.emit('sheduledmatches:remove', doc);
}