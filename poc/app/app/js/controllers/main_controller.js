
var MCtrl = angular.module('MainController', []);

MCtrl.controller('NavbarCtrl', ['$scope', '$route', '$location', function($scope, $route, $location) {

  $scope.menuLeft = [];
  $scope.menuRight = [];

  for (key in $route.routes) {
    var route = $route.routes[key];

    if (angular.isDefined(route.menu)) {
      if (angular.isDefined(route.menu.right) && route.menu.right)  {
	$scope.menuRight.push({
	  title : route.menu.title,
	  href : '#' + key
	});
      }
      else {
	$scope.menuLeft.push({
	  title : route.menu.title,
	  href : '#' + key
	});
      }
    }
  }

  $scope.isActive = function(path) { return path.substring(1) == $location.path()};
}]);

MCtrl.controller('NopCtrl', [function() {}]);

/**
 * @doc controller
 * @id MCtrl:projectCtrl
 * 
 * @description 
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
MCtrl.controller('ProjectCtrl', ['$scope', '$location', 'User', 'Dropbox', 'FeedVar', function($scope, $location, User, Dropbox, FeedVar) {
  if (!User.isLogged())
    return $location.path('/');

  FeedVar.setMessage('Loading projects...');

  function get_proj() {
    Dropbox.getProjects(function(err, dt) {
      $scope.projects = dt;
      FeedVar.setMessage('Projects loaded');
      $scope.$apply();
    });
  };
  get_proj();

  $scope.deleteProject = function(project_name) {
    FeedVar.setMessage('Project ' + project_name + ' being deleted');
    Dropbox.deleteProject(project_name, function(err) {
      if (err) alert(err);
      FeedVar.setMessage('Project ' + project_name + ' has been deleted');
      get_proj();
    });
  };
  
  $scope.createNewProject = function() {
    var project_name = window.prompt("Name of the project","");
    FeedVar.setMessage('Creating new project');
    Dropbox.createProject(project_name, function(err, dt) {
      if (!err) {
        FeedVar.setMessage('Project ' + project_name + ' successfully inited');
        get_proj();
      }
      else
        FeedVar.setMessage('Error ' + err);
    });
  };
  return false;
}]);

/**
 * @doc controller
 * @id MCtrl:HomeCtrl
 * 
 * @description Main controller
 * @author Alexandre Strzelewicz
 */
MCtrl.controller('HomeCtrl', ['$scope', '$location', 'User', 'Dropbox', function($scope, $location, User, Dropbox) {
  $scope.User = User;

  Dropbox.isAuth(function(err, user) {
    if (user) {
      User.set(user);
      $location.path('/projects');
      $scope.$apply();
    }
  });
  
  $scope.authUser = function() {
    Dropbox.auth(function(err, user) {
      $location.path('/projects/');
      User.set(user);
    });
  };  
}]);

/**
 * @doc controller
 * @id MCtrl:EditCtrl
 * 
 * @description Controller for edition page
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
MCtrl.controller('EditCtrl', ['$scope', '$location', '$routeParams', 'User', 'Dropbox', 'FeedVar', function($scope, $location, $routeParams, User, Dropbox, FeedVar) {
  var project_name;
  
  $scope.project_name = project_name = $routeParams['project_name'];
  $scope.data = {};
  FeedVar.setMessage('Loading project ' + $scope.project_name);

  Dropbox.getContents($scope.project_name, function(err, dt) {
    FeedVar.setMessage('Contents loaded');
    $scope.contents = dt;
    $scope.$apply();
  });

  function main_update(content_type) {
    FeedVar.setMessage('Loading contents');
    $scope.edit_mode = false;

    $scope.content_schema   = {};
    $scope.current_contents = {};
    $scope.current_type     = null;
    
    Dropbox.getContentForType(project_name, content_type, function(err, cnts, schema) {
      FeedVar.setMessage('Content loaded');
      
      $scope.content_schema   = schema;
      $scope.current_type     = content_type;
      $scope.current_contents = cnts;
      $scope.$apply();
    });
  }

  if ($location.search().content)
    main_update($location.search().content);
    
  //
  // View functions
  //
  $scope.editContentType = function(content_type) {
    $location.search('content', content_type);
    main_update(content_type);
  };
  
  $scope.prepareNewContent = function(filename) {
    $scope.edit_mode = true;
    if (filename) {
      Dropbox.getContent(project_name,
                         $scope.current_type,
                         filename,
                         function(err, dt) {
                           $scope.edit_mode = true;
                           $scope.data = jsYaml.convert(dt);
                           $scope.filename = filename;
                         });
    }
  };

  $scope.createNewContent = function() {
    var filename = $scope.filename.indexOf('.yaml') >= 0 ? $scope.filename : $scope.filename + '.yaml';
    
    Dropbox.createFileForProject(project_name,
                                 $scope.current_type,
                                 filename,
                                 jsYaml.jsonToYaml($scope.data), function(err, dt) {
                                   main_update($scope.current_type);
                                   $scope.data = {};
                                 });
  };
  
  $scope.createNewContentType = function() {
    $location.path('/project/' + $scope.project_name + '/new_type');
  };
  
  return false;
}]);

/**
 * @doc controller
 * @id MCtrl:NewTypeCtrl
 * 
 * @description controller for type creation
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
MCtrl.controller('NewTypeCtrl', ['$scope', '$location', '$routeParams', 'User', 'Dropbox', function($scope, $location, $routeParams, User, Dropbox) {
  // if (!User.isLogged())
  //   return $location.path('/');
  
  $scope.project_name    = $routeParams['project_name'];

  $scope.type            = {};
  $scope.type.properties = {};

  $scope.types_available = ['text', 'content', 'date'];
  $scope.ntype           = {};
  $scope.ntype.type      = $scope.types_available[0];
  
  $scope.appendType = function() {
    $scope.type.properties[$scope.ntype.title] = angular.copy($scope.ntype);
    $scope.ntype = null;
  };

  $scope.createNewContentType = function() {
    Dropbox.createNewContentType($scope.project_name, $scope.type, function(err, dt) {
      if (err) return alert(err);
      $location.path('/project/' + $scope.project_name).search('content', $scope.type.title);
      return $scope.$apply();
    });
  };
}]);

/**
 * @doc service
 * @id MCtrl:User
 * 
 * @description 
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
MCtrl.factory('User', [function() {
  var User = {};

  var user = false;
  
  User.set = function(us) {
    user = us;
  };

  User.isLogged = function() {
    return user;
  };
  return User;
}]);
























/* global angular */

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

/**
 * @doc directive
 * @id Feedback:feedback
 * 
 * @description set a message at top
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
Feedback.directive('feedback', ['FeedVar', function(FeedVar) {

  var css = {
    '#feedback-popup' : {
      'position' : 'fixed',
      'bottom' : '0px',
      'left' : '0px',
      'height' : '30px',
      'width' : '200px',
      'background' : '#303030',
      'h3' : {
        'color' : 'white',
        'font-size' : '12px',
        'text-align' : 'center'
      }
    }
  };

  
  var feedback = {
    restrict : 'E',
    replace : true,
    template : '<div id="feedback-popup" class="{{message.level}}" ng-show="message.msg.length > 0">' +
      '<h3>{{message.msg}}</h3>' +
      '</div>'
  };

  var timeout;
  
  feedback.controller = ['$scope', function($scope, el, attrs) {

    $scope.$watch(function() {
      return FeedVar.getMessage();
    }, function(aft, bef) {
      if (aft == bef) return;
      
      clearTimeout(timeout);
      $scope.message = aft;

      Jss.apply(css);
      
      timeout = setTimeout(function() {
        $scope.message = '';
        $scope.$apply();
      }, 3000);
    });
    
    // console.log(JSON.stringify(css)
    //             .replace(/"/g, '')
    //             .replace(/,/g, ';\n'));
    // var input =
    //       ['div',{ id: 'feedback-group', class: '{{message.level}}' },
    //        ['h3', '{{message.msg}}']           
    //       ];
    // var actual = JsonML.toXMLText(input);
    // console.log(actual);
    
    Jss.apply(css);
  }];
  
  feedback.link = function(scope, el, attrs) {
  };
  
  return feedback;
}]);
