
// DEBUG
if (window.location.host.indexOf('localhost') > -1)
  DEBUG = true;

var DCMS = angular.module('DCMS', ['MainController', 'DropboxWrapper', 'Feedback', 'Filters']);

DCMS.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl : 'templates/home.html',
      controller : 'HomeCtrl'
    })
    .when('/projects', {
      templateUrl : 'templates/project.html',
      controller : 'ProjectCtrl',
      menu : {
	title : 'Projects',
	left : true
      }
    })
    .when('/project/:project_name', {
      templateUrl : 'templates/edit.html',
      controller : 'EditCtrl',
      reloadOnSearch : false
    })
    .when('/project/:project_name/new_type', {
      templateUrl : 'templates/new_type.html',
      controller : 'NewTypeCtrl'
    })
    // .when('/project/:project_name/:content_type', {
    //   templateUrl : 'templates/edit_type.html',
    //   controller : 'NewTypeCtrl'
    // })
    .when('/foundation4', {
      templateUrl : 'templates/foundation4.html',
      controller : 'NopCtrl',
      menu : {
	title : 'Foundation 4',
	right : true
      }
    })
    .otherwise({
      redirectTo : '/404'
    });
}]);

DCMS.run(['$log', 'Dropbox', 'User', function($log, Dropbox, User) {
  // Disable all log when production
  if (!DEBUG) {
    // Can be forwarded to Logman
    $log.log = function(arguments) {};
    $log.error = function(arguments) {};
    $log.info = function(arguments) {};
    $log.warn = function(arguments) {};
  }
  Dropbox.isAuth(function(err, user) {
    console.log(user);
    if (user) {
      User.set(user);
    }
  });

  $log.log('Init app');
}]);

