'use strict';

var _ = require('lodash');
var States = require('./States.model');
var parseXlsx = require('excel');

//adding states 
exports.addingstates = function(req, res){
  parseXlsx('./file/state_country.xlsx', function(err, data) {
    if(err){ return handleError(res, err); }
    if(data.length > 0){
      var arr = [];
      var count = 0;
      data.forEach(function(element, index){
        //adding data function
        addingstates(req, res, element, function(dataobj){
          count++;
            if(dataobj){
              arr.push(dataobj);
            }
            if(count == data.length){
              res.status(200).json(arr);
            }
        })
      })
    }else{
      res.status(200).json("no data found");
    }
  });
}

//adding states callback function
function addingstates(req, res, doc, callback){
  req.body.State = doc[1]+' - '+doc[0];
  req.body.Country = "598adb5fee8e7ca40c18bef9";
  States.create(req.body, function(err, state){
    if(err){ return handleError(res, err); }
    callback(state);
  })
}

// Get list of Statess
exports.index = function(req, res) {
  States.find({},{State: 1}).lean().sort({State: 1}).exec(function (err, Statess) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(Statess);
  });
};

// Get a single States
exports.show = function(req, res) {
  States.findById(req.params.id, function (err, States) {
    if(err) { return handleError(res, err); }
    if(!States) { return res.status(404).send('Not Found'); }
    return res.json(States);
  });
};

// Creates a new States in the DB.
exports.create = function(req, res) {
  States.create(req.body, function(err, States) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(States);
  });
};

// Updates an existing States in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  States.findById(req.params.id, function (err, States) {
    if (err) { return handleError(res, err); }
    if(!States) { return res.status(404).send('Not Found'); }
    var updated = _.merge(States, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(States);
    });
  });
};

// Deletes a States from the DB.
exports.destroy = function(req, res) {
  States.findById(req.params.id, function (err, States) {
    if(err) { return handleError(res, err); }
    if(!States) { return res.status(404).send('Not Found'); }
    States.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}