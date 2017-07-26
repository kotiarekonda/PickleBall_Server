'use strict';

var _ = require('lodash');
var Scoreboard = require('./ScoreBoard.model');
var Sheduledmatches = require('../../api/SheduledMatches/SheduledMatches.model');
// Get list of scoreboards
exports.index = function(req, res) {
  Scoreboard.find(function (err, scoreboards) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(scoreboards);
  });
};

// Get a single scoreboard
exports.show = function(req, res) {
  Scoreboard.findById(req.params.id, function (err, scoreboard) {
    if(err) { return handleError(res, err); }
    if(!scoreboard) { return res.status(404).send('Not Found'); }
    return res.json(scoreboard);
  });
};

// Creates a new scoreboard in the DB.
exports.create = function(req, res) {
  Scoreboard.create(req.body, function(err, scoreboard) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(scoreboard);
  });
};

// Updates an existing scoreboard in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Scoreboard.find({MatchId: req.params.id}, function(err, scoreobj){
    if(err){ return handleError(res, err); }
    if(scoreobj.length > 0){
      //update game status
      Sheduledmatches.update({_id: data.MatchId},{$set:{GameStatus: req.body.GameStatus}}).exec();
      var updated = _.merge(scoreobj[0], req.body);
      updated.markModified('ScoreBoard');
      updated.markModified('TeamsWithServeDetails');
      updated.save(function (err, data) {
        if (err) { return handleError(res, err); }
        Sheduledmatches.find({_id: data.MatchId})
          .populate({path:'CourtId', select:"_id CourtName CourtNumber"})
          .populate({path:'EventId', select:'EventId _id'})
          .populate({path:'FormatId', select:'FormatId _id`'})
          .populate({path:'TeamA_Player1_Id', select:'FirstName LastName _id'})
          .populate({path:'TeamA_Player2_Id', select:'FirstName LastName _id'})
          .populate({path:'TeamB_Player1_Id', select:'FirstName LastName _id'})
          .populate({path:'TeamB_Player2_Id', select:'FirstName LastName _id'})
          .populate({path:'RefereeId', select:'FirstName LastName _id'})
          .lean()
          .exec(function(err, matchobj){
            if(err){ return handleError(res, err); }
            if(matchobj.length > 0){
              if(matchobj[0].GameStatus == 2){
                res.status(200).json("sorry this match has been completed");
              }else{
                Sheduledmatches.populate(matchobj, {
                  path: 'EventId.EventId',
                  model: 'MasterEvents',
                  select: 'EventName EventType _id'
                }, function(err, matchevents) {
                  if(err) return callback(err);
                  Sheduledmatches.populate(matchevents, {
                    path: "FormatId.FormatId",
                    model: 'MasterFormats',
                    select: 'FormatName _id ScoreFormat'
                  }, function(err, matchdetails){
                    if(err){ return handleError(res, err); }
                      var temp = {};
                        temp._id = matchdetails[0]._id;
                        temp.Time = matchdetails[0].Time;
                        temp.courtId = matchdetails[0].CourtId['_id'];
                        temp.court = matchdetails[0].CourtId['CourtName'];
                        temp.courtNumber = matchdetails[0].CourtId['CourtNumber'];
                        temp.EventId= matchdetails[0].EventId['_id'];
                        temp.EventName = matchdetails[0].EventId.EventId['EventName'];
                        temp.Event = matchdetails[0].EventId.EventId['EventType'];
                        temp.GameFormat = matchdetails[0].FormatId.FormatId['FormatName'];
                        temp.GameFormatId = matchdetails[0].FormatId['_id'];
                        temp.ScoreBoard = matchdetails[0].FormatId.FormatId['ScoreFormat'];
                        temp.Referee = matchdetails[0].RefereeId['FirstName']+""+matchdetails[0].RefereeId['LastName'];
                        temp.RefereeId = matchdetails[0].RefereeId['_id'];
                        temp.GameStatus = matchdetails[0].GameStatus;
                        temp.ScoreBoard = data.ScoreBoard;
                        temp.TeamsWithServeDetails = data.TeamsWithServeDetails;
                        var t1 = [];
                        var t2 = [];
                        var taobj1 = {};
                        taobj1.Name = matchdetails[0].TeamA_Player1_Id['FirstName']+""+matchdetails[0].TeamA_Player1_Id['LastName'];
                        taobj1.id = matchdetails[0].TeamA_Player1_Id['_id'];
                        taobj1.Served = false;
                        var tbobj1 = {};
                        tbobj1.Name = matchdetails[0].TeamB_Player1_Id['FirstName']+""+matchdetails[0].TeamB_Player1_Id['LastName'];
                        tbobj1.id = matchdetails[0].TeamB_Player1_Id['_id'];
                        tbobj1.Served = false;
                        t1.push(taobj1);
                        t2.push(tbobj1);
                        var taobj2 = {};
                        var tbobj2 = {};
                        if(matchdetails[0].TeamA_Player2_Id !== undefined){
                          taobj2.Name = matchdetails[0].TeamA_Player2_Id['FirstName']+""+matchdetails[0].TeamA_Player2_Id['LastName'];
                          taobj2.id = matchdetails[0].TeamA_Player2_Id['_id'];
                          taobj2.Served = false;
                          t1.push(taobj2);
                        }
                        if(matchdetails[0].TeamB_Player2_Id !== undefined){
                          tbobj2.Name = matchdetails[0].TeamB_Player2_Id['FirstName']+""+matchdetails[0].TeamB_Player2_Id['LastName'];
                          tbobj2.id = matchdetails[0].TeamB_Player2_Id['_id'];
                          tbobj2.Served = false;
                          t2.push(tbobj2);
                        }          
                        temp.Team1 = {};
                        temp.Team1.Players = t1;
                        temp.Team2 = {};
                        temp.Team2.Players = t2;
                      res.status(200).send({"Matchs": temp});                    
                  })
                })
              }
            }else{
              res.status(200).send('no matches found');
            }
          })
      });
    }else{
      res.status(200).json("scoreboard not found");
    }
  })
};

// Deletes a scoreboard from the DB.
exports.destroy = function(req, res) {
  Scoreboard.findById(req.params.id, function (err, scoreboard) {
    if(err) { return handleError(res, err); }
    if(!scoreboard) { return res.status(404).send('Not Found'); }
    scoreboard.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}