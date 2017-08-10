'use strict';
var _ = require('lodash');
var User = require('./Users.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var Mailgun = require('mailgun-js');
var fs = require('fs');
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
  User.findById(req.user._id, {TempPassword: 0, hashedPassword: 0, salt: 0}).lean().exec(function(err, userprofile){ 
    if(err){ return handleError(res, err); }
    var profile = {};
    //player public profile
    userprofile.PublicProfile = {};
    if(userprofile.PublicProfile1 !== undefined){
      userprofile.PublicProfile.HomeTown = userprofile.PublicProfile1.HomeTown;
      userprofile.PublicProfile.Swings = userprofile.PublicProfile1.Swings;
      userprofile.PublicProfile.HomeClub = userprofile.PublicProfile1.HomeClub;
      userprofile.PublicProfile.IndoorOutdoorPreference = userprofile.PublicProfile1.IndoorOutdoorPreference;
      userprofile.PublicProfile.FavoritePaddle = userprofile.PublicProfile1.FavoritePaddle;
      userprofile.PublicProfile.BeenPlaying = userprofile.PublicProfile1.BeenPlaying;
      userprofile.PublicProfile.ProfilePic = userprofile.PublicProfile1.ProfilePic;
      userprofile.PublicProfile.SponsoredClub = userprofile.PublicProfile1.SponsoredClub;
    }
    if(userprofile.PublicProfile2 !== undefined){
      userprofile.PublicProfile.FavoriteFacility = userprofile.PublicProfile2.FavoriteFacility;
      userprofile.PublicProfile.FurthestLocation = userprofile.PublicProfile2.FurthestLocation;
      userprofile.PublicProfile.MostProud = userprofile.PublicProfile2.MostProud;
      userprofile.PublicProfile.SinglesDoubles = userprofile.PublicProfile2.SinglesDoubles;
      userprofile.PublicProfile.MiscInformation = userprofile.PublicProfile2.MiscInformation;
    }
    delete userprofile.PublicProfile1;
    delete userprofile.PublicProfile2;
    res.status(200).send(userprofile);
  })
}

exports.photoupload = function(req, res){
  //file upload callback function
  uploadingimages(req, res, req.files.ProfilePic, function(filename){
    User.findOne({_id: req.user._id}, function(err, userdata){
      if(err){ return handleError(res, err); }
      userdata.PublicProfile1.ProfilePic = "http://localhost:9000/"+filename;
      userdata.markModified("PublicProfile1");
      userdata.save(function(err, playerinfo){
        if(err){ return handleError(res, err); }
        res.status(200).json({"ProfilePic": playerinfo.PublicProfile1.ProfilePic});
      })
    })
  });
}

//upload files into server
function uploadingimages(req, res, file, callback){
  let sampleFile = file;
  let filename = sampleFile.name;
  var rendomkeys = "abcdefghijklmnopqrstuvwxyz0123456789";
  var randomname = "";
  for(var i = 0; i < 10; i++){
    randomname += rendomkeys.charAt(Math.floor(Math.random() * rendomkeys.length));
  }
  var finalname = randomname+filename;
  sampleFile.mv('./uploads/'+finalname, function(err) {
     callback(finalname);
  })
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
  req.body.normalized = req.body.LastName;
  var newUser =  new User(req.body);
  newUser.save(function(err, user) {
    if (err) return repeatedemailandusername(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresIn: 60 * 60 * 5 });
    res.json({ token: token });
  });
};


//exception handling
function repeatedemailandusername(res, err) {
  if(err.errors.email !== undefined){
    return res.status(500).send(err.errors.email.message);
  }else if(err.errors.UserName !== undefined){
    return res.status(500).send(err.errors.UserName.message);
  }else if(err.errors.hashedPassword !== undefined){
    return res.status(500).send(err.errors.hashedPassword.message);
  }
}
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
          res.status(400).json({error:"Something went wrong while sending mail"});
          
        }
        //Else we can greet    and leave
        else {
          //Here "submitted.jade" is the view file for this landing page
          //We pass the variable "email" from the url parameter in an object rendered by Jade
          //The below function will stores the current activity
          

          res.status(200).json("We've sent a password reset link to your mail");
        }
      });        
    } else {
      res.status(400).json({error:"It seems the email doesn't exists with us"});
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

//player details getting service
exports.playerdetails = function(req, res){
  User.findOne({
    _id: req.params.PlayerId
  }, {salt: 0, hashedPassword:0}).lean().exec(function(err, userprofile) { // don't ever give out the password or salt
    if (err) return handleError(res, err);
    if (!userprofile) return res.status(401).send('Player Details Not Found');
    userprofile.PublicProfile = {};
    if(userprofile.PublicProfile1 !== undefined){
      if(userprofile.PublicProfile1.ProfilePic !==undefined){
        userprofile.ProfilePic = userprofile.PublicProfile1.ProfilePic;
      }
    }    
    if(userprofile.PublicProfile1 !== undefined){
      userprofile.PublicProfile.HomeTown = userprofile.PublicProfile1.HomeTown;
      userprofile.PublicProfile.Swings = userprofile.PublicProfile1.Swings;
      userprofile.PublicProfile.HomeClub = userprofile.PublicProfile1.HomeClub;
      userprofile.PublicProfile.IndoorOutdoorPreference = userprofile.PublicProfile1.IndoorOutdoorPreference;
      userprofile.PublicProfile.FavoritePaddle = userprofile.PublicProfile1.FavoritePaddle;
      userprofile.PublicProfile.BeenPlaying = userprofile.PublicProfile1.BeenPlaying;
      userprofile.PublicProfile.SponsoredClub = userprofile.PublicProfile1.SponsoredClub;
    }
    if(userprofile.PublicProfile2 !== undefined){
      userprofile.PublicProfile.FavoriteFacility = userprofile.PublicProfile2.FavoriteFacility;
      userprofile.PublicProfile.FurthestLocation = userprofile.PublicProfile2.FurthestLocation;
      userprofile.PublicProfile.MostProud = userprofile.PublicProfile2.MostProud;
      userprofile.PublicProfile.SinglesDoubles = userprofile.PublicProfile2.SinglesDoubles;
      userprofile.PublicProfile.MiscInformation = userprofile.PublicProfile2.MiscInformation;
    }
    delete userprofile.PublicProfile1;
    delete userprofile.PublicProfile2;
    res.status(200).json(userprofile);
  });
}

//user profile update
exports.userprofile = function(req, res){
  User.findById(req.user._id, function(err, user){
    if(err){ return handleError(res, err); }
    req.body.normalized = req.body.LastName;
    req.body.PublicProfile1 = {};
    req.body.PublicProfile1.HomeTown = req.body.HomeTown;
    req.body.PublicProfile1.Swings = req.body.Swings;
    req.body.PublicProfile1.HomeClub = req.body.HomeClub;
    req.body.PublicProfile1.SponsoredClub = req.body.SponsoredClub;
    req.body.PublicProfile1.IndoorOutdoorPreference = req.body.IndoorOutdoorPreference;
    req.body.PublicProfile1.FavoritePaddle = req.body.FavoritePaddle;
    req.body.PublicProfile1.BeenPlaying = req.body.BeenPlaying;
    req.body.PublicProfile2 = {};
    req.body.PublicProfile2.FavoriteFacility = req.body.FavoriteFacility;
    req.body.PublicProfile2.FurthestLocation = req.body.FurthestLocation;
    req.body.PublicProfile2.MostProud = req.body.MostProud;
    req.body.PublicProfile2.SinglesDoubles = req.body.SinglesDoubles;
    req.body.PublicProfile2.MiscInformation = req.body.MiscInformation;
    var userobj = _.merge(user, req.body);
    userobj.markModified("PublicProfile1");
    userobj.markModified("PublicProfile2");
    userobj.save(function(err, userdetails){
      if(err){ return handleError(res, err); }
      User.findOne({_id: req.user._id},{salt: 0, hashedPassword: 0}).lean().exec(function(err, userprofile){
        if(err){ return handleError(res, err); }
        userprofile.PublicProfile = {};
        if(userprofile.PublicProfile1 !== undefined){
          userprofile.PublicProfile.HomeTown = userprofile.PublicProfile1.HomeTown;
          userprofile.PublicProfile.Swings = userprofile.PublicProfile1.Swings;
          userprofile.PublicProfile.HomeClub = userprofile.PublicProfile1.HomeClub;
          userprofile.PublicProfile.IndoorOutdoorPreference = userprofile.PublicProfile1.IndoorOutdoorPreference;
          userprofile.PublicProfile.FavoritePaddle = userprofile.PublicProfile1.FavoritePaddle;
          userprofile.PublicProfile.BeenPlaying = userprofile.PublicProfile1.BeenPlaying;
          userprofile.PublicProfile.ProfilePic = userprofile.PublicProfile1.ProfilePic;
          userprofile.PublicProfile.SponsoredClub = userprofile.PublicProfile1.SponsoredClub;

        }
        if(userprofile.PublicProfile2 !== undefined){
          userprofile.PublicProfile.FavoriteFacility = userprofile.PublicProfile2.FavoriteFacility;
          userprofile.PublicProfile.FurthestLocation = userprofile.PublicProfile2.FurthestLocation;
          userprofile.PublicProfile.MostProud = userprofile.PublicProfile2.MostProud;
          userprofile.PublicProfile.SinglesDoubles = userprofile.PublicProfile2.SinglesDoubles;
          userprofile.PublicProfile.MiscInformation = userprofile.PublicProfile2.MiscInformation;
        }
        delete userprofile.PublicProfile1;
        delete userprofile.PublicProfile2;
        res.status(200).send(userprofile);
      })
    })
  })
}

//public profile update
exports.publicprofile = function(req, res){
  var playerprofileupdate = [];
  if(req.body.key === "PublicProfile1"){
    if(req.files !== null){
      //profile pic upload
      uploadingimages(req, res, req.files.ProfilePic, function(filename){
        if(filename){
          User.findOne({_id: req.user._id}, function(err, playerprofile){
            if(err){ return handleError(res, err); }
            req.body.ProfilePic = "http://localhost:9000/"+filename;
            delete req.body.key;
            playerprofile.PublicProfile1 = req.body;
            playerprofile.markModified('PublicProfile1');
            playerprofile.save(function(err, profiledata){
              profiledata.PublicProfile = {};
              profiledata.PublicProfile.HomeTown = profiledata.PublicProfile1.HomeTown;
              profiledata.PublicProfile.Swings = profiledata.PublicProfile1.Swings;
              profiledata.PublicProfile.HomeClub = profiledata.PublicProfile1.HomeClub;
              profiledata.PublicProfile.IndoorOutdoorPreference = profiledata.PublicProfile1.IndoorOutdoorPreference;
              profiledata.PublicProfile.FavoritePaddle = profiledata.PublicProfile1.FavoritePaddle;
              profiledata.PublicProfile.BeenPlaying = profiledata.PublicProfile1.BeenPlaying;
              profiledata.PublicProfile.ProfilePic = profiledata.PublicProfile1.ProfilePic;
              res.status(200).send(profiledata);
            })
          })
        }
      })
    }else{
     User.findOne({_id: req.user._id}, function(err, playerprofile){
       if(err){ return handleError(res, err); }
       delete req.body.key;
       playerprofile.PublicProfile1 = req.body;
       playerprofile.markModified('PublicProfile1');
       playerprofile.save(function(err, profiledata){
        User.findOne({_id: req.user._id},{ salt: 0, hashedPassword: 0}).lean().exec(function(err, playerinfo){
          if(err){ return handleError(res, err); }
          playerinfo.PublicProfile = {};
          if(playerinfo.PublicProfile1 !== undefined){
             playerinfo.PublicProfile.HomeTown = playerinfo.PublicProfile1.HomeTown;
             playerinfo.PublicProfile.Swings = playerinfo.PublicProfile1.Swings;
             playerinfo.PublicProfile.HomeClub = playerinfo.PublicProfile1.HomeClub;
             playerinfo.PublicProfile.IndoorOutdoorPreference = playerinfo.PublicProfile1.IndoorOutdoorPreference;
             playerinfo.PublicProfile.FavoritePaddle = playerinfo.PublicProfile1.FavoritePaddle;
             playerinfo.PublicProfile.BeenPlaying = playerinfo.PublicProfile1.BeenPlaying;
             playerinfo.PublicProfile.ProfilePic = playerinfo.PublicProfile1.ProfilePic;
          }
          delete playerinfo.PublicProfile1;
          res.status(200).send(playerinfo);
        })
       })
     })
    }
  }else if(req.body.key === "PublicProfile2"){
    User.findOne({_id: req.user._id}, function(err, playerprofile){
      if(err){ return handleError(res, err); }
      delete req.body.key;
      playerprofile.PublicProfile2 = req.body;
      playerprofile.markModified('PublicProfile2');
      playerprofile.save(function(err, profiledata){
        User.find({_id: req.user._id},{ salt: 0, hashedPassword: 0}).lean().exec(function(err, playerinfo){
          if(err){ return handleError(res, err); }
          playerinfo.PublicProfile = {};
          if(playerinfo.PublicProfile1 !== undefined){
            playerinfo.PublicProfile.HomeTown = playerinfo.PublicProfile1.HomeTown;
            playerinfo.PublicProfile.Swings = playerinfo.PublicProfile1.Swings;
            playerinfo.PublicProfile.HomeClub = playerinfo.PublicProfile1.HomeClub;
            playerinfo.PublicProfile.IndoorOutdoorPreference = playerinfo.PublicProfile1.IndoorOutdoorPreference;
            playerinfo.PublicProfile.FavoritePaddle = playerinfo.PublicProfile1.FavoritePaddle;
            playerinfo.PublicProfile.BeenPlaying = playerinfo.PublicProfile1.BeenPlaying;
            playerinfo.PublicProfile.ProfilePic = playerinfo.PublicProfile1.ProfilePic;
          }
          if(playerinfo.PublicProfile2 !== undefined){
            playerinfo.PublicProfile.FavoriteFacility = playerinfo.PublicProfile2.FavoriteFacility;
            playerinfo.PublicProfile.FurthestLocation = playerinfo.PublicProfile2.FurthestLocation;
            playerinfo.PublicProfile.MostProud = playerinfo.PublicProfile2.MostProud;
            playerinfo.PublicProfile.SinglesDoubles = playerinfo.PublicProfile2.SinglesDoubles;
            playerinfo.PublicProfile.MiscInformation = playerinfo.PublicProfile2.MiscInformation;
          }
          delete playerinfo.PublicProfile1;
          delete playerinfo.PublicProfile2;
          res.status(200).send(playerinfo);
        })
      })
    })
  }else if(req.body.key === "Photos"){
    if(req.files !== null){
      if(Array.isArray(req.files['Photos[]']) === true){
        var pics = req.files['Photos[]'];
        var count = 0;
        var arr = [];
        pics.forEach(function(element, index){
          //profile pic upload
          uploadingimages(req, res, element, function(filename){
            count++;
            if(filename){
              arr.push("http://localhost:9000/"+filename);
            }
            if(count == pics.length){
              User.findOne({_id: req.user._id}, function(err, player){
                if(err){ return handleError(res, err); }
                player.Photos = arr;
                player.save(function(err, profiledata){
                  if(err){ return handleError(res, err); }
                  User.findOne({_id: req.user._id},{ salt: 0, hashedPassword: 0}).lean().exec(function(err, playerinfo){
                    if(err){ return handleError(res, err); }
                    playerinfo.PublicProfile = {};
                    if(playerinfo.PublicProfile1 !== undefined){
                      playerinfo.PublicProfile.HomeTown = playerinfo.PublicProfile1.HomeTown;
                      playerinfo.PublicProfile.Swings = playerinfo.PublicProfile1.Swings;
                      playerinfo.PublicProfile.HomeClub = playerinfo.PublicProfile1.HomeClub;
                      playerinfo.PublicProfile.IndoorOutdoorPreference = playerinfo.PublicProfile1.IndoorOutdoorPreference;
                      playerinfo.PublicProfile.FavoritePaddle = playerinfo.PublicProfile1.FavoritePaddle;
                      playerinfo.PublicProfile.BeenPlaying = playerinfo.PublicProfile1.BeenPlaying;
                      playerinfo.PublicProfile.ProfilePic = playerinfo.PublicProfile1.ProfilePic;
                    }
                    if(playerinfo.PublicProfile2 !== undefined){
                      playerinfo.PublicProfile.FavoriteFacility = playerinfo.PublicProfile2.FavoriteFacility;
                      playerinfo.PublicProfile.FurthestLocation = playerinfo.PublicProfile2.FurthestLocation;
                      playerinfo.PublicProfile.MostProud = playerinfo.PublicProfile2.MostProud;
                      playerinfo.PublicProfile.SinglesDoubles = playerinfo.PublicProfile2.SinglesDoubles;
                      playerinfo.PublicProfile.MiscInformation = playerinfo.PublicProfile2.MiscInformation;
                    }
                    delete playerinfo.PublicProfile1;
                    delete playerinfo.PublicProfile2;
                      res.status(200).send(playerinfo);
                  })
                })
              })
            }
          })
        })
      }else{
        //profile pic upload
        uploadingimages(req, res, req.files['Photos[]'], function(filename){
          User.findOne({_id: req.user._id}, function(err, player){
            if(err){ return handleError(res, err); }
            var path = "http://localhost:9000/"+filename;
            player.Photos = [path];
            player.save(function(err, profiledata){
              if(err){ return handleError(res, err); }
              User.findOne({_id: req.user._id},{ salt: 0, hashedPassword: 0}).lean().exec(function(err, playerinfo){
                if(err){ return handleError(res, err); }
                playerinfo.PublicProfile = {};
                if(playerinfo.PublicProfile1 !== undefined){
                  playerinfo.PublicProfile.HomeTown = playerinfo.PublicProfile1.HomeTown;
                  playerinfo.PublicProfile.Swings = playerinfo.PublicProfile1.Swings;
                  playerinfo.PublicProfile.HomeClub = playerinfo.PublicProfile1.HomeClub;
                  playerinfo.PublicProfile.IndoorOutdoorPreference = playerinfo.PublicProfile1.IndoorOutdoorPreference;
                  playerinfo.PublicProfile.FavoritePaddle = playerinfo.PublicProfile1.FavoritePaddle;
                  playerinfo.PublicProfile.BeenPlaying = playerinfo.PublicProfile1.BeenPlaying;
                  playerinfo.PublicProfile.ProfilePic = playerinfo.PublicProfile1.ProfilePic;
                }
                if(playerinfo.PublicProfile2 !== undefined){
                  playerinfo.PublicProfile.FavoriteFacility = playerinfo.PublicProfile2.FavoriteFacility;
                  playerinfo.PublicProfile.FurthestLocation = playerinfo.PublicProfile2.FurthestLocation;
                  playerinfo.PublicProfile.MostProud = playerinfo.PublicProfile2.MostProud;
                  playerinfo.PublicProfile.SinglesDoubles = playerinfo.PublicProfile2.SinglesDoubles;
                  playerinfo.PublicProfile.MiscInformation = playerinfo.PublicProfile2.MiscInformation;
                }
                delete playerinfo.PublicProfile1;
                delete playerinfo.PublicProfile2;
                  res.status(200).send(playerinfo);
              })
            })
          })
        })
      }
    }
  }
}

exports.playerlookupsearch = function(req, res){
  var searchqry;
  if(req.body.Letter){
    searchqry = User.find({LastName: {$regex: '^' + req.body.Letter, $options: 'i'}, role:'Player'},{FirstName: 1, LastName: 1, PublicProfile1: 1,  normalized: 1}).lean().sort('normalized');
  }else if(req.body.Gender){
    searchqry = User.find({Gender: req.body.Gender, role:'Player'},{FirstName: 1, LastName: 1, PublicProfile1: 1, normalized: 1} ).lean().sort('normalized');
  }else if(req.body.Name){
    searchqry = User.find({$or:[
      {FirstName: {$regex: '^' + req.body.Name, $options: 'i'}},
      {LastName: {$regex: '^' + req.body.Name, $options: 'i'}},
      {City: {$regex: '^' + req.body.Name, $options: 'i'}},
      {State: {$regex: '^' + req.body.Name, $options: 'i'}},
      {Country: {$regex: '^' + req.body.Name, $options: 'i'}},
      {HomeClub: {$regex: '^' + req.body.Name, $options: 'i'}}
      ], role: 'Player'}, {FirstName: 1, LastName: 1, City: 1, State: 1, Country: 1, PublicProfile1: 1, normalized: 1}).lean().limit(100).skip(req.body.Skip).sort('normalized');
  }else if(req.body.SkillRatingBy){
    searchqry = User.find({SkillRatingBy: req.body.SkillRatingBy, role: 'Player'},{FirstName: 1, LastName: 1, PublicProfile1: 1,  normalized: 1}).lean().sort('normalized');
  }
  searchqry.exec(function(err, userdetails){
    if(err){ return handleError(res, err);}
    if(userdetails.length > 0){
      userdetails.forEach(function(element, index){
          delete element.PublicProfile1;
          delete element.normalized;
      })
      res.status(200).json(userdetails);
    }else{
      res.status(200).json("No Matched Results Found");
    }
  })
}

//add multiple player photos
exports.multiplephotosupload = function(req, res){
  User.update({_id: req.user._id},{$pushAll:{ Photos: req.body.Photos}}, function(err, updatedpics){
    if(err){ return handleError(res, err); }
    if(updatedpics.nModified){
      res.status(200).json("successfully uploaded");
    }else{
      res.status(200).json("failed to upload");
    }
  })
}

//delete player images
exports.playerpicsremove = function(req, res){
  User.update({_id: req.user._id},{ $pullAll: {Photos: req.body.ImagePath}}).lean().exec(function(err, playerinfo){
    if(err){ return handleError(res, err); }
    if(playerinfo.nModified){
      res.status(200).json("successfully removed");
    }else{
      res.status(200).json("failed to remove");
    }
  })
}

//change password
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);
  User.findById(userId, function(err, user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).json('Password changed successfully');
      });
    } else {
      res.status(400).json({error:"Invalid current password"});
    }
  });
};


function handleError(res, err) {
  return res.status(500).send(err);
}

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
