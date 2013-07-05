'use strict';

var app = require('../app.js').app;
var Srequest = require('supertest');
var superagent = require('superagent');
var request = require('request');
var should = require('should');
var fbagent = require('fbagent');

describe('User controller', function() {
    before(function(done) {
    	_db.User.remove({}, function(err) {
	    done();
	});
    });
    
    // it('should test', function(done) {
    // 	fbagent
    // 	    .get('/oauth/access_token')
    // 	    .send({
    // 		client_id: '561472833865065'
    // 		, client_secret: '4d594ad21e613355beb8fcba44e03c6b'
    // 		, grant_type: 'client_credentials'
    // 	    })
    // 	    .end(function (err, res) {
    // 		appToken = res.access_token;
    // 		done();
    // 	    });
    // });

    
    
});
