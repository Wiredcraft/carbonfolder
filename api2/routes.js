//
//  ______  _____  _     _ _______ _______ _______
// |_____/ |     | |     |    |    |______ |______
// |    \_ |_____| |_____|    |    |______ ______|
//
// Routes Assemblage
// Namespace / Resource available

var passport = require('passport');

module.exports = function(app) {
  /**
   * Load Controllers / Middlewares.
   */
  var ctrl = app.controllers;
  var auth = app.lib.auth.mid;
  
  /**
   * Route to controllers.
   */
  app.namespace('/api', function() {

    app.get('/', function(req, res) {
      res.send({assembled:true});
    });

    app.namespace('/users', function() {
      var uCtrl = ctrl.userController;

      // Local login
      app.post('/login', uCtrl.login);
      app.post('/register', uCtrl.register);

      app.post('/reset_password', uCtrl.reset_password);
      app.post('/submit_new_password', uCtrl.submit_new_password);

      app.get('/show/:id?', uCtrl.show);
      app.get('/me',
     	      auth.ensureAuthenticated,
     	      uCtrl.my_profile);
      app.get('/logout', uCtrl.logout);
      
      app.get('/facebook', passport.authenticate('facebook'));
      app.get('/facebook/callback',
	      passport.authenticate('facebook', { failureRedirect: '/'}),
	      function(req, res, next) {
		console.log(req.user);
		res.send({success:true});
	      });
    });
    
    app.namespace('/resources', function() {

    });
  });

};
