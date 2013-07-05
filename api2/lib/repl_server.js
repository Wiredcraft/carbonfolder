//
// _______ _______ _______ _______ _______ ______         _______  ______ _______
// |_____| |______ |______ |______ |  |  | |_____] |      |_____| |  ____ |_____
// |     | ______| ______| |______ |  |  | |_____] |_____ |     | |_____| |_____
//                                                                                  
// Repl Server

var repl = require('repl');
var net = require('net');
var debug = require('debug')('init:repl');

function ReplServer(app) {

    debug('Launching REPL');
    
    net.createServer(function(socket) {
	debug('Client connected to REPL');
	var r = repl.start({
	    prompt: app.get('title') + ' - ' + app.get('env') + ' > ',
	    input: socket,
	    output: socket,
	    terminal: true,
	    useGlobal: true,
	    useColor : true
	});
	r.on('exit', function () {
	    socket.end();
	});
	r.context.app = app;
	r.context.routes = app.routes;
	r.context.db = global.dbG;
	r.context.models = app.models;
	r.context.controllers = app.controllers;
    }).listen(1337);
};

module.exports = ReplServer;
