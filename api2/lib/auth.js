
var passport         = require('passport'),
    LocalStrategy    = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    pass             = require('pwd'),
    debug            = require('debug')('init:auth');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  _db.User.findOne({_id:id}, function (err, user) {
    return done(err, user);
  });
});

/*
 * Username + password strategy
 */
passport.use(new LocalStrategy(function(username, password, cb) {
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
    return true;
  });
}));

/*
 * Oauth2 Register Facebook strategy
 */

passport.use(new FacebookStrategy({
  clientID      : _app.get('fb_id'),
  clientSecret  : _app.get('fb_secret'),
  callbackURL   : _app.get('fb_cb_url'),
  profileFields : ['id', 'displayName', 'photos']
}, function(accessToken, refreshToken, profile, done) {
  
  _db.User.findOne({'facebook_id' : profile.id}, function(err, user) {
    if (user && user.facebook_id) {
      debug('User already registered in FB');
      return done(null, user);
    }

    debug(profile);
    debug('New user registering with facebook oauth');	    
    var new_user = new _db.User();

    new_user.facebook_id = profile.id;
    new_user.facebook_link = profile.link;
    new_user.username = profile.username;
    new_user.email = profile.emails[0].value;
    new_user.fname = profile.name.givenName;
    new_user.lname = profile.name.familyName;
    new_user.username = profile.username;

    new_user.save(function(err) {
      if (err)
	return done(err, false, {msg : 'Error when saving user with FB'});
      debug('User ' + new_user.username + ' has been registered');
      return done(null, new_user);
    });
    return true;
  });    
}));


/*
 * Imported functions
 */
function auth(app) {
  debug('Initializing passport');
  app.use(passport.initialize());
  app.use(passport.session());    
  return auth;
}

auth.mid = {};

auth.mid.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated())
    return next(); 
  return res.send(401);
};

module.exports = auth;
