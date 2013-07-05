
var debug = require('debug')('init:auth');

var email = require('emailjs');

exports.notify_registration = function(email, username) {
  global.app.get('mail_server').send({
    text    : 'New user registered : email : ' + email + ' username : ' + username,
    from    : global.app.get('notif_email'),
    to      : global.app.get('notif_email'),
    subject : '✈ YaY ! New user registration : ' + username
  }, function(err, msg) {
    console.log(arguments);
  });
};

exports.new_user_notification = function(email, notification) {

  var text = notification.msg +
	' check on this url : ' +
	global.app.get('site_url') + '#' + notification.url;
  
  global.app.get('mail_server').send({
    text    : text,
    from    : global.app.get('smtp_from'),
    to      : email,
    subject : '✈ ' + global.app.get('title') + ' ✈ ' + notification.msg
  }, function(err, msg) {
    debug('Message sent to %s', email);
    debug(err || msg);
  });
};
