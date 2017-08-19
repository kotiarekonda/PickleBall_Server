'use strict';

var express = require('express');
var controller = require('./Users.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/photoupload', auth.isAuthenticated(), controller.photoupload);
router.put('/updatepublicprofile', auth.isAuthenticated(), controller.publicprofile);
router.get('/playerprofile', auth.isAuthenticated(), controller.playerprofile);
router.get('/', /*auth.hasRole('admin'),*/ controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.post('/forgotpassword', controller.forgotpassword);
router.get('/resetpassword/:prccode', controller.resetpassword);
router.post('/setnewpassword', controller.setnewpassword);
router.post('/lookupsearch', controller.playerlookupsearch);
router.put('/userprofile', auth.isAuthenticated(), controller.userprofile);
router.get('/playerdetails/:PlayerId', controller.playerdetails);
router.post("/playerpicsremove", auth.isAuthenticated(), controller.playerpicsremove);
router.put("/multiplephotosupload", auth.isAuthenticated(), controller.multiplephotosupload);
router.put('/changePassword', auth.isAuthenticated(), controller.changePassword);
module.exports = router;
