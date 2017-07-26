'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var Courts = require('../../api/Courts/Courts.model');
var TournamentDetails = require('../../api/TournamentDetails/TournamentDetails.model');
var TournamentEvents = require('../../api/TournamentEvents/TournamentEvents.model');
var TournamentFormates = require('../../api/TournamentFormats/TournamentFormats.model');
var Sheduledmatches = require('../../api/SheduledMatches/SheduledMatches.model');
var ScoreBoard = require('../../api/ScoreBoard/ScoreBoard.model');
var TournamentReferees = require('../../api/TournamentReferees/TournamentReferees.model');



var router = express.Router();
router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.status(401).json(error);
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});
    var token = auth.signToken(user._id, user.role);
    res.json({token: token, role: user.role, _id: user._id});
        /*TournamentDetails.find({TournamentOwner: user._id},{TournamentOwner: 1})
        .lean()
        .exec()
        .then(function(tournamentdetails){
            var id = tournamentdetails[0]._id;
            return [id];        
        })
        .then(function(result){
            return Courts.find({TournamentId: result[0]}).lean().exec()
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
            .populate({path:"EventId", select:"EventName EventType"})
            .populate({path:"FormatId", select:"FormatName"})
            .populate({path:"CourtId", select:"CourtName CourtNumber"})
            .populate({path:"TeamA_Player1_Id", select:"FirstName LastName"})
            .populate({path:"TeamA_Player2_Id", select:"FirstName LastName"})
            .populate({path:"TeamB_Player1_Id", select:"FirstName LastName"})
            .populate({path:"TeamB_Player2_Id", select:"FirstName LastName"})
            .lean()
            .exec()
            .then(function(scheduledmatches){
                result[4] = scheduledmatches;
                return result
            })
        })
        .then(function(result){
            return TournamentReferees.find({TournamentId: result[0]})
            .populate({path:"RefereeId", select:"FirstName LastName _id"})
            .lean()
            .then(function(refereeobj){
                refereeobj.forEach(function(element, index){
                    element.RefereeName = element.RefereeId.FirstName+""+element.RefereeId.LastName;
                    element.RefereeId = element.RefereeId._id;
                })
                result[5] = refereeobj;
                return result;
            })
        })
        .then(function(result){
            var tempobj = {};
            tempobj.TournamentId = result[0];
            tempobj.Courts = result[1];
            tempobj.Events = result[2];
            tempobj.Formats = result[3];
            tempobj.Matchs = result[4];
            tempobj.Referee = result[5];
            
        }) */
       
  })(req, res, next)
});

module.exports = router;