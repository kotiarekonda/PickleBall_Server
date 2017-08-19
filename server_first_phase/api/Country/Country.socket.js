/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Country = require('./Country.model');

exports.register = function(socket) {
  Country.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Country.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('Country:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('Country:remove', doc);
}