/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var EventPlayerList = require('./EventPlayerList.model');

exports.register = function(socket) {
  EventPlayerList.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  EventPlayerList.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('EventPlayerList:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('EventPlayerList:remove', doc);
}