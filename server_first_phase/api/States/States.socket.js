/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var States = require('./States.model');

exports.register = function(socket) {
  States.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  States.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('States:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('States:remove', doc);
}