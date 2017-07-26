'use strict';

var _ = require('lodash');
var MasterFormats = require('./MasterFormats.model');

// Get list of MasterFormatss
exports.index = function(req, res) {
  MasterFormats.find(function (err, MasterFormatss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(MasterFormatss);
  });
};

// Get a single MasterFormats
exports.show = function(req, res) {
  MasterFormats.findById(req.params.id, function (err, MasterFormats) {
    if(err) { return handleError(res, err); }
    if(!MasterFormats) { return res.status(404).send('Not Found'); }
    return res.json(MasterFormats);
  });
};

// Creates a new MasterFormats in the DB.
exports.create = function(req, res) {
  MasterFormats.create(req.body, function(err, MasterFormats) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(MasterFormats);
  });
};

// Updates an existing MasterFormats in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  MasterFormats.findById(req.params.id, function (err, MasterFormats) {
    if (err) { return handleError(res, err); }
    if(!MasterFormats) { return res.status(404).send('Not Found'); }
    var updated = _.merge(MasterFormats, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(MasterFormats);
    });
  });
};

// Deletes a MasterFormats from the DB.
exports.destroy = function(req, res) {
  MasterFormats.findById(req.params.id, function (err, MasterFormats) {
    if(err) { return handleError(res, err); }
    if(!MasterFormats) { return res.status(404).send('Not Found'); }
    MasterFormats.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}