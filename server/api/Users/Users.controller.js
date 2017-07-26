'use strict';
var _ = require('lodash');
var User = require('./Users.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var Mailgun = require('mailgun-js');
var fs = require('fs');

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

//Your api key, from Mailgun’s Control Panel
var api_key = 'key-0623f4902fe978607ca6c52d4de1e33b';

//Your domain, from the Mailgun Control Panel
var domain = 'nadboytech.in';

//Your sending email address
var from_who = 'rootvinn@nadboytech.in';

var validationError = function(res, err) {
  return res.status(422).json(err);
};

exports.playerprofile = function(req, res){
  User.findById(req.user._id, {TempPassword: 0, hashedPassword: 0, salt: 0}, function(err, userprofile){ 
    if(err){ return handleError(res, err); }
    res.status(200).json(userprofile);
  })
}

exports.photoupload = function(req, res){
  let sampleFile = req.files.sampleFile;
  console.log('image path >>>>>>', sampleFile);
  /*let filename = sampleFile.name;
  var rendomkeys = "abcdefghijklmnopqrstuvwxyz0123456789";
  var randomname = "";
    for(var i = 0; i < 10; i++){
      randomname += rendomkeys.charAt(Math.floor(Math.random() * rendomkeys.length));
    }
    var finalname = randomname+filename;
  sampleFile.mv('./uploads/'+finalname, function(err) {
    if (err){ return res.status(500).send(err); }
    console.log("image url >>>>>>", "http://localhost:9000/"+finalname);
    res.send('File uploaded!');
  });*/
}

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser =  new User(req.body);
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresIn: 60 * 60 * 5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;
  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};


// forgot password
exports.forgotpassword = function(req, res){
  User.find({
    email: req.body.email
  }, {
    _id: 1
  }, function(err, userdtls) {
    if (err) {
      return handleError(res, err);
    }
    if (userdtls.length > 0) {
      //var randcode = Math.random().toString(36).slice(2);
      var randcode = "";
      var possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 15; i++) {
        randcode += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      var settemppassword = User.update({
        email: req.body.email
      }, {
        $set: {
          TempPassword: randcode
        }
      });
      settemppassword.exec();
      var prc = userdtls[0]._id + "!" + randcode;

      var templatePath = "server/mailtemplates/Forgotpassword.html";
      var templateContent = fs.readFileSync(templatePath, "utf8");
      var link = "<a href='" + req.protocol + '://' + req.hostname +"/api/users/resetpassword/" +prc + "'>Click Here</a>";
      templateContent = templateContent.replace("##link##", link);
      var mailgun = new Mailgun({
        apiKey: api_key,
        domain: domain
      });
      var data = {
        //Specify email data
        from: from_who,
        //The email to contact
        to: req.body.email,
        //Subject and text data
        subject: 'Password reset link',
        html: templateContent
      }

      //Invokes the method to send emails given the above data with the helper library
      mailgun.messages().send(data, function(err, body) {
        //If there is an error, render the error page
        if (err) {
          /*res.render('error', {
            error: err
          });*/
          //console.log("got an error: ", err);
          res.status(400).send({error:"Something went wrong while sending mail"});
          
        }
        //Else we can greet    and leave
        else {
          //Here "submitted.jade" is the view file for this landing page
          //We pass the variable "email" from the url parameter in an object rendered by Jade
          //The below function will stores the current activity
          

          res.status(200).send("We've sent a password reset link to your mail");
        }
      });        
    } else {
      res.status(400).send({error:"It seems the email doesn't exists with us"});
    }
  });
}

//reset password
exports.resetpassword = function(req, res){
  var resetcode = req.params.prccode.split('!');
  var userid = resetcode[0];
  var tempcode = resetcode[1];
  User.find({
    _id: userid,
    TempPassword: tempcode
  }, {
    email: 1
  }, function(err, status) {
    if (err) {
      return handleError(res, err);
    }
    if (status.length > 0) {
      res.redirect('http://localhost:9000/fpHome/fp=true/'+req.params.prccode);
      //res.send(true);

    } else {
      res.redirect('http://localhost:9000/resetpassword/linkexpired=true');
      //res.send(false);
    }
  });
}

exports.setnewpassword = function(req, res){
  var resetcode = req.body.prccode.split('!');
  var userid = resetcode[0];
  var tempcode = resetcode[1];
  var newpassword = req.body.password
  User.find({_id: userid,TempPassword: tempcode}, {_id: 1, email: 1, Phone: 1}, function(err, userdetails) {
    if(err){ return handleError(res, err); }
    if (userdetails.length > 0) {
      User.findById(userid, function(err, user) {
        user.TempPassword = '';
        user.password = newpassword;
        user.save(function(err, status) {
          if (err) return validationError(res, err);
          if(status){
            res.status(200).json({status:"success", data:"new password successfully added"});
          }else{
            res.status(200).json({status:"failed", data:"failed to set new password"});
          }
        })  
      })    
    }else{
      res.status(400).json({error:'It seems the link was expired'});
    }
  })  
}
/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

//user profile update
exports.userprofile = function(req, res){
  User.findById(req.user._id, function(err, user){
    if(err){ return handleError(res, err); }
    var userobj = _.merge(user, req.body);
    userobj.save(function(err, userdetails){
      if(err){ return handleError(res, err); }
      res.status(200).send(userdetails);
    })
  })
}

exports.publicprofile = function(req, res){
  var updatepublicqry;
  req.body.PublicProfile1 = {};
  if(req.body.PublicProfile1){
    if(req.body.PublicProfile1.ProfilePic !== undefined){
      console.log("true");
      User.update({_id: req.user._id}, {$set:{PublicProfile1: req.body.PublicProfile1}}, function(err, userprofile){
        if(err){ return handleError(res, err); }
          res.status(200).json("public profile updated successfully");
      });
    }else{
      console.log("false");
        req.body.PublicProfile1['Indoor/Outdoor/Preference'] = "Indoor";
        req.body.PublicProfile1.Homeclub = "Darsi1";
        req.body.PublicProfile1.Swings = "541"; 
        req.body.PublicProfile1.Hometown = "Darsi1";
        console.log("file >>>>>>", req.files.ProfilePic);
      let sampleFile = req.files.ProfilePic;
      let filename = sampleFile.name;
      var rendomkeys = "abcdefghijklmnopqrstuvwxyz0123456789";
      var randomname = "";
        for(var i = 0; i < 10; i++){
          randomname += rendomkeys.charAt(Math.floor(Math.random() * rendomkeys.length));
        }
        var finalname = randomname+filename;
      sampleFile.mv('./uploads/'+finalname, function(err) {
        if (err){ return res.status(500).send(err); }
        req.body.PublicProfile1.ProfilePic = "http://localhost:9000/"+finalname;
        console.log("public profile1 &&&&&&&", req.body.PublicProfile1);
        //update public profile 1
        User.update({_id: req.user._id}, {$set:{PublicProfile1: req.body.PublicProfile1}}, function(err, userprofile){
          if(err){ return handleError(res, err); }
            res.status(200).json("public profile updated successfully");
        });
      });
    }    
  }else if(req.body.PublicProfile2){
    User.update({_id: req.user._id}, {$set:{PublicProfile2: req.body.PublicProfile2}}, function(err, userprofile){
      if(err){ return handleError(res, err); }
        res.status(200).json("public profile updated successfully");
    });
  }else if(req.body.Photos){
    updatepublicqry = User.update({_id: req.user._id}, {$set:{Photos: req.body.Photos}}, function(err, userprofile){
      if(err){ return handleError(res, err); }
        res.status(200).json("public profile updated successfully");
    });
  }
}

exports.playerlookupsearch = function(req, res){
  var key = '/^'+req.params.Name+'/i';
  User.find({LastName: {$regex: key}, role: 'Player'},{LastName: 1}).exec(function(err, userdata){
    if(err){ return handleError(res, err); }
    res.status(200).send(userdata);
  });
  /*User.find({LastName: new RegExp(req.params.Name,'i'), role:'Player'}, function(err, userdata){
    if(err){ return handleError(res, err); }
    res.status(200).json(userdata);
  })*/
}

function handleError(res, err) {
  return res.status(500).send(err);
}

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
