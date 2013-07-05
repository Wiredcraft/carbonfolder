
// DEBUG
DEBUG = false;
if (window.location.host.indexOf('localhost') > -1)
  DEBUG = true;

var DCMS = angular.module('DCMS', ['MainController',
                                   'DropboxWrapper',
                                   'Feedback',
                                   'Filters',
                                   'Services',
                                   'User.model',
                                   'MoleskineModule',
                                   'LocalStorageModule',
                                   'PhotoshopModule']);

DCMS.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl : 'templates/posts.html',
      controller : 'ProjectCtrl'
    })
    .when('/404', {
      templateUrl : 'templates/404.html',
      controller : 'NopCtrl'
    })
    .when('/login', {
      templateUrl : 'templates/login.html',
      controller : 'LoginCtrl'
    })
    .when('/medias', {
      templateUrl : 'templates/medias.html',
      controller : 'MediaCtrl'
    })
    .when('/pusher', {
      templateUrl : 'templates/pusher.html',
      controller : 'PusherCtrl'
    })
    .when('/types', {
      templateUrl : 'templates/types.html',
      controller : 'TypesCtrl'
    })
    .otherwise({
      redirectTo : '/404'
    });
}]);

DCMS.run(['$log', '$location', 'Dropbox', 'User', function($log, $location, Dropbox, User) {
  // Disable all log when production
  if (!DEBUG) {
    // Can be forwarded to Logman
    $log.log = function(arguments) {};
    $log.error = function(arguments) {};
    $log.info = function(arguments) {};
    $log.warn = function(arguments) {};
  }

  Dropbox.isAuth(function(err, user) {    
    User.set(user);
    Orion.emit('user', user);
    if (!user)
      $location.path('/login');
  });

  $log.log('Init app');
}]);

