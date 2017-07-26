/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Locations = require('./TournamentLocations.model');

exports.register = function(socket) {
  Locations.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Locations.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('locations:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('locations:remove', doc);
}