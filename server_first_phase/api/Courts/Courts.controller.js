'use strict';

var _ = require('lodash');
var Courts = require('./Courts.model');

// Get list of courtss
exports.index = function(req, res) {
  Courts.find(function (err, courtss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(courtss);
  });
};

// Get a single courts
exports.show = function(req, res) {
  Courts.findById(req.params.id, function (err, courts) {
    if(err) { return handleError(res, err); }
    if(!courts) { return res.status(404).send('Not Found'); }
    return res.json(courts);
  });
};

// Creates a new courts in the DB.
exports.create = function(req, res) {
  Courts.create(req.body, function(err, courts) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(courts);
  });
};

// Updates an existing courts in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Courts.findById(req.params.id, function (err, courts) {
    if (err) { return handleError(res, err); }
    if(!courts) { return res.status(404).send('Not Found'); }
    var updated = _.merge(courts, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(courts);
    });
  });
};

// Deletes a courts from the DB.
exports.destroy = function(req, res) {
  Courts.findById(req.params.id, function (err, courts) {
    if(err) { return handleError(res, err); }
    if(!courts) { return res.status(404).send('Not Found'); }
    courts.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}