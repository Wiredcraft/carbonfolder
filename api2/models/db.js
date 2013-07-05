
var mongoose = require('mongoose');
var debug = require('debug')('init:db');

module.exports = function(app) {
  var mongoDB = mongoose.connection;
  
  debug('Connecting to database ' + app.get('mongo_database'));
  mongoose.connect('mongodb://localhost/' + app.get('mongo_database'));

  mongoose.set('debug', app.get('debug'));
  
  mongoDB.on('error', function cb() {
    debug('Error when connecting to db');
  });
  
  mongoDB.once('open', function cb() {
    debug('Successfully connected to database ' + app.get('mongo_database'));
  });
  
  return mongoDB;
};

