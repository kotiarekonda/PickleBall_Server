'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var UserSchema = new Schema({
  FirstName: String,
  LastName: String,
  UserName: String,
  normalized:{
    type: String,
    lowercase: true
  },
  email: { type: String, lowercase: true },
  Phone: String,
  City: String,
  PostalCode: Number,
  Country: String,
  ProfilePicture: String,
  Plays: String,
  role: {
    type: String
  },
  Gender:{
    type: String
  },
  BirthDate:{
    type: String
  },
  Address1:{
    type: String
  },
  Address2:{
    type: String
  },
  State:{
    type: String
  },
  "TShirtSize":{
    type: String
  },
  "AltPhone":{
    type: String
  },
  "EmergencyContact":{
    type: String
  },
  "EmergencyContactName":{
    type: String
  },
  Club:{
    type: String
  },
  "SinglesSkillLevel":{
    type: String
  },
  "DoublesSkillLevel":{
    type: String
  },
  "SkillRatingBy":{
    type: Number
  },
  "USAPAMemberNumber":{
    type: Number
  },
  TempPassword:{
    type: String
  },
  PublicProfile1:{
    type: Object
  },
  PublicProfile2:{
    type: Object
  },
  Photos:{
    type: Array
  },
  hashedPassword: String,
  salt: String
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

//user name validation
UserSchema
  .path('UserName')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({UserName: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified user name is already in use. Plase try another one');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword))
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');
  }
};

module.exports = mongoose.model('Users', UserSchema, "Users");
