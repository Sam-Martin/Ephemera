var ephemera = require('../ephemera-getsignedurl/ephemera-getsignedurl.js');

exports.testHandler = function(test){

	// Define our return functions to test against
	var context = {
		done: function(ignore,json){
			console.log(json)
			
			test.equal(json['success_action_redirect'], 'http://google.com', "Check redirect");
			
			test.equal(json['Content-Type'], 'image/jpeg', "check content type");

			test.equal(json['acl'], 'public-read', "check acl");
			
			test.ok(/[a-z0-9\-]*/.test(json['key']), "check key");

			test.ok(/[a-zA-Z0-9]*/.test(json['policy']), "check policy");

			test.ok(/[a-zA-Z0-9=]*/.test(json['signature']), "check key");

    		test.done();
		},
		fail: function(error){
			console.log(error)
		}
	}
	
	// Kick off the function we're testing
	ephemera.handler({"Content-Type":"image/jpeg"},context)


    
};
