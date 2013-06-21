var UserModel = angular.module('User.model', []);

/**
 * @doc service
 * @id MCtrl:User
 * 
 * @description 
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
UserModel.factory('User', ['$rootScope', function($rootScope) {
  var User = {};

  var user = false;
  
  User.set = function(us) {
    user = us;
    $rootScope.$broadcast('user:logged', user);
  };

  User.isLogged = function() {
    return user;
  };

  User.get = function() {
    return user;
  };
  
  return User;
}]);

