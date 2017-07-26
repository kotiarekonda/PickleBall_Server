'use strict';

var _ = require('lodash');
var Formates = require('./TournamentFormats.model');

// Get list of formatess
exports.index = function(req, res) {
  Formates.find(function (err, formatess) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(formatess);
  });
};

// Get a single formates
exports.show = function(req, res) {
  Formates.findById(req.params.id, function (err, formates) {
    if(err) { return handleError(res, err); }
    if(!formates) { return res.status(404).send('Not Found'); }
    return res.json(formates);
  });
};

// Creates a new formates in the DB.
exports.create = function(req, res) {
  Formates.create(req.body, function(err, formates) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(formates);
  });
};

// Updates an existing formates in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Formates.findById(req.params.id, function (err, formates) {
    if (err) { return handleError(res, err); }
    if(!formates) { return res.status(404).send('Not Found'); }
    var updated = _.merge(formates, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(formates);
    });
  });
};

// Deletes a formates from the DB.
exports.destroy = function(req, res) {
  Formates.findById(req.params.id, function (err, formates) {
    if(err) { return handleError(res, err); }
    if(!formates) { return res.status(404).send('Not Found'); }
    formates.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}