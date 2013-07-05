
var socketio = require('socket.io');
var debug = require('debug')('config:socketio');
var RedisStore = require('socket.io/lib/stores/redis');
var redis  = require('socket.io/node_modules/redis');

var express = require('express');
var SessionSockets = require('session.socket.io');

var pub = redis.createClient();
var sub = redis.createClient();
var client = redis.createClient();

module.exports = function(app, appInstance) {
  debug('Launching socket.io instance on /api/socket.io endpoint');
  var io = configure(appInstance);

  var sessionSockets = new SessionSockets(io, 		
		                          app.get('session_store'),
		                          app.get('cookie_parser'));
  
  handleSocket(sessionSockets, io);
  return io;
};

/**
 * Set realtime_connected flag and socket id to current logged user
 * @param  {Object} session   express session
 * @param  {Boolean} realtime  true or false
 * @param  {String} socket_id Socket id
 */
function user_in_realtime(session, realtime, socket_id) {
  _db.User.findOneAndUpdate({
    _id : session.passport.user
  },{
    realtime_connected : realtime,
    socket_id : socket_id,
    updated_at : new Date()
  }, function(err, user) {
    debug("User %s, realtime = %s", user.socket_id, user.realtime_connected);
  });
}

// Server side socket events
function handleSocket(sessionSockets, io) {

  sessionSockets.on('connection', function (err, socket, session) {
    // Flag current user as logged in realime
    user_in_realtime(session, true, socket.id);


    io.sockets.socket(socket.id).emit('init', {
      success : true,
      msg : 'Succesfully initiated'
    });

    socket.on('disconnect', function() {
      user_in_realtime(session, false, '');
    });

    // Notification event is emited is User.js model
    // sio.sockets.socket(user.socket_id).emit('notification', notif);
  });
};

function configure(appInstance) {
  var io = socketio.listen(appInstance);

  io.configure(function() {
    io.enable('browser client minification etag');
    io.set('log level', 1);

    io.set('transports', 
	   [
	     'websocket',
	     'htmlfile',
	     'xhr-polling',
	     'jsonp-polling'
	   ]);

    io.set('store', new RedisStore({
      redisPub : pub, 
      redisSub : sub, 
      redisClient : client
    }));
  });
  return io;
}

