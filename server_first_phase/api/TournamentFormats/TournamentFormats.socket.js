/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Formates = require('./TournamentFormats.model');

exports.register = function(socket) {
  Formates.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Formates.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('formates:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('formates:remove', doc);
}