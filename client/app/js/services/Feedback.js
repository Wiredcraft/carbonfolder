/**
 * @doc module
 * @id Feedback
 * @description Feedback
 *
 * @author Alexandre Strzelewicz <as@unitech.io>
 */

var Feedback = angular.module('Feedback', []);

Feedback.constant('version', '0.1');

/**
 * @doc module
 * @id Mctrl:serviceName
 
 * @description 
 */
Feedback.service('FeedVar', ['$http', function($http) {
  /**
   * @method setMessage
   * @description 
   */
  this.setMessage = function(level, msg) {
    if (msg === undefined) {
      msg = level;
      level = 'info';
    }
    
    this.msg = { level : level,
                 msg : msg };    
  };

  this.getMessage = function() {
    return this.msg;
  };
}]);


var Orion = {};

Orion.emit = function(level, msg) {
  console.log('[%s] %s', level, msg);
};


/**
 * @doc directive
 * @id Feedback:feedback
 * 
 * @description set a message at top
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
Feedback.directive('feedback', [function() {
  
  var feedback = {
    restrict : 'E',
    replace : true,
    template : '<div id="feedback-popup" class="{{level}}" ng-show="msg.length > 0">' +
      '{{msg}}' +
      '</div>'
  };

  var timeout;

  
  feedback.controller = ['$scope', function($scope) {

    Orion.emit = function(level, msg) {
      var phase = $scope.$root.$$phase;
      
      $scope.level = level;
      $scope.msg = msg;
      if (phase == '$apply' || phase == '$digest') {
      } else {
        $scope.$apply();
      }

      if (level == 'loading') {
        clearTimeout(timeout);
      }
      if (level == 'end') {
          timeout = setTimeout(function() {
            $scope.msg = '';
            $scope.$apply();
          }, 3000);
      }
    };
    
    // Orion.subscribe('log', function(msg) {
    //   console.log(msg);
    //   clearTimeout(timeout);
    //   $scope.message = aft;
      
    //   timeout = setTimeout(function() {
    //     $scope.message = '';
    //     $scope.$apply();
    //   }, 3000);
    // });
    
  }];
  
  feedback.link = function(scope, el, attrs) {
  };
  
  return feedback;
}]);
