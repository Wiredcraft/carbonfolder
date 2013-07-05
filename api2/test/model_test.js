'use strict';

var should = require('should');

var user_mock = {
  username : 'Alex',
  fname : 'Alex',
  lname : 'Strz',
  password : '123456',
  email : 'strze@gmail.com',
  facebook : {
    id : '_1232313213',
    link : 'http://ok.com',	
  },
  friends : ['_1323132123', '_34234234324'],
  reviews : [{
    created_at : '213213132',
    user_emiter : '507f191e810c19729de860ea',
    comment : 'asdasadsadasd',
    trip : '507f191e810c19729de860ea'	
  }]
};

var app = require('../app.js').app;

describe('User model', function() {
  var gId;
  
  before(function(done) {
    _db.User.remove({}, function(err) {
      done();
    });
  });

  it('should have _db global variable', function() {
    _db.should.be.ok;
  });

  it('should save user mock and fail if 2nd registered', function(done) {
    var user = new _db.User(user_mock);
    user.save(function(err) {
      should.not.exist(err);
      should.exist(user._id);

      gId = user._id;
      
      var user2 = new _db.User(user_mock);
      user2.save(function(err) {
	should.exist(err);
	done();
      });
      
    });
  });
  
  it('should access to facebook id', function(done) {
    _db.User.count(function(res, sa) {
      sa.should.equal(1);
    });

    _db.User.findOne({_id : gId}, function(err, res) {	    
      should.not.exist(err);
      should.exist(res);

      done();
    });
  });
  
  it('should have saltpass', function() {
    _db.User.should.have.property('saltPass');
  });

});
