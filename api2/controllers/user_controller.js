
var utils    = require('../lib/utils.js');
var pass     = require('pwd');
var passport = require('passport');
var path     = require('path');
var uuid     = require('../lib/uuid.js');
var _        = require('underscore');
var express  = require('express');

//
// Passport local authentification
//
exports.login = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user)
      return res.send(404, info);

    req.logIn(user, function(err) {
      if (err)
	return res.send(404, err);
      return res.send({user : user});
    });
    return false;
  })(req, res, next);
};

//
// Passport facebook authentification
//
exports.logout = function(req, res) {
  req.logout();
  return res.send({success:true});
};

//
// Local user register (raw method)
//
exports.register = function(req, res) {
  if (!req.body || utils.isEmptyObject(req.body))
    return res.send(500, {success:false, err : 'Body empty'});
  
  var dt_user = req.body;

  _db.User.register(dt_user, function(err, db_user) {
    if (err) {
      if (err.code == 11000 && err.err.indexOf('email') >= 0)
        return res.send(409, {err : db_user.email + ' : email already used'});
      if (err.code == 11000 && err.err.indexOf('username') >= 0)
        return res.send(409, {err : db_user.username + ' : username already used'});
    }
    return res.send(db_user); 
  });
};

exports.reset_password = function(req, res) {
  var tmp_id = uuid.v4();
  var msg_txt = 'Click here to change your password : http://app.canyouship.it/#/change_password/' + tmp_id;

  _db.User.findOne({email : req.body.email}, function(err, user) {
    if (err || !user) return res.send(500, {msg : 'User not found'});

    user.reset_token = tmp_id;

    req.app.get('mail_server').send({
      text :  msg_txt,
      from : req.app.get('smtp_from'),
      to : user.email,
      subject : '✈ Reset password'
    }, function(err, msg) {
      if (err) return console.error('Err when sending reset pass', err);
      console.info('Reset password message has been sent');
    });

    user.save(function() {
      return res.send(200);
    });
    return true;
  });

};

exports.submit_new_password = function(req, res) {
  if (!(req.body.reset_token && req.body.password))
    return res.send(500, {msg : 'Params missing'});

  _db.User.findOne({reset_token : req.body.reset_token}, function(err, user) {
    if (!user) return res.send(500, {msg : 'Wrong token'});
    user.password = req.body.password;
    _db.User.saltPass(user, function(new_user) {
      new_user.reset_token = null;
      new_user.save(function(err, dt) {
        if (err) return res.send(501, err);
        return res.send(new_user);
      });
    });
  });
};

exports.show = function(req, res) {
  if (!req.params.id)
    return res.status(404).send({success:false, err : 'Body empty'});
  
  _db.User.findOne({_id : req.params.id}, function(err, dt) {
    return res.send({dt : dt, err : err});
  });
};

exports.my_profile = function(req, res) {
  return res.send(req.user);    
};

exports.update = function(req, res) {
  if (!req.body || utils.isEmptyObject(req.body))
    return res.send(500,{success:false, err : 'Body empty'});

  // If not the current user who update the user, redirect
  if (req.body._id != req.user._id)
    return res.send(403, {err : 'Fuck you cracker'});

  // SECURITY - Filter params
  var updated_user = _.omit(req.body, ['salt', 'hash', 'reviews', 'friends', 'created_at', '_id']);


  _db.User.findOneAndUpdate({_id : req.user._id}, updated_user, {}, function(err, doc) {
    if (err) return res.send(500,{success : false, err : err});
    return res.send(doc);
  });
};
