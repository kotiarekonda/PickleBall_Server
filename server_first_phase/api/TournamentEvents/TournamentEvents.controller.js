'use strict';

var _ = require('lodash');
var TournamentEvents = require('./TournamentEvents.model');

// Get list of TournamentEventss
exports.index = function(req, res) {
  TournamentEvents.find(function (err, TournamentEventss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(TournamentEventss);
  });
};

// Get a single TournamentEvents
exports.show = function(req, res) {
  TournamentEvents.findById(req.params.id, function (err, TournamentEvents) {
    if(err) { return handleError(res, err); }
    if(!TournamentEvents) { return res.status(404).send('Not Found'); }
    return res.json(TournamentEvents);
  });
};

// Creates a new TournamentEvents in the DB.
exports.create = function(req, res) {
  TournamentEvents.create(req.body, function(err, TournamentEvents) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(TournamentEvents);
  });
};

// Updates an existing TournamentEvents in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  TournamentEvents.findById(req.params.id, function (err, TournamentEvents) {
    if (err) { return handleError(res, err); }
    if(!TournamentEvents) { return res.status(404).send('Not Found'); }
    var updated = _.merge(TournamentEvents, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(TournamentEvents);
    });
  });
};

// Deletes a TournamentEvents from the DB.
exports.destroy = function(req, res) {
  TournamentEvents.findById(req.params.id, function (err, TournamentEvents) {
    if(err) { return handleError(res, err); }
    if(!TournamentEvents) { return res.status(404).send('Not Found'); }
    TournamentEvents.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}