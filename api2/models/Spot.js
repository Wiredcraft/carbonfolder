
var mongoose = require('mongoose');

var SpotSchema = new mongoose.Schema({
    title : {
	type : String,
	index: {
	    unique: true, 
	    dropDups: true
	}
    },
    updated_at : { 
    	type : Date, 
    	default : Date.now 
    },
    created_at : { 
    	type : Date, 
    	default : Date.now 
    }
});

SpotSchema.pre('save', function(next) {
    return next();
});

module.exports = function(app) {    
    return mongoose.model('Spot', SpotSchema);
};
