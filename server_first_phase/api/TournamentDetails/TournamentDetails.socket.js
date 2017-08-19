/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var TournamentDetails = require('./TournamentDetails.model');

exports.register = function(socket) {
  TournamentDetails.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  TournamentDetails.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('TournamentDetails:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('TournamentDetails:remove', doc);
}