
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-jade');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-template-html');
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    compass : {
      dev: {
	options: {
	  sassDir: 'scss',
	  cssDir: 'app/css'
	}
      }
    },
    template: {
      dev: {
        engine: 'ejs',
        cwd: 'ejs/',
        data: 'locals.json',
        options: {
        },
        files: [{
          expand: true,     // Enable dynamic expansion.
          cwd: 'ejs/',      // Src matches are relative to this path.
          src: '**/*.ejs', // Actual pattern(s) to match.
          dest: 'app/',   // Destination path prefix.
          ext: '.html'  // Dest filepaths will have this extension.
        }]
      }
    },
    // jade: {
    //   html: {
    // 	src: ['jade/**/*.jade'],
    // 	dest: 'app/',
    //     options : {
    //       client : false,
    //       basePath : 'jade/',
    //       locals : grunt.file.readJSON('locals.json')
    //     }
    //   }
    // },
    connect: {
      server: {
	options: {
	  port: 9001,
	  base: 'app'
	}
      }
    },
    watch: {
      // jade : {
      //   files: ['jade/**/*.jade', 'locals.json'],
      //   tasks: ['jade']
      // },
      template : {
        files : ['ejs/**/*.ejs'],
        tasks : ['template']
      },
      scss : {
	files: ['scss/**/*.scss'],
	tasks: ['compass:dev']
      }
    }
  });

  grunt.registerTask('default', [
    'template',
    'compass:dev',
    // 'jade',
    'connect',
    'watch'
  ]);

};
