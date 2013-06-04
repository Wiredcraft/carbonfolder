
module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-jade');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    
    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	compass : {
	    dev: {
		options: {
		    require : 'zurb-foundation',
		    sassDir: 'scss',
		    cssDir: 'app/css'
		}
	    }
	},
	jade: {
    	    html: {
    		src: ['jade/**/*.jade'],
    		dest: 'app/',
		options : {
		    client : false,
		    basePath : 'jade/',
		    locals : grunt.file.readJSON('locals.json')
		}
	    }
	},
	connect: {
	    server: {
		options: {
		    port: 9001,
		    base: 'app'
		}
	    }
	},
	watch: {
	    jade : {
    		files: ['jade/**/*.jade', 'locals.json'],
    		tasks: ['jade']
    	    },
	    scss : {
		files: ['scss/**/*.scss'],
		tasks: ['compass:dev']
	    }
	}
    });

    grunt.registerTask('default', [
	'compass:dev',
	'jade',
	'connect',
	'watch'
    ]);

};
