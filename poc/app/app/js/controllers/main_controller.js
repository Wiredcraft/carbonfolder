
var MCtrl = angular.module('MainController', []);

MCtrl.controller('NavbarCtrl', ['$scope', '$route', '$location', function($scope, $route, $location) {
  $scope.isActive = function(path) { return path.substring(1) == $location.path() };
}]);

MCtrl.controller('NopCtrl', [function() {}]);

/**
 * @doc controller
 * @id MCtrl:MainCtrl
 * @view global
 * @description controller which encapsulates everything
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
MCtrl.controller('MainCtrl', ['$scope', '$rootScope', 'User', 'Dropbox', 'Context', 'localStorageService', function($scope, $rootScope, User, Dropbox, Context, localStorageService) {
  
  $rootScope.User = User;
  $rootScope.Context = Context;

  Orion.emit('loading', 'Loading projects');

  // Get project once the user is logged
  $scope.$on('user:logged', function() {    
    Context.refreshProjects(function(err) {
      Orion.emit('end', 'Projects loaded');
      $scope.$apply();
    });    
  });

  $scope.refreshProject = function() {
    Context.refreshProjectContext(Context.current_project, true, function() {
      $rootScope.$apply();
    });
  };

  // $scope.objectLength = function(object) {
  //   console.log(object);
  //   if (!object) return 0;
  //   return Object.keys(object).length;
  // };
  
  $scope.deleteProject = function() {
    Orion.emit('loading', 'Project ' + Context.current_project + ' being deleted');
    
    Dropbox.deleteProject(Context.current_project, function(err) {
      if (err) alert(err);
      Orion.emit('end', 'Project ' + Context.current_project + ' has been deleted');
      
      Context.refreshProjects(function(err) {
        Orion.emit('info', 'Projects refreshed');
        $scope.$apply();
      });
    });
  };
  
  $scope.createNewProject = function() {
    var project_name = window.prompt("Name of the project","");

    Orion.emit('loading', 'Creating project');
    
    Dropbox.createProject(project_name, function(err, dt) {
      if (!err) {
        Orion.emit('end', 'Project ' + project_name + ' successfully inited');
        
        Context.refreshProjects(function(err) {
          Orion.emit('end', 'Projects refreshed');
          
          $scope.$apply();
        });
      }
      else
        Orion.emit('error', 'Projects refreshed');
    });
  };

  // When other project selected
  // populate Context with types
  $scope.$watch('Context.current_project', function(aft, bef) {
    if (bef == aft) return;

    Context.refreshProjectContext(aft, function(err) {
      $rootScope.$apply();
    });

  });
  
}]);

/**
 * @doc controller
 * @id MCtrl:LoginCtrl
 * @view login.ejs
 * @description Dropbox Login page 
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
MCtrl.controller('LoginCtrl', ['$scope', 'Dropbox', 'User', function($scope, Dropbox, User) {
  $scope.authUser = function() {
    Dropbox.auth(function(err, user) {
      User.set(user);
    });
  };
}]);


/**
 * @doc controller
 * @id MCtrl:projectCtrl
 * 
 * @description 
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
MCtrl.controller('ProjectCtrl', ['$scope', '$location', 'User', 'Dropbox', 'Context', function($scope, $location, User, Dropbox, Context) {
  $scope.Context          = Context;
  Context.current_content = null;
  
  function baseType(content_type) {
    Context.current_content               = {};
    Context.current_content.meta          = {};    
    Context.current_content.meta.filename = 'New content';
    Context.current_content.meta.schema   = content_type.schema;
    Context.current_content.meta.type     = content_type.name;
    Context.current_content.data          = {};
    $scope.addPopover                     = false;
  };
  
  $scope.add = baseType;
  
  $scope.editMode = function(content) {   
    Context.current_content = content;
  };
  
  $scope.submit = function() {
    var yaml_content = jsYaml.jsonToYaml(Context.current_content.data);

    Orion.emit('loading', 'Creating file');
    
    Dropbox.createFileForProject(Context.current_project,
                                 Context.current_content.meta.type,
                                 Context.current_content.meta.filename,
                                 yaml_content, function(err, dt) {                                   
                                   if (err) alert(err);
                                   Orion.emit('end', 'File created/updated');
                                   Context.refreshProjectContext(Context.current_project, true, function() {
                                     $scope.$apply();
                                   });
                                 });
  };

}]);

/**
 * @doc controller
 * @id MCtrl:NewTypeCtrl
 * 
 * @description controller for type creation
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
MCtrl.controller('MediaCtrl', ['$scope', 'User', 'Dropbox', 'Context', function($scope, User, Dropbox, Context) {
  
  $scope.Context = Context;

  $scope.add = function() {
    Context.current_type = {};
    Context.current_type.name = 'New type';
  };
  
  $scope.editMode = function(type) {
    Context.current_type = type;
  };

}]);

/**
 * @doc controller
 * @id MCtrl:NewTypeCtrl
 * 
 * @description controller for type creation
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
MCtrl.controller('TypesCtrl', ['$scope', 'User', 'Dropbox', 'Context', function($scope, User, Dropbox, Context) {
  
  $scope.Context       = Context;
  Context.current_type = null;
  
  function baseType() {
    Context.current_type                   = {};
    Context.current_type.isNew             = true;
    Context.current_type.name              = 'New type';
    Context.current_type.schema            = {};
    Context.current_type.schema.properties = {};
  };
  
  $scope.add = baseType;

  //baseType();

  $scope.keyNumbers = function(object) { return Object.keys(object).length; };
  
  $scope.editMode = function(type) {
    Context.current_type = type;
  };

  $scope.types_available = ['text', 'content', 'date'];

  // Temp type when adding field
  $scope.ntype           = {};
  $scope.ntype.type      = $scope.types_available[0];
    
  $scope.appendField = function() {
    Context.current_type.schema.properties[$scope.ntype.title] = angular.copy($scope.ntype);
    $scope.ntype.title = '';
  };

  $scope.deleteField = function(field) {
    delete Context.current_type.schema.properties[field.title];
  };
  
  $scope.createNewContentType = function() {
    Orion.emit('loading', 'Creating/Updating content type');

    if (Context.current_type.isNew == true) {
      Dropbox.createNewContentType(Context.current_project, Context.current_type, function(err, dt) {
        if (err) return alert(err);
        Context.refreshProjectContext(Context.current_project, true, function() {
          $scope.$apply();
        });
        Orion.emit('end', 'Created');
        return $scope.$apply();
      });
    } else {
      Dropbox.updateContentType(Context.current_project, Context.current_type, function(err, dt) {
        if (err) return alert(err);
        Context.refreshProjectContext(Context.current_project, true, function() {
          $scope.$apply();
        });
        Orion.emit('end', 'Updated');
        return $scope.$apply();
      });
    }
  };
}]);
