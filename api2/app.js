//
// _______ _______ _______ _______ _______ ______         _______  ______ ______
// |_____| |______ |______ |______ |  |  | |_____] |      |_____| |  ____ |_____
// |     | ______| ______| |______ |  |  | |_____] |_____ |     | |_____| |_____
//                                                                                  
// Express Assemblage MVD framework

/**
 * For modules debugging
 * TODO checking in express where is the env variable
 */
process.env.DEBUG = 'init:*, server:*, model:*, config:*';

/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var load = require('express-load');
var namespace = require('express-namespace');
var debug = require('debug');

var app = express();
/*
 * Make it global for convenience
 */
global._app = app;

var path = __dirname + '/';

load.basePath = path;

var server = http.createServer(app);

/**
 *  Configure app.
 *  Load all files from environments
 *  and inject data into app
 */
load('environments', {verbose : app.get('debug')})
  .then('config.js')
  .into(app);

/**
 *  Load app
 */
load('models/db.js', {verbose : app.get('debug')})
  .then('lib/auth.js')
  .then('models/User.js')
  .then('controllers')
  .into(app);

load('routes.js', {verbose : app.get('debug')})
  .into(app);

load('lib/socketio.js', {verbose : app.get('debug')})
  .into(app, server);

/**
 * Global variable for accessing db in a more convenient way
 */
global._db = app.models;

/**
 * Rocket launching
 */
server.listen(app.get('port'), function(){
  console.log('√ %s application launched on port %s in %s env',
              app.get('title'),
              app.get('port'),
	      app.get('env'));
});

exports.app = app;
