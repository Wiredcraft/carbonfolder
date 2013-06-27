
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
    $scope.static_content = angular.copy(Context.current_content.data['__content']);
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


  //returns a function that calculates lanczos weight
  function lanczosCreate(lobes){
    return function(x){
      if (x > lobes)
        return 0;
      x *= Math.PI;
      if (Math.abs(x) < 1e-16)
        return 1
      var xx = x / lobes;
      return Math.sin(x) * Math.sin(xx) / x / xx;
    }
  }

  //elem: canvas element, img: image element, sx: scaled width, lobes: kernel radius
  function thumbnailer(elem, img, sx, lobes, cb){
    this.cb = cb;
    this.canvas = elem;
    elem.width = img.width;
    elem.height = img.height;
    elem.style.display = "none";
    this.ctx = elem.getContext("2d");
    this.ctx.drawImage(img, 0, 0);
    this.img = img;
    this.src = this.ctx.getImageData(0, 0, img.width, img.height);
    this.dest = {
      width: sx,
      height: Math.round(img.height * sx / img.width),
    };
    this.dest.data = new Array(this.dest.width * this.dest.height * 3);
    this.lanczos = lanczosCreate(lobes);
    this.ratio = img.width / sx;
    this.rcp_ratio = 2 / this.ratio;
    this.range2 = Math.ceil(this.ratio * lobes / 2);
    this.cacheLanc = {};
    this.center = {};
    this.icenter = {};
    setTimeout(this.process1, 0, this, 0);
  }
  
  thumbnailer.prototype.process1 = function(self, u){
    self.center.x = (u + 0.5) * self.ratio;
    self.icenter.x = Math.floor(self.center.x);
    for (var v = 0; v < self.dest.height; v++) {
      self.center.y = (v + 0.5) * self.ratio;
      self.icenter.y = Math.floor(self.center.y);
      var a, r, g, b;
      a = r = g = b = 0;
      for (var i = self.icenter.x - self.range2; i <= self.icenter.x + self.range2; i++) {
        if (i < 0 || i >= self.src.width)
          continue;
        var f_x = Math.floor(1000 * Math.abs(i - self.center.x));
        if (!self.cacheLanc[f_x])
          self.cacheLanc[f_x] = {};
        for (var j = self.icenter.y - self.range2; j <= self.icenter.y + self.range2; j++) {
          if (j < 0 || j >= self.src.height)
            continue;
          var f_y = Math.floor(1000 * Math.abs(j - self.center.y));
          if (self.cacheLanc[f_x][f_y] == undefined)
            self.cacheLanc[f_x][f_y] = self.lanczos(Math.sqrt(Math.pow(f_x * self.rcp_ratio, 2) + Math.pow(f_y * self.rcp_ratio, 2)) / 1000);
          weight = self.cacheLanc[f_x][f_y];
          if (weight > 0) {
            var idx = (j * self.src.width + i) * 4;
            a += weight;
            r += weight * self.src.data[idx];
            g += weight * self.src.data[idx + 1];
            b += weight * self.src.data[idx + 2];
          }
        }
      }
      var idx = (v * self.dest.width + u) * 3;
      self.dest.data[idx] = r / a;
      self.dest.data[idx + 1] = g / a;
      self.dest.data[idx + 2] = b / a;
    }

    if (++u < self.dest.width)
      setTimeout(self.process1, 0, self, u);
    else
      setTimeout(self.process2, 0, self);
  };
  thumbnailer.prototype.process2 = function(self){
    self.canvas.width = self.dest.width;
    self.canvas.height = self.dest.height;
    self.ctx.drawImage(self.img, 0, 0);
    self.src = self.ctx.getImageData(0, 0, self.dest.width, self.dest.height);
    var idx, idx2;
    for (var i = 0; i < self.dest.width; i++) {
      for (var j = 0; j < self.dest.height; j++) {
        idx = (j * self.dest.width + i) * 3;
        idx2 = (j * self.dest.width + i) * 4;
        self.src.data[idx2] = self.dest.data[idx];
        self.src.data[idx2 + 1] = self.dest.data[idx + 1];
        self.src.data[idx2 + 2] = self.dest.data[idx + 2];        
      }
    }
    self.ctx.putImageData(self.src, 0, 0);
    self.canvas.style.display = "block";
    self.cb(self.src, self.canvas);
  }
  
  var handleImage = function(e) {
    var reader = new FileReader();
    reader.onload = function(event){
      var img = new Image();
      img.onload = function(){
        // canvas.width = img.width;
        // canvas.height = img.height;
        //ctx.drawImage(img,0,0);
        new thumbnailer(canvas, img, 188, 3, function(imageData, canvas) {
          console.log(arguments);
          console.log();
          Dropbox.writeFile('test.jpg', canvas.toDataURL('image/jpg').replace(/^data:image\/(png|jpg);base64,/, ""), function() {console.log('ddd')});
        });
        //new thumbnailer(canvas2, img, 400, 3);
        canvas.toDataURL();
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  };

  var imageLoader = document.getElementById('imageLoader');
  imageLoader.addEventListener('change', handleImage, false);
  var canvas = document.getElementById('imageCanvas');
  var canvas2 = document.getElementById('imageCanvas2');
  var ctx = canvas.getContext('2d');

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
