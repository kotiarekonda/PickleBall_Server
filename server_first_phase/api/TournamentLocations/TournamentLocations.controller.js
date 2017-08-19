'use strict';

var _ = require('lodash');
var Locations = require('./TournamentLocations.model');

// get geolocation 
//var geolocation = require('geocoder');
var geocoding = new require('reverse-geocoding');
//get location details service
exports.getlocationdetails = function(req, res){
  var config = {  'latitude': req.params.lattitude,
                  'longitude': req.params.longitude
                }
  geocoding.location(config, function(err, data){
    if(err){ return handleError(res, err); }
    res.status(200).send(data.results[0].formatted_address);
  })
}

// Get list of locationss
exports.index = function(req, res) {
  Locations.find(function (err, locationss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(locationss);
  });
};

// Get a single locations
exports.show = function(req, res) {
  Locations.findById(req.params.id, function (err, locations) {
    if(err) { return handleError(res, err); }
    if(!locations) { return res.status(404).send('Not Found'); }
    return res.json(locations);
  });
};

// Creates a new locations in the DB.
exports.create = function(req, res) {
  Locations.create(req.body, function(err, locations) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(locations);
  });
};

// Updates an existing locations in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Locations.findById(req.params.id, function (err, locations) {
    if (err) { return handleError(res, err); }
    if(!locations) { return res.status(404).send('Not Found'); }
    var updated = _.merge(locations, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(locations);
    });
  });
};

// Deletes a locations from the DB.
exports.destroy = function(req, res) {
  Locations.findById(req.params.id, function (err, locations) {
    if(err) { return handleError(res, err); }
    if(!locations) { return res.status(404).send('Not Found'); }
    locations.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}