console.log('Loading event');
var aws = require('aws-sdk')
var s3 = new aws.S3();
var s3functions = require('../common/ephemera-s3functions.js');
var config = require('../common/ephemera-config.js').config()

exports.handler = function(event, context){

	// Generate a UUID for a key
	var bucketKey = s3functions.generateUUID();

	// Upload the object to s3
	s3.putObject({
		Bucket: config.bucketName,
		Key: bucketKey,
		ACL: config.s3ACL,
		Body: event.secretText,
		ContentDisposition: 'inline',
		ContentType: 'text/plain'
	}, function(err,data){
		if(err){
			context.fail("Error adding object to bucket "+config.bucketName + ' - '+JSON.stringify(err))
		}
		context.done(null, {
			key:bucketKey,
			bucketName: config.bucketName,
			bucketRegion: config.bucketRegion,
			objectURL: 'https://s3-'+config.bucketRegion+'.amazonaws.com/'+config.bucketName+'/'+bucketKey
		})	
	})
	
	
}