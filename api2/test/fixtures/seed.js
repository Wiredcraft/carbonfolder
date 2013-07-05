
var mock = require('./mock.js');
var app = require('../../app.js');


mock.generate_user(function(u) {
	var obi = mock.generate_obj_id();
	u._id = obi;

	var us = new _db.User(u);
	us.save(function(err){
		console.log(us)
		console.log(obi)
	})
})

// generate({users : 3, })

// generate({})

// us1 = user -> 0 trip
// us2 = user -> 1 trip
// us3 = user -> t1 = t2 = 2 trips 
//             request = us1 - t2