var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      nameField: 'UserName',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, name, done) {
      var conditionarray = [];
      if (name) {
        conditionarray.push({UserName:name});
      }
      if (typeof(email) == 'string') {
        conditionarray.push({email:email.toLowerCase()}); 
      }
      User.findOne({$or: conditionarray}/*{
        email: email.toLowerCase()
      }*/, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, { message: 'Please check your username, then try again.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Please check your password, then try again.' });
        }
        return done(null, user);
      });
    }
  ));
};