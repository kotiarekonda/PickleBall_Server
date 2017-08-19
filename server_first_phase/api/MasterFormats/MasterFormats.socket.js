/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var MasterFormats = require('./MasterFormats.model');

exports.register = function(socket) {
  MasterFormats.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  MasterFormats.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('MasterFormats:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('MasterFormats:remove', doc);
}