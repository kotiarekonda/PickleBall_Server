'use strict';

var express = require('express');
var controller = require('./SheduledMatches.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();
router.post('/refereelogin', controller.refereelogin);
router.get('/spectatormatchs/:TournamentId', controller.spectatormatchs);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', controller.update);
//router.patch('/:id', controller.update);
router.delete('/deletematch/:MatchId', controller.deletematch);
router.delete('/:id', controller.destroy);
router.post('/matchsheduledmatcheslist', auth.isAuthenticated(), controller.matchsheduledfields);
router.post('/reloadservice', auth.isAuthenticated(), controller.reloadrefereelogin);
router.get('/livescore/:MatchId', controller.livescore);

module.exports = router;