//////////////////////////////
// Factory bazard / mock.js //
//////////////////////////////
var Factory = require('rosie').Factory;
var Faker = require('Faker');
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

//////////////////
// Trip factory //
//////////////////
Factory.define('trip')
  .attr('date_of_trip', function() { var dt = new Date(); dt.setDate(dt.getDate() + 10); return dt; })
  .attr('from_loc', function() { return {place:'Phuket TH', lat:7.89059, lng:98.3981, country_code:'th'} })
  .attr('to_loc', function() { return {place:'Phuket TH', lat:7.89059, lng:98.3981, country_code:'th'} })
  .attr('conveyance', 'Plane')
  .attr('space_available', function() { return Math.floor((Math.random()*100)+1);});

//////////////////////////
// Notification factory //
//////////////////////////
Factory.define('notification')
  .attr('target_id', function() { return new ObjectId()})
  .attr('target_type', 'Request')
  .attr('url', '/request/123123')
  .attr('msg', function() { return Faker.Lorem.sentences() });

/////////////////////////////
// Review factory for User //
/////////////////////////////
Factory.define('review')
  .attr('created_at', function() {return new Date()})
  .attr('comment', function() { return Faker.Lorem.sentences() })
  .attr('trip', '507f191e810c19729de860ea');

//////////////////
// User factory //
//////////////////
Factory.define('user')
  .attr('username', function() { return Faker.Internet.userName() })
  .attr('fname', function() { return Faker.Name.firstName() })
  .attr('lname', function() { return Faker.Name.lastName() })
  .attr('password', '123456')
  .attr('email', function() { return Faker.Internet.email() })
  .attr('reviews', function() {
    return [
      Factory.attributes('review'),
      Factory.attributes('review')
    ];
  });

/////////////////////////////////
// Message factory for Request //
/////////////////////////////////
Factory.define('message')
  .attr('author', function() { return Faker.Internet.userName()})
  .attr('content', function() { return Faker.Lorem.sentences()});

/////////////////////
// Request factory //
/////////////////////
Factory.define('request')
  .attr('comment', function() {return Faker.Lorem.sentences()})
  .attr('_trip', function() { return new ObjectId()})
  .attr('messages', function() {
    return [
      Factory.attributes('message'),
      Factory.attributes('message')
    ]    
  });

exports.generate_notification = function(cb) {
  cb(Factory.build('notification'));
}

exports.generate_request = function(trip, cb) {
  cb(Factory.build('request', {_trip : trip._id}));
}

exports.generate_message = function(cb) {
  cb(Factory.build('message'));
}

exports.generate_user = function(cb) {
  cb(Factory.build('user'));
}

// Works synchronously
exports.generate_user_sync = function(cb) {
  return Factory.build('user');
}

// Generate user + register + attach a trip (dont login)
exports.generate_user_and_trip = function(cb) {
  var t_user = Factory.build('user');
  var self = this;
  
  _db.User.register(t_user, function(err, db_user) {        
    var trip = Factory.build('trip', {_owner : db_user._id});
    var m_trip = new _db.Trip(trip);

    m_trip.save(function() {
      return cb(db_user, m_trip);
    });       
  });
};

/**
 * Generate user register and login
 * @author Alexandre  Strzelewicz
 * @param  {cb} cb          cb
 * @return {object, agent}               return obj + agent logged
 */
exports.generate_user_register_and_login = function(cb) {
  var t_user = Factory.build('user');
  var self = this;

  _db.User.register(t_user, function(err, db_user) {
    self.login_user(db_user, function(agent){
      return cb(db_user, agent);
    });
  });
};

// Generate a trip without owner 
// (simulate use input before sending to server)
exports.generate_unsaved_trip = function(cb) {
  var trip = Factory.build('trip');
  cb(trip);
};

var superagent = require('superagent');

/**
 * Login user and get agent session
 * @author Alexandre  Strzelewicz
 * @param  {objet}   user        user already regitered in db
 * @param  {db} cb          cb
 * @return {agent}               superagent agent w session
 */
exports.login_user = function login_user(user, cb) {
  var ag = superagent.agent();
  ag
    .post('http://localhost:4000/api/users/login')
    .send({username : user.username,
           password : '123456'})
    .end(function(err, res) {
      return cb(ag);
    }); 

};


exports.generate_obj_id = function() {
  return new ObjectId();
};


///////////////////////////////////
// Deprecated to replace in test //
///////////////////////////////////
exports.user_mock = {
  username : 'Alex',
  fname : 'Alex',
  lname : 'Strz',
  password : '123456',
  email : 'strze@gmail.com',
  facebook_id : '_1232313213',
  facebook_link : 'http://ok.com',
  friends : ['_1323132123', '_34234234324'],
  reviews : [{
    created_at : '213213132',
    user_emiter : '507f191e810c19729de860ea',
    comment : 'asdasadsadasd',
    trip : '507f191e810c19729de860ea'	
  }]
};

