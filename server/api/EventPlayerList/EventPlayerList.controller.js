'use strict';

var _ = require('lodash');
var EventPlayerList = require('./EventPlayerList.model');

// Get list of EventPlayerLists
exports.index = function(req, res) {
  EventPlayerList.find(function (err, EventPlayerLists) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(EventPlayerLists);
  });
};

// Get a single EventPlayerList
exports.show = function(req, res) {
  EventPlayerList.findById(req.params.id, function (err, EventPlayerList) {
    if(err) { return handleError(res, err); }
    if(!EventPlayerList) { return res.status(404).send('Not Found'); }
    return res.json(EventPlayerList);
  });
};

// Creates a new EventPlayerList in the DB.
exports.create = function(req, res) {
  EventPlayerList.create(req.body, function(err, EventPlayerList) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(EventPlayerList);
  });
};

// Updates an existing EventPlayerList in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  EventPlayerList.findById(req.params.id, function (err, EventPlayerList) {
    if (err) { return handleError(res, err); }
    if(!EventPlayerList) { return res.status(404).send('Not Found'); }
    var updated = _.merge(EventPlayerList, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(EventPlayerList);
    });
  });
};

// Deletes a EventPlayerList from the DB.
exports.destroy = function(req, res) {
  EventPlayerList.findById(req.params.id, function (err, EventPlayerList) {
    if(err) { return handleError(res, err); }
    if(!EventPlayerList) { return res.status(404).send('Not Found'); }
    EventPlayerList.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

//get event based players list 
exports.eventbasedplayers = function(req, res){
  EventPlayerList.find({TournamentId: req.body.TournamentId, EventId: req.body.EventId})
  .populate({path:'Player1Id', select:'FirstName LastName _id'})
  .populate({path:'Player2Id', select:'FirstName LastName _id'})
  .lean()
  .exec(function(err, playeslist){
    if(err){ return handleError(res, err); }
    if(playeslist.length > 0){
      playeslist.forEach(function(element, index){
        element.TeamId = element._id;
        element.Player1Name = element.Player1Id.FirstName+""+element.Player1Id.LastName;
        element.Player1Id = element.Player1Id._id;
        if(element.Player2Id !== undefined){
          element.Player2Name = element.Player2Id.FirstName+""+element.Player2Id.LastName;
          element.Player2Id = element.Player2Id._id;
        }
      })
      res.status(200).send(playeslist);;
    }else{
      res.status(200).send("no player found");
    }
  })
}
