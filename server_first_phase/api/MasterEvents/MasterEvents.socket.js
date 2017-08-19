/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var MasterEvents = require('./MasterEvents.model');

exports.register = function(socket) {
  MasterEvents.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  MasterEvents.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('MasterEvents:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('MasterEvents:remove', doc);
}