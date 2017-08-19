/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var TournamentReferees = require('./TournamentReferees.model');

exports.register = function(socket) {
  TournamentReferees.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  TournamentReferees.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('TournamentReferees:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('TournamentReferees:remove', doc);
}