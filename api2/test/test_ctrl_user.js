
var app        = require('../app.js').app;
var Srequest   = require('supertest');
var superagent = require('superagent');
var request    = require('request');
var should     = require('should');

var mock       = require('./fixtures/mock.js');

var user_mock = mock.generate_user_sync();
var user_mock_2 = mock.generate_user_sync();
var user_mock_3 = mock.generate_user_sync();

var URL_PREFIX = global._app.get('site_url');

describe('User controller', function() {
  before(function(done) {
    _db.User.remove({}, function(err) {
      done();
    });
  });
  
  var agent3 = superagent.agent();

  it('should save user when post - remove pass and generate salt + hash', function(done) {
    agent3
      .post(URL_PREFIX + '/api/users/register')
      .send(user_mock_2)
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);
        res.text.should.include('user');
        should.exist(res.headers['set-cookie']);
        done();
      });
  });

  // var Emiland = mock.generate_user_sync();
  // var EmilandBrowser = superagent.agent();


  // it('should save user when post - remove pass and generate salt + hash', function(done) {

  // });

  it('should send right error message when duplicates', function(done) {
    user_mock_3.username = user_mock_2.username;

    agent3
      .post(URL_PREFIX + '/api/users/register')
      .send(user_mock_3)
      .end(function(err, res) {
        res.should.have.status(409);
        res.text.should.include('username already used');
        done();
      });
  });

  it('should throw error without params', function(done) {
    Srequest(app)
      .post('/api/users/show/')
      .expect(404, done);
  });


  it('should logout', function(done) {
    Srequest(app)
      .get('/api/users/logout')
      .expect(200, done);
  });



  it('should fail when wrong pass', function(done) {
    Srequest(app)
      .post('/api/users/login')
      .send({username : user_mock.username,
	     password : '126'})
      .expect(500, done);
  });

  it('should fail when wrong login', function(done) {
    Srequest(app)
      .post('/api/users/login')
      .send({username : 'Moncul',
	     password : '1256'})
      .expect(500, done);
  });


  var agent1 = superagent.agent();
  var agent2 = superagent.agent();

  it('should login user succesfully', function(done) {
    agent2
      .post(URL_PREFIX + '/api/users/login')
      .send({username : user_mock_2.username,
	     password : user_mock_2.password})
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);
        res.text.should.include('user');
        should.exist(res.headers['set-cookie']);
        done();
      });
  });


  it('should send my data (RIGHT) and keep my cookie', function(done) {

    agent2
      .get(URL_PREFIX + '/api/users/me')
      .end(function(err, res) {
        should.not.exist(err);
        res.text.should.include(user_mock_2.username).include(user_mock_2.email);
        res.should.have.status(200);
        return done();
      });
  });

  it('should logout me', function(done) {
    agent2
      .get(URL_PREFIX + '/api/users/logout')
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);

        agent2
	  .get(URL_PREFIX + '/api/users/me')
	  .end(function(err, res) {
	    should.not.exist(err);
	    res.should.have.status(401);
	    return done();
          });
      });
  });

  describe('Reset user password', function () {
    var userA = mock.generate_user_sync();
    var userA_agent = superagent.agent();
    var reset_token;
    var old_pass_salt;

    it('should ask for password reset', function(done) {
      userA_agent
	.post(URL_PREFIX + '/api/users/reset_password')
	.send({email : user_mock_2.email})
	.end(function(err, res) {
	  should.not.exist(err);
	  res.should.have.status(200);


	  _db.User.findOne({email : user_mock_2.email}, function(err, user) {
	    user.reset_token.should.be.not.null;
	    old_pass_salt = user.salt;
	    reset_token = user.reset_token;
	    return done();
	  });
        });
    });

    it('should reset password with right token', function(done) {
      userA_agent
	.post(URL_PREFIX + '/api/users/submit_new_password')
	.send({password : 'toto', reset_token : reset_token})
	.end(function(err, res) {
	  should.not.exist(err);
	  res.should.have.status(200);
	  res.body.salt.should.not.be.equal(old_pass_salt);
	  return done();
        });
    });

    it('should login with new credentials', function(done) {
      userA_agent
	.post(URL_PREFIX + '/api/users/login')
	.send({username : user_mock_2.username,
	       password : 'toto'})
	.end(function(err, res) {
	  res.should.have.status(200);
	  res.text.should.include('user');
	  done();
        });
    });

  });
});
