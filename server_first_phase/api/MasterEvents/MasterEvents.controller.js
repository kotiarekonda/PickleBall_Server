'use strict';

var _ = require('lodash');
var MasterEvents = require('./MasterEvents.model');

// Get list of MasterEventss
exports.index = function(req, res) {
  MasterEvents.find(function (err, MasterEventss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(MasterEventss);
  });
};

// Get a single MasterEvents
exports.show = function(req, res) {
  MasterEvents.findById(req.params.id, function (err, MasterEvents) {
    if(err) { return handleError(res, err); }
    if(!MasterEvents) { return res.status(404).send('Not Found'); }
    return res.json(MasterEvents);
  });
};

// Creates a new MasterEvents in the DB.
exports.create = function(req, res) {
  MasterEvents.create(req.body, function(err, MasterEvents) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(MasterEvents);
  });
};

// Updates an existing MasterEvents in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  MasterEvents.findById(req.params.id, function (err, MasterEvents) {
    if (err) { return handleError(res, err); }
    if(!MasterEvents) { return res.status(404).send('Not Found'); }
    var updated = _.merge(MasterEvents, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(MasterEvents);
    });
  });
};

// Deletes a MasterEvents from the DB.
exports.destroy = function(req, res) {
  MasterEvents.findById(req.params.id, function (err, MasterEvents) {
    if(err) { return handleError(res, err); }
    if(!MasterEvents) { return res.status(404).send('Not Found'); }
    MasterEvents.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}