var ephemera = require('../ephemera-addtextsecret/ephemera-addtextsecret.js');

exports.testHandler = function(test){

	// Define our return functions to test against
	var context = {
		done: function(ignore,json){
			console.log(json)
			test.ok(/[a-z0-9\-]*/.test(json['key']), "check key");
			test.ok(/[a-z0-9\-]*/.test(json['bucketRegion']), "check bucket region");
			test.ok(/[a-z0-9\-]*/.test(json['bucketName']), "check bucket name");
			test.ok(/https:\/\/[a-z0-9\-\.\/]*/.test(json['objectURL']), "check objecturl");
    		test.done();
		},
		fail: function(error){
			console.log(error)
		}
	}
	

	// Kick off the functin we're testing
	ephemera.handler({"secretText":"Hello"},context)


    
};
