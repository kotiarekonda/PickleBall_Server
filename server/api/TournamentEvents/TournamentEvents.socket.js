/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var TournamentEvents = require('./TournamentEvents.model');

exports.register = function(socket) {
  TournamentEvents.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  TournamentEvents.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('TournamentEvents:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('TournamentEvents:remove', doc);
}