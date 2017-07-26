'use strict';

var _ = require('lodash');
var TournamentReferees = require('./TournamentReferees.model');

// Get list of TournamentRefereess
exports.index = function(req, res) {
  TournamentReferees.find(function (err, TournamentRefereess) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(TournamentRefereess);
  });
};

// Get a single TournamentReferees
exports.show = function(req, res) {
  TournamentReferees.findById(req.params.id, function (err, TournamentReferees) {
    if(err) { return handleError(res, err); }
    if(!TournamentReferees) { return res.status(404).send('Not Found'); }
    return res.json(TournamentReferees);
  });
};

// Creates a new TournamentReferees in the DB.
exports.create = function(req, res) {
  TournamentReferees.create(req.body, function(err, TournamentReferees) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(TournamentReferees);
  });
};

// Updates an existing TournamentReferees in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  TournamentReferees.findById(req.params.id, function (err, TournamentReferees) {
    if (err) { return handleError(res, err); }
    if(!TournamentReferees) { return res.status(404).send('Not Found'); }
    var updated = _.merge(TournamentReferees, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(TournamentReferees);
    });
  });
};

// Deletes a TournamentReferees from the DB.
exports.destroy = function(req, res) {
  TournamentReferees.findById(req.params.id, function (err, TournamentReferees) {
    if(err) { return handleError(res, err); }
    if(!TournamentReferees) { return res.status(404).send('Not Found'); }
    TournamentReferees.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}