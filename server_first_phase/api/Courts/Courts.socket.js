/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Courts = require('./Courts.model');

exports.register = function(socket) {
  Courts.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Courts.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('courts:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('courts:remove', doc);
}