
var express = require('express');
var path = require('path');
var email = require('emailjs');

var RedisStore = require('connect-redis')(express);

module.exports = function(app) {
  for (var environment in app.environments) {
    app.configure(environment, function() {
      for (var key in app.environments[environment]) {
	app.set(key, app.environments[environment][key]);
      }
    });
  }

  app.configure(function() {
    app.use(express.logger('dev'));
    app.use(express.compress());
    app.use(express.bodyParser());

    app.enable('trust proxy');

    // Cookie parsing
    app.set('cookie_parser', express.cookieParser(app.get('session_secret')));
    app.use(app.get('cookie_parser'));

    // Session storage
    app.set('session_store', new RedisStore);
    app.use(express.session({ store : app.get('session_store') }));

    // Mail handling
    var mail_server = email.server.connect({
      user     : app.get('smtp_user'),
      password : app.get('smtp_password'),
      host     : "smtp.gmail.com",
      ssl      : true
    });
    app.set('mail_server', mail_server);
    
    app.use(express.methodOverride());
    
    //app.use(express.vhost('goo.com', function() {}));
  });

  app.configure('development', function(){    
    app.use(express.errorHandler());
  });

  //
  // Mount application
  //
  app.configure(function() {
    // app.use('/admin', express.basicAuth('admin', 'maolovesh'));
    // app.use('/admin', express.static(path.join(__dirname, '../packapp/admin')));
  });

  return app;
};
