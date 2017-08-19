'use strict';

var express = require('express');
var controller = require('./TournamentLocations.controller');

var router = express.Router();
router.get('/getlocation/:lattitude/:longitude', controller.getlocationdetails);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;