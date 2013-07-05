'use strict';

var app = require('../app.js').app;

describe('Structure base test', function() {
    
    it('should have env properties', function() {
	app.should.have.property('environments');
    });

    it('should have env properties', function() {
	app.should.have.property('environments');
    });

    it('should have models property', function() {
	app.should.have.property('models');
    });

    it('should have a controller instance', function() {
	app.should.have.property('controllers');
    });
    
    it('should have db global variable', function() {
	_db.should.be.ok;
    });

    describe('Configuration files minimum required', function() {	
	it('should have development and prod environ', function() {
	    app.environments.should.have.property('production');
	    app.environments.should.have.property('development');
	});
	
	it('should have port', function() {
	    app.environments.production.should.have.property('port');
            app.environments.development.should.have.property('port');
	});
	
	it('should have mongodb declared', function() {
	    app.environments
		.production
		.should.have.property('mongo_database');
            app.environments
		.development
		.should.have.property('mongo_database');
	});
    });
    
    describe('database sucessfully connected', function() {
	it('should mongodb connection', function() {
            //app.models.db.should.be.an.instanceOf(mongoose);
	}); 
    });


});
