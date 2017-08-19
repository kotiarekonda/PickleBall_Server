'use strict';

var _ = require('lodash');
var TournamentDetails = require('./TournamentDetails.model');
var Courts = require('../../api/Courts/Courts.model');
var TournamentDetails = require('../../api/TournamentDetails/TournamentDetails.model');
var TournamentEvents = require('../../api/TournamentEvents/TournamentEvents.model');
var TournamentFormates = require('../../api/TournamentFormats/TournamentFormats.model');
var Sheduledmatches = require('../../api/SheduledMatches/SheduledMatches.model');
var ScoreBoard = require('../../api/ScoreBoard/ScoreBoard.model');
var TournamentReferees = require('../../api/TournamentReferees/TournamentReferees.model');
var Users = require('../../api/Users/Users.model');
// Get list of TournamentDetailss
exports.index = function(req, res) {
  TournamentDetails.find({TournamentOwner: req.user._id},{TournamentOwner: 1})
  .lean()
  .exec()
  .then(function(tournamentdetails){
  var id = tournamentdetails[0]._id;
  return [id];      
  })
  .then(function(result){
    return Courts.find({TournamentId: result[0], Selected: false}).lean().exec()
    .then(function(Courts){
      result[1] = Courts;
      return result;
    })
  })
  .then(function(result){
    return TournamentEvents.find({TournamentId: result[0]})
    .populate({path:"EventId", select:"EventName EventType"})
    .lean()     
    .exec()
    .then(function(tournmentevents){
      tournmentevents.forEach(function(element, index){
        element.EventName = element.EventId.EventName;
        element.EventType = element.EventId.EventType;
        element.EventId = element.EventId._id;
      })
      result[2] = tournmentevents;
      return result;
    })
  })
  .then(function(result){
    return TournamentFormates.find({TournamentId: result[0]})
    .populate({path:'FormatId', select:"FormatName"})
    .lean()
    .exec()
    .then(function(tournamentformates){
      tournamentformates.forEach(function(element, index){
        element.FormatName = element.FormatId.FormatName;
        element.FormatId = element.FormatId._id;
      })
      result[3] = tournamentformates;
      return result;
    })
  })
  .then(function(result){
    return Sheduledmatches.find({TournamentId: result[0]})
    .populate({path:"EventId", select:"_id EventId"})
    .populate({path:"FormatId", select:"_id FormatId"})
    .populate({path:"CourtId", select:"CourtName CourtNumber"})
    .populate({path:"TeamA_Player1_Id", select:"FirstName LastName"})
    .populate({path:"TeamA_Player2_Id", select:"FirstName LastName"})
    .populate({path:"TeamB_Player1_Id", select:"FirstName LastName"})
    .populate({path:"TeamB_Player2_Id", select:"FirstName LastName"})
    .populate({path:"RefereeId", select:"FirstName LastName"})
    .lean()
    .exec()
    .then(function(scheduledmatches){
      if(scheduledmatches.length > 0){
        Sheduledmatches.populate(scheduledmatches, {
          path: 'EventId.EventId',
          model: 'MasterEvents',
          select: 'EventName EventType _id'
        }, function(err, matchevents) {
          if(err) return callback(err);
          Sheduledmatches.populate(matchevents, {
            path: "FormatId.FormatId",
            model: 'MasterFormats',
            select: 'FormatName _id'
          }, function(err, matchdetails){
            if(err){ return handleError(res, err); }
            var arr = [];
            matchdetails.forEach(function(element, index){
              var temp = {};
              temp._id = element._id;
              temp.Time = element.Time;
              temp.courtId = element.CourtId['_id'];
              temp.court = element.CourtId['CourtName'];
              temp.courtNumber = element.CourtId['CourtNumber'];
              temp.EventId= element.EventId['_id'];
              temp.EventName = element.EventId.EventId['EventName'];
              temp.Event = element.EventId.EventId['EventType'];
              temp.GameFormat = element.FormatId.FormatId['FormatName'];
              temp.GameFormatId = element.FormatId['_id'];
              temp.Referee = element.RefereeId['FirstName']+""+element.RefereeId['LastName'];
              temp.RefereeId = element.RefereeId['_id'];
              temp.GameStatus = element.GameStatus;
              var t1 = [];
              var t2 = [];
              var taobj1 = {};
              taobj1.Name = element.TeamA_Player1_Id['FirstName']+""+element.TeamA_Player1_Id['LastName'];
              taobj1.id = element.TeamA_Player1_Id['_id'];
              var tbobj1 = {};
              tbobj1.Name = element.TeamB_Player1_Id['FirstName']+""+element.TeamB_Player1_Id['LastName'];
              tbobj1.id = element.TeamB_Player1_Id['_id'];
              t1.push(taobj1);
              t2.push(tbobj1);
              var taobj2 = {};
              var tbobj2 = {};
              if(element.TeamA_Player2_Id !== undefined){
                taobj2.Name = element.TeamA_Player2_Id['FirstName']+""+element.TeamA_Player2_Id['LastName'];
                taobj2.id = element.TeamA_Player2_Id['_id'];
                t1.push(taobj2);
              }
              if(element.TeamB_Player2_Id !== undefined){
                tbobj2.Name = element.TeamB_Player2_Id['FirstName']+""+element.TeamB_Player2_Id['LastName'];
                tbobj2.id = element.TeamB_Player2_Id['_id'];
                t2.push(tbobj2);
              }          
              temp.Team1 = {};
              temp.Team1.Players = t1;
              temp.Team2 = {};
              temp.Team2.Players = t2;
              arr.push(temp);
            })
            result[4] = arr;
          })
        });
        return result;
      }else{
        result[4] = [];
        return result;
      }
    })
  })
  .then(function(result){
    return TournamentReferees.find({TournamentId: result[0], Selected: false})
    .populate({path:"RefereeId", select:'FirstName LastName _id'})
    .lean()
    .then(function(refreeobj){
      var arr = [];
      refreeobj.forEach(function(element, index){
        var temp = {};
        temp.RefereeName = element.RefereeId.FirstName+""+element.RefereeId.LastName;
        temp.RefereeId = element.RefereeId._id;
        arr.push(temp);
      })
      result[5] = arr;
      return result;
    })
  })
  .then(function(result){
    var mids = [];
    var matches = result[4];
    matches.forEach(function(mele, mindex){
      mids.push(mele._id);
    })
    ScoreBoard.find({MatchId:{$in:mids}})
    .lean()
    .exec()
    .then(function(scores){
      if(scores.length > 0){
        matches.forEach(function(matchele, matchindex){
          scores.forEach(function(scorele, scoreindex){
            if(matchele._id.toString() === scorele.MatchId.toString()){
              if(scorele.ScoreBoard !== undefined && scorele.TeamsWithServeDetails !== undefined){
                matchele.TeamAPoints = scorele.TeamsWithServeDetails.Team1.TeamAPoints;
                matchele.TeamBPoints = scorele.TeamsWithServeDetails.Team2.TeamBPoints;
                matchele.Team1Active = scorele.TeamsWithServeDetails.Team1Active;
                matchele.Team2Active = scorele.TeamsWithServeDetails.Team2Active;
              }
            }
          })
        })
        var tempobj = {};
        tempobj.TournamentId = result[0];
        tempobj.Courts = result[1];
        tempobj.Events = result[2];
        tempobj.Formats = result[3];
        tempobj.Matchs = matches;
        tempobj.Referee = result[5];
        res.status(200).json(tempobj);
      }else{
        var tempobj = {};
        tempobj.TournamentId = result[0];
        tempobj.Courts = result[1];
        tempobj.Events = result[2];
        tempobj.Formats = result[3];
        tempobj.Matchs = [];
        tempobj.Referee = result[5];
        res.status(200).json(tempobj);
      }
    })
  })
};

// Get a single TournamentDetails
exports.show = function(req, res) {
  TournamentDetails.findById(req.params.id, function (err, TournamentDetails) {
    if(err) { return handleError(res, err); }
    if(!TournamentDetails) { return res.status(404).send('Not Found'); }
    return res.json(TournamentDetails);
  });
};

// Creates a new TournamentDetails in the DB.
exports.create = function(req, res) {
  TournamentDetails.create(req.body, function(err, TournamentDetails) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(TournamentDetails);
  });
};

// Updates an existing TournamentDetails in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  TournamentDetails.findById(req.params.id, function (err, TournamentDetails) {
    if (err) { return handleError(res, err); }
    if(!TournamentDetails) { return res.status(404).send('Not Found'); }
    var updated = _.merge(TournamentDetails, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(TournamentDetails);
    });
  });
};

// Deletes a TournamentDetails from the DB.
exports.destroy = function(req, res) {
  TournamentDetails.findById(req.params.id, function (err, TournamentDetails) {
    if(err) { return handleError(res, err); }
    if(!TournamentDetails) { return res.status(404).send('Not Found'); }
    TournamentDetails.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

//tournament lists
exports.tournamentlists = function(req, res){
  TournamentDetails.find({},{TournamentName: 1}, function(err, tournamentdetails){
    if(err){ return handleError(res, err); }
    if(tournamentdetails.length > 0){
      res.status(200).json(tournamentdetails);
    }else{
      res.status(200).json("no tournament found");
    }
  })
}

function handleError(res, err) {
  return res.status(500).send(err);
}