'use strict';
var _ = require('lodash');
var Sheduledmatches = require('./SheduledMatches.model');
//var Events = require('../TournamentEvents/TournamentEvents.model');
var Courts = require('../Courts/Courts.model');
//var Formates = require('../TournamentFormats/TournamentFormats.model');
//var Scoreboard = require('../ScoreBoard/ScoreBoard.model');
var User = require('../Users/Users.model');
var EventPlayerList = require('../EventPlayerList/EventPlayerList.model');
var auth = require('../../auth/auth.service');
var TournamentReferees = require('../../api/TournamentReferees/TournamentReferees.model');
var ScoreBoard = require('../../api/ScoreBoard/ScoreBoard.model');

// Get list of sheduledmatchess
exports.index = function(req, res) {
  Sheduledmatches.find()
  .populate({path:'CourtId', select:"_id CourtName CourtNo"})
  .populate({path:'EventId'})
  .populate({path:'FormatId'})
  .populate({path:'TeamA_Player1_Id', select:'FirstName LastName _id'})
  .populate({path:'TeamA_Player2_Id', select:'FirstName LastName _id'})
  .populate({path:'TeamB_Player1_Id', select:'FirstName LastName _id'})
  .populate({path:'TeamB_Player2_Id', select:'FirstName LastName _id'})
  .populate({path:'RefereeId', select:'FirstName LastName _id'})
  .lean()
  .exec(function (err, sheduledmatchess) {
    if(err) { return handleError(res, err); }
    if(sheduledmatchess.length > 0){
      Sheduledmatches.populate(sheduledmatchess, {
          path: 'EventId.EventId',
          model: 'MasterEvents'
        }, function(err, cars) {
          if(err) return callback(err);
          Sheduledmatches.populate(cars, {
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
              temp.MatchStatus = element.MatchStatus;
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
            return res.status(200).json(arr);
          })          
        });
    }else{
      res.status(200).json("no matches found");
    }
  });
};

// Get a single sheduledmatches
exports.show = function(req, res) {
  Sheduledmatches.findById(req.params.id, function (err, sheduledmatches) {
    if(err) { return handleError(res, err); }
    if(!sheduledmatches) { return res.status(404).send('Not Found'); }
    return res.json(sheduledmatches);
  });
};

// Creates a new sheduledmatches in the DB.
exports.create = function(req, res) {  
  req.body.RefereeName = req.body.RefereeName.split(" ").join('');
  //rand key for referee name
  req.body.RefereePassword = req.body.RefereeName.split(' ').join('')+req.body.CourtNo;
  Sheduledmatches.create(req.body, function(err, sheduledmatches) {
    if(err) { return handleError(res, err); }
    //creating scoreboard
    var obj = {};
    obj.MatchId = sheduledmatches._id;
    var score = new ScoreBoard(obj);
    score.save();
    //court update
    Courts.update({_id: sheduledmatches.CourtId, Selected: false},{$set:{Selected: true}}).exec();
    //updating eventplayers
    EventPlayerList.update({_id: {$in: req.body.TeamIds}, Selected: false},{$set:{Selected: true}},{"multi": true}).exec();
    //tournament referee update
    TournamentReferees.update({RefereeId: sheduledmatches.RefereeId, Selected: false},{$set:{Selected: true}}).exec();
    //tournament referee update
    TournamentReferees.update({RefereeId: req.body.RefereeId, Selected: false},{$set:{Selected: true}}).exec();
    Sheduledmatches.find({_id: sheduledmatches._id})
    .populate({path:'CourtId', select:"_id CourtName CourtNumber"})
    .populate({path:'EventId', select:'EventId _id'})
    .populate({path:'FormatId', select:'FormatId _id'})
    .populate({path:'TeamA_Player1_Id', select:'FirstName LastName _id'})
    .populate({path:'TeamA_Player2_Id', select:'FirstName LastName _id'})
    .populate({path:'TeamB_Player1_Id', select:'FirstName LastName _id'})
    .populate({path:'TeamB_Player2_Id', select:'FirstName LastName _id'})
    .populate({path:'RefereeId', select:'FirstName LastName _id'})
    .lean()
    .exec(function(err, sheduledobj){
      if(err){ return handleError(res, err); }
      if(sheduledobj.length > 0){
          Sheduledmatches.populate(sheduledobj, {
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
                temp.Referee = matchdetails[0].RefereeId['FirstName']+""+matchdetails[0].RefereeId['LastName'];
                temp.RefereeId = matchdetails[0].RefereeId['_id'];
                temp.GameStatus = matchdetails[0].GameStatus;
                var t1 = [];
                var t2 = [];
                var taobj1 = {};
                taobj1.Name = matchdetails[0].TeamA_Player1_Id['FirstName']+""+matchdetails[0].TeamA_Player1_Id['LastName'];
                taobj1.id = matchdetails[0].TeamA_Player1_Id['_id'];
                var tbobj1 = {};
                tbobj1.Name = matchdetails[0].TeamB_Player1_Id['FirstName']+""+matchdetails[0].TeamB_Player1_Id['LastName'];
                tbobj1.id = matchdetails[0].TeamB_Player1_Id['_id'];
                t1.push(taobj1);
                t2.push(tbobj1);
                var taobj2 = {};
                var tbobj2 = {};
                if(matchdetails[0].TeamA_Player2_Id !== undefined){
                  taobj2.Name = matchdetails[0].TeamA_Player2_Id['FirstName']+""+matchdetails[0].TeamA_Player2_Id['LastName'];
                  taobj2.id = matchdetails[0].TeamA_Player2_Id['_id'];
                  t1.push(taobj2);
                }
                if(matchdetails[0].TeamB_Player2_Id !== undefined){
                  tbobj2.Name = matchdetails[0].TeamB_Player2_Id['FirstName']+""+matchdetails[0].TeamB_Player2_Id['LastName'];
                  tbobj2.id = matchdetails[0].TeamB_Player2_Id['_id'];
                  t2.push(tbobj2);
                }          
                temp.Team1 = {};
                temp.Team1.Players = t1;
                temp.Team2 = {};
                temp.Team2.Players = t2;
              res.status(200).json(temp);
            })          
          });
      }else{
        res.status(200).json("no match's are scheduled at !");
      }
      })
  });
};


// Updates an existing sheduledmatches in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Sheduledmatches.findById(req.params.id, function (err, sheduledmatches) {
    if (err) { return handleError(res, err); }
    if(!sheduledmatches) { return res.status(404).send('Not Found'); }
    var updated = _.merge(sheduledmatches, req.body);
    updated.markModified('ScoreCard');
    updated.markModified('FirstServe');
    updated.save(function (err, data) {
      if (err) { return handleError(res, err); }
      Sheduledmatches.find({_id: req.params.id, Status: true})
      .populate({path:'CourtId', select:"_id CourtName CourtNo"})
      .populate({path:'EventId', select:'EventName EventType'})
      .populate({path:'FormatId', select:'FormateName ScoreCard twopointse'})
      .populate({path:'TeamAPlayer1Id', select:'Served FirstName _id'})
      .populate({path:'TeamAPlayer2Id', select:'Served FirstName _id'})
      .populate({path:'TeamBPlayer1Id', select:'Served FirstName _id'})
      .populate({path:'TeamBPlayer2Id', select:'Served FirstName _id'})
      .populate({path:'RefereeId', select:'FirstName _id'})
      .lean()
      .exec(function(err, matchobj){
        if(err){ return handleError(res, err); }
        if(matchobj.length > 0){
          var temp = {};
          temp._id = matchobj[0]._id;
          temp.Time = matchobj[0].Time;
          temp.courtId = matchobj[0].CourtId['_id'];
          temp.court = matchobj[0].CourtId['CourtName'];
          temp.courtNumber = matchobj[0].CourtId['CourtNo'];
          temp.EventId= matchobj[0].EventId['_id'];
          temp.EventName = matchobj[0].EventId['EventName'];
          temp.Event = matchobj[0].EventId.EventId['EventType'];
          temp.GameFormat = matchobj[0].FormatId['FormateName'];
          temp.GameFormatId = matchobj[0].FormatId['_id'];
          temp.twopointse = matchobj[0].FormatId['twopointse'];
          temp.Referee = matchobj[0].RefereeId['FirstName'];
          temp.RefereeId = matchobj[0].RefereeId['_id'];
          temp.MatchStatus = matchobj[0].MatchStatus;
          temp.GameStatus = matchobj[0].GameStatus;
          if(matchobj[0].FirstServe !== undefined){
            temp.FirstServe = matchobj[0].FirstServe;
            temp.ScoreCard = matchobj[0].ScoreCard;
          }else{
            temp.ScoreCard = matchobj[0].FormatId['ScoreCard'];
          }
          var t1 = [];
          var t2 = [];
          var taobj1 = {};
          taobj1.Name = matchobj[0].TeamAPlayer1Id['FirstName'];
          taobj1.id = matchobj[0].TeamAPlayer1Id['_id'];
          taobj1.Served = matchobj[0].TeamAPlayer1Id['Served'];
          var tbobj1 = {};
          tbobj1.Name = matchobj[0].TeamBPlayer1Id['FirstName'];
          tbobj1.id = matchobj[0].TeamBPlayer1Id['_id'];
          tbobj1.Served = matchobj[0].TeamBPlayer1Id['Served'];
          t1.push(taobj1);
          t2.push(tbobj1);
          var taobj2 = {};
          var tbobj2 = {};
          if(matchobj[0].TeamAPlayer2Id !== undefined){
            taobj2.Name = matchobj[0].TeamAPlayer2Id['FirstName'];
            taobj2.id = matchobj[0].TeamAPlayer2Id['_id'];
            taobj2.Served = matchobj[0].TeamAPlayer2Id['Served'];
            t1.push(taobj2);
          }
          if(matchobj[0].TeamBPlayer2Id !== undefined){
            tbobj2.Name = matchobj[0].TeamBPlayer2Id['FirstName'];
            tbobj2.id = matchobj[0].TeamBPlayer2Id['_id'];
            tbobj2.Served = matchobj[0].TeamBPlayer1Id['Served'];
            t2.push(tbobj2);
          }          
          temp.Team1 = {};
          temp.Team1.Players = t1;
          temp.Team2 = {};
          temp.Team2.Players = t2;
          res.status(200).send({"Matchs": temp});
        }else{
          res.status(200).send('no matches found');
        }
      })
    });
  });
};

// Deletes a sheduledmatches from the DB.
exports.destroy = function(req, res) {
  Sheduledmatches.findById(req.params.id, function (err, sheduledmatches) {
    if(err) { return handleError(res, err); }
    if(!sheduledmatches) { return res.status(404).send('Not Found'); }
    sheduledmatches.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

//shedule match service
exports.matchsheduledfields = function(req, res){
  Courts.find({Selected: false})
  .lean()
  .exec(function(err, courtsobj){
    if(err){ return handleError(res, err); }
    if(courtsobj.length > 0){
      Formates.find({},{ScoreCard: 0, Status: 0, __v: 0},function(err, formatesobj){
        if(err){ return handleError(res, err); }
        if(formatesobj.length > 0){
          Events.find().lean().exec(function(err, eventsobj){
            if(err){ return handleError(res, err); }
            User.find({role:'Referee', Selected: false}, {_id: 1, FirstName: 1, Selected: 1}, function(err, refereeobj){
              if(err){ return handleError(res, err); }
              var arr = [];
              refereeobj.forEach(function(element, index){
                var refobj = {};
                refobj.RefereeId = element._id;
                refobj.RefereeName = element.FirstName;
                refobj.Selected = element.Selected;
                arr.push(refobj);
              })
              Sheduledmatches.find({TournamentId: req.user._id, Status: true})
              .populate({path:'CourtId', select:"_id CourtName CourtNo"})
              .populate({path:'EventId', select:'EventName EventType'})
              .populate({path:'FormatId', select:'FormateName twopointse'})
              .populate({path:'TeamAPlayer1Id', select:'FirstName _id'})
              .populate({path:'TeamAPlayer2Id', select:'FirstName _id'})
              .populate({path:'TeamBPlayer1Id', select:'FirstName _id'})
              .populate({path:'TeamBPlayer2Id', select:'FirstName _id'})
              .populate({path:'RefereeId', select:'FirstName _id'})
              .lean()
              .exec(function(err, sheduledmatchobj){
                if(err){ return handleError(res, err); }
                if(sheduledmatchobj.length > 0){
                  var matchsarr = [];
                  sheduledmatchobj.forEach(function(element, index){
                    var temp = {};
                    temp._id = element._id;
                    temp.Time = element.Time;
                    temp.courtId = element.CourtId['_id'];
                    temp.court = element.CourtId['CourtName'];
                    temp.courtNumber = element.CourtId['CourtNo'];
                    temp.EventId= element.EventId['_id'];
                    temp.EventName = element.EventId['EventName'];
                    temp.Event = element.EventId['EventType'];
                    temp.GameFormat = element.FormatId['FormateName'];
                    temp.GameFormatId = element.FormatId['_id'];
                    temp.twopointse = element.FormatId['twopointse'];
                    temp.Referee = element.RefereeId['FirstName'];
                    temp.RefereeId = element.RefereeId['_id'];
                    temp.MatchStatus = element.MatchStatus;
                    var t1 = [];
                    var t2 = [];
                    var taobj1 = {};
                    taobj1.Name = element.TeamAPlayer1Id['FirstName'];
                    taobj1.id = element.TeamAPlayer1Id['_id'];
                    var tbobj1 = {};
                    tbobj1.Name = element.TeamBPlayer1Id['FirstName'];
                    tbobj1.id = element.TeamBPlayer1Id['_id'];
                    t1.push(taobj1);
                    t2.push(tbobj1);
                    var taobj2 = {};
                    var tbobj2 = {};
                    if(element.TeamAPlayer2Id !== undefined){
                      taobj2.Name = element.TeamAPlayer2Id['FirstName'];
                      taobj2.id = element.TeamAPlayer2Id['_id'];
                      t1.push(taobj2);
                    }
                    if(element.TeamBPlayer2Id !== undefined){
                      tbobj2.Name = element.TeamBPlayer2Id['FirstName'];
                      tbobj2.id = element.TeamBPlayer2Id['_id'];
                      t2.push(tbobj2);
                    }          
                    temp.Team1 = {};
                    temp.Team1.Players = t1;
                    temp.Team2 = {};
                    temp.Team2.Players = t2;
                    matchsarr.push(temp);
                  })
                  var tempobj = {};
                  tempobj.Courts = courtsobj;
                  tempobj.Events = eventsobj;
                  tempobj.Formates = formatesobj;
                  tempobj.Referes = arr;
                  tempobj.Matchs = matchsarr;
                  res.status(200).send(tempobj);
                }else{
                  var obj = {};
                  obj.Courts = courtsobj;
                  obj.Events = eventsobj;
                  obj.Formates = formatesobj;
                  obj.Referes = arr;
                  obj.Matchs = [];
                  res.status(200).send(obj);
                }
              })
            })
          })
        }else{
          res.status(200).send("formates not found");
        }
      })
    }else{
      res.status(200).send("court not found");
    }
  })
}

//refree login
exports.refereelogin = function(req, res){
  Sheduledmatches.find({"RefereeName":req.body.RefereeName,"RefereePassword":req.body.RefereePassword})
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
            //scoreboard update details
            ScoreBoard.find({MatchId: matchdetails[0]._id}, function(err, scoreboard){
              if(err){ return handleError(res, err);}
              var temp = {};
                temp._id = matchdetails[0]._id;
                temp.Time = matchdetails[0].Time;
                temp.courtId = matchdetails[0].CourtId['_id'];
                temp.court = matchdetails[0].CourtId['CourtName'];
                temp.courtNumber = matchdetails[0].CourtId['CourtNumber'];
                temp.EventId= matchdetails[0].EventId['_id'];
                temp.EventName = matchdetails[0].EventId['EventId']['EventName'];
                temp.Event = matchdetails[0].EventId['EventId']['EventType'];
                temp.GameFormat = matchdetails[0].FormatId.FormatId['FormatName'];
                temp.GameFormatId = matchdetails[0].FormatId['_id'];
                temp.ScoreBoard = matchdetails[0].FormatId.FormatId['ScoreFormat'];
                temp.Referee = matchdetails[0].RefereeId['FirstName']+""+matchdetails[0].RefereeId['LastName'];
                temp.RefereeId = matchdetails[0].RefereeId['_id'];
                temp.GameStatus = matchdetails[0].GameStatus;
                if(scoreboard[0].ScoreBoard !== undefined && scoreboard[0].TeamsWithServeDetails !== undefined){
                  temp.ScoreBoard = scoreboard[0].ScoreBoard;
                  temp.TeamsWithServeDetails = scoreboard[0].TeamsWithServeDetails;
                }
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
              var token = auth.signToken(matchobj[0].RefereeId, "Referee");
              res.status(200).send({"Matchs": temp, "Token": token, role: "Referee"});
            })
          })
        })
      }
    }else{
      res.status(200).send('no matches found');
    }
  })
}

//spectator showing matches
exports.spectatormatchs = function(req, res){
  Sheduledmatches.find({TournamentId: req.params.TournamentId})
  .populate({path:'CourtId', select:"_id CourtName CourtNumber"})
  .populate({path:'EventId', select:'EventId _id'})
  .populate({path:'FormatId', select:'FormatId _id'})
  .populate({path:'TeamA_Player1_Id', select:'FirstName LastName _id'})
  .populate({path:'TeamA_Player2_Id', select:'FirstName LastName _id'})
  .populate({path:'TeamB_Player1_Id', select:'FirstName LastName _id'})
  .populate({path:'TeamB_Player2_Id', select:'FirstName LastName _id'})
  .populate({path:'RefereeId', select:'FirstName LastName _id'})
  .lean()
  .exec(function(err, matchobj){
    if(err){ return handleError(res, err); }
    if(matchobj.length > 0){
      return matchobj;
    }else{
      return [];
    }
  })
  .then(function(result){
    var mids = [];
    result.forEach(function(element, index){
      mids.push(element._id);
    })
    Sheduledmatches.populate(result, {
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
        //score details
        ScoreBoard.find({MatchId: {$in: mids}})
        .lean()
        .exec(function(err, scoreboardobj){
          if(err){ return handleError(res, err);}
          var arr = [];
          matchdetails.forEach(function(matcheelement, matchindex){
              var temp = {};
              temp._id = matcheelement._id;
              temp.Time = matcheelement.Time;
              temp.courtId = matcheelement.CourtId['_id'];
              temp.court = matcheelement.CourtId['CourtName'];
              temp.courtNumber = matcheelement.CourtId['CourtNumber'];
              temp.EventId= matcheelement.EventId['_id'];
              temp.EventName = matcheelement.EventId.EventId['EventName'];
              temp.Event = matcheelement.EventId.EventId['EventType'];
              temp.GameFormat = matcheelement.FormatId.FormatId['FormatName'];
              temp.GameFormatId = matcheelement.FormatId['_id'];
              temp.Referee = matcheelement.RefereeId['FirstName']+""+matcheelement.RefereeId['LastName'];
              temp.RefereeId = matcheelement.RefereeId['_id'];
              temp.GameStatus = matcheelement.GameStatus;
              var t1 = [];
              var t2 = [];
              var taobj1 = {};
              taobj1.Name = matcheelement.TeamA_Player1_Id['FirstName']+""+matcheelement.TeamA_Player1_Id['LastName'];
              taobj1.id = matcheelement.TeamA_Player1_Id['_id'];
              var tbobj1 = {};
              tbobj1.Name = matcheelement.TeamB_Player1_Id['FirstName']+""+matcheelement.TeamB_Player1_Id['LastName'];
              tbobj1.id = matcheelement.TeamB_Player1_Id['_id'];
              t1.push(taobj1);
              t2.push(tbobj1);
              var taobj2 = {};
              var tbobj2 = {};
              if(matcheelement.TeamA_Player2_Id !== undefined){
                taobj2.Name = matcheelement.TeamA_Player2_Id['FirstName']+""+matcheelement.TeamA_Player2_Id['LastName'];
                taobj2.id = matcheelement.TeamA_Player2_Id['_id'];
                t1.push(taobj2);
              }
              if(matcheelement.TeamB_Player2_Id !== undefined){
                tbobj2.Name = matcheelement.TeamB_Player2_Id['FirstName']+""+matcheelement.TeamB_Player2_Id['LastName'];
                tbobj2.id = matcheelement.TeamB_Player2_Id['_id'];
                t2.push(tbobj2);
              }          
              temp.Team1 = {};
              temp.Team1.Players = t1;
              temp.Team2 = {};
              temp.Team2.Players = t2;
            scoreboardobj.forEach(function(scoreelement, scoreindex){
              if(matcheelement._id.toString() === scoreelement.MatchId.toString()){
                if(scoreelement.ScoreBoard !== undefined && scoreelement.TeamsWithServeDetails !== undefined){
                  temp.TeamAPoints = scoreelement.TeamsWithServeDetails.Team1.TeamAPoints;
                  temp.TeamBPoints = scoreelement.TeamsWithServeDetails.Team2.TeamBPoints;
                  temp.Team1Active = scoreelement.TeamsWithServeDetails.Team1Active;
                  temp.Team2Active = scoreelement.TeamsWithServeDetails.Team2Active;
                }              
              }
            })
            arr.push(temp);
          })
          res.status(200).send({"Matchs": arr});
        }) 
      })
    }) 
  })
}

//reloading match service
exports.reloadrefereelogin = function(req, res){
  Sheduledmatches.find({RefereeId: req.user._id})
  .populate({path:'CourtId', select:"_id CourtName CourtNumber"})
  .populate({path:'EventId', select:'EventId _id'})
  .populate({path:'FormatId', select:'FormatId _id'})
  .populate({path:'TeamAPlayer1Id', select:'Served FirstName _id'})
  .populate({path:'TeamAPlayer2Id', select:'Served FirstName _id'})
  .populate({path:'TeamBPlayer1Id', select:'Served FirstName _id'})
  .populate({path:'TeamBPlayer2Id', select:'Served FirstName _id'})
  .populate({path:'RefereeId', select:'FirstName LastName _id'})
  .lean()
  .exec(function(err, matchobj){
    if(err){ return handleError(res, err); }
    if(matchobj.length > 0){
      Sheduledmatches.populate(matchobj, {
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
          //scoreboard details
          ScoreBoard.find({MatchId: matchdetails[0]._id}, function(err, scoreboard){
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
              temp.Referee = matchdetails[0].RefereeId['FirstName']+""+matchdetails[0].RefereeId['LastName'];
              temp.RefereeId = matchdetails[0].RefereeId['_id'];
              temp.GameStatus = matchdetails[0].GameStatus;
              if(scoreboard[0].ScoreBoard !== undefined && scoreboard[0].TeamsWithServeDetails !== undefined){
                temp.ScoreBoard = scoreboard[0].ScoreBoard;
                temp.TeamsWithServeDetails = scoreboard[0].TeamsWithServeDetails;
              }
              var t1 = [];
              var t2 = [];
              var taobj1 = {};
              taobj1.Name = matchdetails[0].TeamA_Player1_Id['FirstName']+""+matchdetails[0].TeamA_Player1_Id['LastName'];
              taobj1.id = matchdetails[0].TeamA_Player1_Id['_id'];
              var tbobj1 = {};
              tbobj1.Name = matchdetails[0].TeamB_Player1_Id['FirstName']+""+matchdetails[0].TeamB_Player1_Id['LastName'];
              tbobj1.id = matchdetails[0].TeamB_Player1_Id['_id'];
              t1.push(taobj1);
              t2.push(tbobj1);
              var taobj2 = {};
              var tbobj2 = {};
              if(matchdetails[0].TeamA_Player2_Id !== undefined){
                taobj2.Name = matchdetails[0].TeamA_Player2_Id['FirstName']+""+matchdetails[0].TeamA_Player2_Id['LastName'];
                taobj2.id = matchdetails[0].TeamA_Player2_Id['_id'];
                t1.push(taobj2);
              }
              if(matchdetails[0].TeamB_Player2_Id !== undefined){
                tbobj2.Name = matchdetails[0].TeamB_Player2_Id['FirstName']+""+matchdetails[0].TeamB_Player2_Id['LastName'];
                tbobj2.id = matchdetails[0].TeamB_Player2_Id['_id'];
                t2.push(tbobj2);
              }          
              temp.Team1 = {};
              temp.Team1.Players = t1;
              temp.Team2 = {};
              temp.Team2.Players = t2;            
              res.status(200).json({Matchs: temp});
          })
        })
      })  
    }else{
      res.status(200).send('no matches found');
    }
  })
}

//delete match service
exports.deletematch = function(req, res){
  Sheduledmatches.findOne({_id: req.params.MatchId})
  .populate({path:"TeamA_Player1_Id", select:"_id"})
  .populate({path:"TeamB_Player1_Id", select:"_id"})
  .exec(function(err, matchdetails){
    if(err){ return handleError(res, err); }
    if(matchdetails){
      //delete score board
      ScoreBoard.remove({MatchId: req.params.MatchId}).exec()
      Courts.update({_id: matchdetails.CourtId, Selected: true},{$set:{Selected: false}}).exec();
      EventPlayerList.update({Player1Id: matchdetails.TeamA_Player1_Id._id, Selected: true},{$set:{Selected: false}}).exec();
      EventPlayerList.update({Player1Id: matchdetails.TeamB_Player1_Id._id, Selected: true},{$set:{Selected: false}}).exec();
      TournamentReferees.update({RefereeId: matchdetails.RefereeId, Selected: true},{$set:{Selected: false}}).exec();
      Sheduledmatches.remove({_id:req.params.MatchId}).exec();
      res.status(200).json("deleted successfully");
    }else{
      res.status(400).json("invalid match id");
    }
  })
} 

//director and specatator livescore
exports.livescore = function(req, res){
  Sheduledmatches.find({_id: req.params.MatchId})
  .populate({path:'CourtId', select:"_id CourtName CourtNumber"})
  .populate({path:'EventId', select:'EventId _id'})
  .populate({path:'FormatId', select:'FormatId _id'})
  .populate({path:'TeamAPlayer1Id', select:'Served FirstName _id'})
  .populate({path:'TeamAPlayer2Id', select:'Served FirstName _id'})
  .populate({path:'TeamBPlayer1Id', select:'Served FirstName _id'})
  .populate({path:'TeamBPlayer2Id', select:'Served FirstName _id'})
  .populate({path:'RefereeId', select:'FirstName LastName _id'})
  .lean()
  .exec(function(err, matchobj){
    if(err){ return handleError(res, err); }
    if(matchobj.length > 0){
      Sheduledmatches.populate(matchobj, {
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
          //scoreboard details
          ScoreBoard.find({MatchId: matchdetails[0]._id}, function(err, scoreboard){
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
              temp.Referee = matchdetails[0].RefereeId['FirstName']+""+matchdetails[0].RefereeId['LastName'];
              temp.RefereeId = matchdetails[0].RefereeId['_id'];
              temp.GameStatus = matchdetails[0].GameStatus;
              if(scoreboard[0].ScoreBoard !== undefined && scoreboard[0].TeamsWithServeDetails !== undefined){
                temp.ScoreBoard = scoreboard[0].ScoreBoard;
                temp.TeamsWithServeDetails = scoreboard[0].TeamsWithServeDetails;
              }
              var t1 = [];
              var t2 = [];
              var taobj1 = {};
              taobj1.Name = matchdetails[0].TeamA_Player1_Id['FirstName']+""+matchdetails[0].TeamA_Player1_Id['LastName'];
              taobj1.id = matchdetails[0].TeamA_Player1_Id['_id'];
              var tbobj1 = {};
              tbobj1.Name = matchdetails[0].TeamB_Player1_Id['FirstName']+""+matchdetails[0].TeamB_Player1_Id['LastName'];
              tbobj1.id = matchdetails[0].TeamB_Player1_Id['_id'];
              t1.push(taobj1);
              t2.push(tbobj1);
              var taobj2 = {};
              var tbobj2 = {};
              if(matchdetails[0].TeamA_Player2_Id !== undefined){
                taobj2.Name = matchdetails[0].TeamA_Player2_Id['FirstName']+""+matchdetails[0].TeamA_Player2_Id['LastName'];
                taobj2.id = matchdetails[0].TeamA_Player2_Id['_id'];
                t1.push(taobj2);
              }
              if(matchdetails[0].TeamB_Player2_Id !== undefined){
                tbobj2.Name = matchdetails[0].TeamB_Player2_Id['FirstName']+""+matchdetails[0].TeamB_Player2_Id['LastName'];
                tbobj2.id = matchdetails[0].TeamB_Player2_Id['_id'];
                t2.push(tbobj2);
              }          
              temp.Team1 = {};
              temp.Team1.Players = t1;
              temp.Team2 = {};
              temp.Team2.Players = t2;            
              res.status(200).json({Matchs: temp});
          })
        })
      })  
    }else{
      res.status(200).send('no matches found');
    }
  })
}