/* global angular */

/**
 * @doc module
 * @id DropboxWrapper
 * @description DropboxWrapper
 *
 * @author Alexandre Strzelewicz <as@unitech.io>
 */

var DropboxWrapper = angular.module('DropboxWrapper', []);

DropboxWrapper.constant('version', '0.1');

DropboxWrapper.config(function() { 
});

DropboxWrapper.run(function() { 
});

/**
 * @doc module
 * @id DropboxWrapper:DropboxWrapper
 
 * @description dropbox module
 */
DropboxWrapper.service('Dropbox', ['$q', '$log', function($q, $log) {

  var self = this;
  
  var key = "enUl0TEyLBA=|E+8WzchmLrRweHBIJ09QGShKc+ssHEqYXxZgSOV3yg==";
  var client = new Dropbox.Client({
    key: key, sandbox: true
  });
  
  client.authDriver(new Dropbox.Drivers.Redirect({
    rememberUser : true
  }));

  /**
   * @method auth
   * @description auth user
   */
  this.isAuth = function(cb) {
    client.authenticate({ interactive: false }, function(err, client) {
      if (err) return alert(err);

      if (client.isAuthenticated()) {
        client.getUserInfo(function(err, user) {
          return cb(null, user);
        });
      }
      else {
        return cb(null, null);
      }     
      return false;
    });
  };

  /**
   * @method auth
   * @description log user to dropbox
   */
  this.auth = function(cb) {
    client.authenticate(function(error, client) {
      if (error) return cb(error);
      return cb(null, client);
    });
  };


  /**
   * @method writeFile
   * @description writefile to dropbox
   * // @return stat.revisionTag
   */
  this.writeFile = function(filename, data, cb) {
    client.writeFile(filename, data, function(err, stat) {
      if (err) return alert(err);
      return cb(null, stat);
    });
  };

  /**
   * @method getProjects
   * @description get projects (folder in the main folder
   */
  this.getProjects = function(cb) {
    client.readdir('/', function(err, dt) {
      if (err) return cb(err, null);
      return cb(null, dt);
    });
  };

  this.getAllContents = function(project_name, cb) {
    var self          = this;
    var dt            = {};
    var bulk_content  = [];
    
    this.getTypes(project_name, function(err, types) {

      // !!! TODO
      // To change by async for parallel queries
      // !!! TODO
      (function ex(types) {
        if (types[0] == null) return cb(null, dt, bulk_content);
        Orion.emit('loading', 'Fetching contents /' + project_name + '/' + types[0]);
        self.getContentForType(project_name, types[0], function(err, cnts, schema) {

          dt[types[0]] = {
            name     : types[0],
            schema   : schema,
            contents : []
          };

          (function ex2(cnts) {
            if (cnts[0] == null) { types.shift(); return ex(types); }

            Orion.emit('loading', 'Fetching ' + project_name + '/' + types[0] + '/' + cnts[0]);
            
            self.getContent(project_name, types[0], cnts[0], function(err, yaml) {
              $log.log('Fetched');

              var data = jsYaml.convert(yaml);
              // Fix date formating
              if (data.date)
                data.date = moment(data.date.toString()).format("YYYY-MM-DD");

              dt[types[0]].contents.push({
                filename  : cnts[0],
                data : data
              });
              
              bulk_content.push({
                meta : {
                  filename  : cnts[0],
                  schema    : schema,
                  type      : types[0]
                },
                data : data
              });
              
              cnts.shift();
              return ex2(cnts);
            });
            return false;
          })(cnts);
          
        });
        return false;
      })(types);
      
    });
  };
  
  /**
   * @method getContentForType
   * @description get content listing and schema for 
   *              a specified content type and project name
   */
  this.getContentForType = function(project_name, content_type, cb) {
    var content_path = project_name.concat('/content/', content_type);
    var schema_path  = project_name.concat('/settings/', content_type, '.json');
    
    client.readdir(content_path, function(err, contents) {
      if (err) { console.error(err); return cb(err); }
      
      client.readFile(schema_path, function(err, schema) {
        if (err) { console.error(err); return cb(err); }
        
        return cb(null, contents, JSON.parse(schema));
      });
      return false;
    });
  };

  /**
   * @method getContent
   * @description get yaml content
   */
  this.getContent = function(project_name, content_type, filename, cb) {
    var content_path = project_name.concat('/content/', content_type, '/', filename);
    client.readFile(content_path, function(err, content) {
      if (err) { console.error(err); return cb(err); }
      
      return cb(null, content);
    });
  };

  /**
   * @method createFileForProject
   * @description create file depending of project name and content type
   */
  this.createFileForProject = function(project_name, content_type, title, data, cb) {
    var filename = title;
    var filepath = project_name.concat('/content/', content_type, '/', filename);
    console.log(filepath, data);
    client.writeFile(filepath, data, function(err, stat) {
      if (err) return alert(err);
      return cb(null, stat);
    });
  };

  /**
   * @method deleteProject
   * @description delete project
   */
  this.deleteProject = function(project_name, cb) {
    if (!project_name || project_name.length == 0)
      return cb({msg : 'Project name undefined'});
    
    client.remove(project_name, function(err, dt) {
      return cb(err, dt);
    });
    return false;
  };

  /**
   * @method getContents
   * @description get content for a specified project
   */
  this.getTypes = function(project_name, cb) {
    client.readdir(project_name + '/content', function(err, dt) {
      if (err) return cb(err, null);
      return cb(null, dt);
    });
  };

  /**
   * @method createNewContentType
   * @description create a new content type
   */
  this.createNewContentType = function(project_name, type_description, cb) {
    var content_type_name = type_description.name;

    // Create folder in content
    client.mkdir(project_name + '/content/' + content_type_name, function(err, dt) {
      if (err) { console.error(err); return cb(err); }

      var filename = content_type_name.concat('.json');
      // Create schemca in settings
      client.writeFile(project_name + '/settings/' + filename,
                       angular.toJson(angular.fromJson(type_description.schema)), function(err, stat) {
        if (err) { console.error(err); return cb(err); }
        return cb(null, stat);
      });
      return false;
    });
  };

  this.updateContentType = function(project_name, type_description, cb) {
    var content_type_name = type_description.name;
    var filename = content_type_name.concat('.json');
    // Create schemca in settings
    client.writeFile(project_name + '/settings/' + filename,
                     angular.toJson(angular.fromJson(type_description.schema)), function(err, stat) {
                       if (err) { console.error(err); return cb(err); }
                       return cb(null, stat);
                     });
  };
  
  /**
   * @method createProject
   * @description create new project folder
   */
  this.createProject = function(project_name, cb) {
    if (!project_name || project_name.length == 0)
      return cb({msg : 'Project name undefined'});
    
    client.mkdir(project_name + '/', function(err, dt) {
      if (err) return cb(err);
      self.createFolders(project_name, function(err, dt) {
        if (err) return cb(err);
        return cb(null, dt);
      });
      return false;
    });
    return false;
  };

  /**
   * createFolders
   * @description at init create the right folders
   */
  this.createFolders = function(project, cb) {
    var prefix = '';

    if (!project)
      return cb({msg: 'no projet defined'});
    
    project = project.concat('/');

    client.mkdir(project + 'content', function() {});
    // client.mkdir(project + 'content/posts', function() {});
    // client.mkdir(project + 'content/pages', function() {});
    // client.mkdir(project + 'content/news', function() {});
    client.mkdir(project + 'media', function() {});
    client.mkdir(project + 'settings', function() {});
    return cb(null, {});
  };
  
}]);

// client.stat('content', function(err, stat) {
//   console.log(stat);
// });  

// client.readdir('/', function() {
//   console.log(arguments);
// });

// client.makeUrl('/test.json', {
//   download : true
// } ,function() {
//   console.log(arguments);
// });
