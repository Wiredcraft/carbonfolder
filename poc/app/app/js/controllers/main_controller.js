
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

  $scope.isActive = function(path) { return path.substring(1) == $location.path()}
}]);

MCtrl.controller('NopCtrl', [function() {}]);


function Drop() {
  var client = new Dropbox.Client({
    key: "enUl0TEyLBA=|E+8WzchmLrRweHBIJ09QGShKc+ssHEqYXxZgSOV3yg==", sandbox: true
  });

  client.authDriver(new Dropbox.Drivers.Redirect());
  
  client.authenticate({interactive: false}, function(error, client) {
    if (error) {
      return handleError(error);
    }
    if (client.isAuthenticated()) {
      client.readdir('/', function() {
        console.log(arguments);
      });
      client.writeFile("test.json", "{'sucess':'true'}", function(error, stat) {
        if (error) {
          console.log(error);
          return showError(error);  // Something went wrong.
        }
        
        alert("File saved as revision " + stat.revisionTag);
      });

      client.makeUrl('/test.json', {
        download : true
      } ,function() {
        console.log(arguments);
      });

      client.mkdir('content', function() {});
      client.mkdir('content/posts', function() {});
      client.mkdir('content/pages', function() {});
      client.mkdir('content/news', function() {});
      client.mkdir('media', function() {});
      client.mkdir('settings', function() {});
      client.stat('content', function(err, stat) {
        console.log(stat);
      });
      // Cached credentials are available, make Dropbox API calls.
    } else {
      client.authenticate(function(error, client) {
        if (error) {
          return handleError(error);
        }
        alert('User logged');
        return false;
      });
    }
  });

}

/**
 * @doc controller
 * @id MCtrl:HomeCtrl
 * 
 * @description Main controller
 * @author Alexandre Strzelewicz
 */
MCtrl.controller('HomeCtrl', ['$scope', '$location', function($scope, $location) {

  Drop();
  //$scope.jsonSchema;
  // = {
  //   "title": "Post",
  //   "type": "object",
  //   "properties": {
  //     "title": {
  //       "type": "text",
  //       "required" : true
  //     },
  //     "date": {
  //       "type": "date"
  //     }
  //   }
  // };

  $scope.yamlFront = '---\n' +
    'title: yeey\n' +
    'url : "/asdas"\n' + 
    'date : "2013-06-04"\n' +
    '---\n' +
    '# Hey \n' +
    '**BOLD**\n';


  $scope.$watch('rawJsonSchema', function(aft, bef) {
    try {
      if (aft)
        $scope.jsonSchema = JSON.parse(aft);
      $scope.jsonError = '';
    } catch(e) {
      $scope.jsonError = 'Not valid json error : <br/><br/>' + e;
    }
  });

  $scope.$watch('yamlFront', function(aft, bef) {    
    $scope.data = jsYaml.convert($scope.yamlFront);
  });

  
}]);


// "time" : {
//   "type" : "time"
// },
// "url" : {
//   "type" : "url"
// },
// "tags":{
//   "type": "text"
// 
