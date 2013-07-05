
var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectID = Schema.ObjectId;
var debug = require('debug')('model:User');
var mailers = require('../lib/mailers.js');

var UserSchema = new mongoose.Schema({
  username : {
    type : String,
    required : true,
    index: {
      unique: true, 
      dropDups: true
    }
  },
  realtime_connected : { type : Boolean, default : false },
  socket_id : { type : String },
  fname : {
    type : String
  },
  lname : {
    type : String
  },    
  email : {
    required : true,
    type : String,
    index: {
      unique: true, 
      dropDups: true
    }
  },  
  salt : {type : String},
  hash : {type : String},
  reset_token : { type : String },

  notifications : [{
    target_id : ObjectID,
    target_type : {type : String, required : true},
    url : {type : String, required : true},
    msg : {type : String, required : true},
    date : {type : Date, default : Date.now},
    read : {type : Boolean, default : false}
  }],
  
  updated_at : { type : Date, default : Date.now },
  created_at : { type : Date, default : Date.now }
});

/**
 * Salt and Hash helper
 */
var pass = require('pwd');

UserSchema.statics.loginLocal = function(username, password, cb) {    
  _db.User.findOne({username : username}, function(err, user) {
    if (user == null || err)
      return cb(true, false, {msg : 'Unknown user'});

    pass.hash(password, user.salt, function(err, hash){
      if (err)
 	return cb(true, false, {msg : 'Error'});
      
      if (user.hash != hash)
 	return cb(true, false, {msg : 'Invalid password'});
      
      return cb(null, user);
    });
    return false;
  });
};

UserSchema.statics.saltPass = function(user, cb) {
  pass.hash(user.password, function(err, salt, hash){
    user.salt = salt;
    user.hash = hash;
    return cb(user);
  });
  return false;
};

UserSchema.statics.register = function(dt_user, cb) {
  var self = this;
  var user_invite_id = dt_user.invite_username || null;

  this.saltPass(dt_user, function(t_user) {
    var db_user = new User(t_user);
    
    db_user.save(function(err) {
      debug('New user registered : ' + db_user);
      return cb(err, db_user);
    });
  });
};

/**
 * Add notification to user_id user
 *
 * @param {ObjectID} user target user id
 * @param {opt = {
 * 	target_id,
 * 	target_type,
 * 	url,
 * 	msg
 * }} opts structure to send for notifications
 * @param {Express Object} app express instance
 */
UserSchema.statics.notify = function(user_id, notification, app) {
  var self = this;

  // Defer exec
  process.nextTick(function() {
    debug('Notifying user = %s', user_id);
    self.findOne({_id : user_id}, function(err, user) {
      if (err) return debug(err);

      // Send user an email
      mailers.new_user_notification(user.email, notification); 

      // Add notification at the beggining of array
      user.notifications.unshift(notification);
      
      // Keep only 20 notifications on notification stack
      user.notifications.splice(15, 10);

      user.save(function(err) {
	if (err) return debug(err);
	self.pushNotification(user, notification, app);
        return false;
      });
      return false;
    });
  });
};

//
// Push notifiaction to target user in real time
//
UserSchema.statics.pushNotification = function(user, notif, app) {
  debug('Pushing notification to user %s - %s',
        user.username,
	user.realtime_connected);
  
  if (user.realtime_connected == false) return false;
  var sio = app.lib.socketio;
  sio.sockets.socket(user.socket_id).emit('notification', notif);
  return false;
};


var User = mongoose.model('User', UserSchema);

// Public data when populating embedded field
User.public_data = 'username fname lname email facebook_id bio picture';

module.exports = function(app) {
  return User;
};
