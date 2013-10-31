
var MCtrl = angular.module('MainController', []);

MCtrl.controller('NavbarCtrl', ['$scope', '$route', '$location', 'Context', function($scope, $route, $location, Context) {
  $scope.isActive = function(path) { return path.substring(1) == $location.path() };

  $scope.debugMe = function() {
    console.log(Context);
  };

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

  $scope.logUser = function() {
    console.log($rootScope.User)
  };

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
MCtrl.controller('LoginCtrl', ['$scope', 'Dropbox', 'User', '$location', function($scope, Dropbox, User, $location) {
  $scope.authUser = function() {
    Dropbox.auth(function(err, user) {
      User.set(user);
    });
  };

  $scope.logout = function() {
    User.out();
    $location.path('/');
  };
}]);

/**
 * @doc controller
 * @id MCtrl:PusherCtrl
 * @view pusher.ejs
 * @description Push to platforms
 * @author Alexandre Strzelewicz <as@unitech.io>
 */
MCtrl.controller('PusherCtrl', ['$scope', '$location', '$http', 'Context', function($scope, $location, $http, Context) {

  var github;
  var userDt;

  // $scope.branches = ['sadasd', 'hey', 'ho'];
  // $scope.s_branch = $scope.ptain[0];

  $scope.oauthGithub = function() {
    // window.location = "https://github.com/login/oauth/authorize?client_id=0a513d7bdf8ea03fc020&scope=user,public_repo,repo,repo:status,gist";
    window.location = "https://github.com/login/oauth/authorize?client_id=caecba3f7f5afc975313&scope=user,public_repo,repo,repo:status,gist";
  };

  $scope.getRepoInfos = function(repoStruct) {
    if (repoStruct.branches) return;
    var repo = github.getRepo(userDt.login, repoStruct.name);

    repoStruct.branch_selected = {};
    repoStruct.branches = [];

    repo.listBranches(function(err, branches) {
      repoStruct.branches = branches;
      repoStruct.branch_selected = branches[0];
      console.log(repoStruct, branches);
      $scope.$apply();
    });

  };

  $scope.pushContent = function(repoStruct) {
    var repo = github.getRepo(userDt.login, repoStruct.name);

    function transposate_context(tree) {
      var ret = [];

      Object.keys(tree).forEach(function(key) {
        var b_path = key;

        tree[key].contents.forEach(function(cnt) {
          ret.push({
            content : jsYaml.jsonToYaml(cnt.data),
            filepath : '_posts' + '/' + b_path + '/' + '2012-12-23-' + cnt.filename.replace(/ /g, '-')
          });
        });
      });
      return ret;
    }

    var new_tree = transposate_context(Context.types);

    console.log(new_tree);
    //new_tree.forEach(function(file) {

    function fin() {
      console.log('end');
    }

    (function ex(new_tree) {
      if (!new_tree[0]) return fin();
      var file = new_tree[0];
      repo.write(repoStruct.branch_selected,
                 file.filepath,
                 file.content,
                 'Writing ' + file.filepath, function(err) {
                   console.log(arguments);
                   new_tree.shift();
                   ex(new_tree);
                 });
      return false;
    })(new_tree);
  };

  function logGithub(token) {
    github = new Github({
      token: token,
      auth: "oauth"
    });

    var user = github.getUser();

    user.me(function(err, data) {
      userDt = data;
      console.log(userDt);
    });

    user.repos(function(err, repos) {
      $scope.repositories = repos;
      $scope.$apply();
    });
  }

  if (window.location.href.match(/\?code=(.*)/)) {
    var code = window.location.href.match(/\?code=(.*)/)[1].replace('#/pusher', '');
    if (code){
      $http({method : 'GET', url : 'http://localhost:9998/authenticate/' + code})
      .success(function(data) {
        console.log(data.token);
        logGithub(data.token);
      }).error(function(e) {
        alert(e);
      });
    }
  }

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
    $scope.showTypes                      = false;
    $scope.static_content = '';
  };

  $scope.add = baseType;

  $scope.editMode = function(content) {
    Context.current_content = content;
    Context.current_content.temp = Context.current_content.data['__content'];
  };

  $scope.remove = function() {
    var filepath = Context.current_project + '/content/' + Context.current_content.meta.type + '/' + Context.current_content.meta.filename;
    console.log(filepath);
    Dropbox.remove(filepath, function(err, data) {
      if (err) alert(err);
      Orion.emit('end', 'File deleted');
      Context.refreshProjectContext(Context.current_project, true, function() {
        Context.current_content = null;
        $scope.$apply();
      });
    });
  };

  $scope.submit = function() {
    var yaml_content = jsYaml.jsonToYaml(Context.current_content.data);

    Orion.emit('loading', 'Creating file');

    //Context.current_content.meta.type
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
MCtrl.controller('MediaCtrl', ['$scope', 'User', 'Dropbox', 'Context', 'PhotoshopService', function($scope, User, Dropbox, Context, PhotoshopService) {

  $scope.Context = Context;

  $scope.add = function() {
    Context.current_type = {};
    Context.current_type.name = 'New type';
  };

  $scope.editMode = function(content) {
    // console.log(content)
    // PhotoshopService.rawToB64(content.data, function(data) {
      // TO DO, NOT WORKING
      // console.log(data);
      // window.open('data:img/png;base64,'+data);
    // });
  };

  var imgG;

  $scope.saveImg = function(mt, dt) {
    Dropbox.writeFile(Context.current_project + '/media/' + mt, dt, function() {
      Orion.emit('end', 'File saved');
      Context.refreshProjectContext(Context.current_project, true, function() {
        // Context.current_content = null;
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
MCtrl.controller('TypesCtrl', ['$scope', 'User', 'Dropbox', 'Context', function($scope, User, Dropbox, Context) {

  $scope.Context       = Context;
  Context.current_type = null;

  function baseType() {
    Context.current_type                   = {};
    Context.current_type.isNew             = true;
    Context.current_type.name              = 'New type';
    Context.current_type.schema            = {};
    Context.current_type.schema.properties = {};
    Context.current_type.schema.properties = {
      date : {
        title : 'Date',
        type : 'date'
      }
    };
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

  $scope.remove = function() {
    // This will also delete all files in ProjectName/content/Context.current_type.name
    var safe = prompt('This will remove the type: ' + Context.current_type.name + ' and all files associated with this type. To continue enter "' + Context.current_type.name + '" This cannot be undone.' );
    if ( safe === Context.current_type.name) {
      var filepath = Context.current_project + '/settings/' + Context.current_type.name + '.json';
      var contentFolder = Context.current_project + '/content/' + Context.current_type.name;
      Dropbox.remove(filepath, function(err, data) {
        if (err) alert(err);
        Dropbox.remove(contentFolder, function(err, data) {
          if (err) alert(err);

          Orion.emit('end', 'Type deleted');
          Context.refreshProjectContext(Context.current_project, true, function() {
            Context.current_type = null;
            $scope.$apply();
          });

        });
      });
    }
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
