console.log('Loading event');

var fs = require('fs');
var aws = require('aws-sdk');
var kms = new aws.KMS({region:'us-east-1'});

var s3functions = require('../common/ephemera-s3functions.js');
var config = require('../common/ephemera-config.js').config()


// ACL of the uploaded file
var s3ACL = 'public-read';

exports.handler = function(event, context, params) {
    console.log("Loaded handler");
    
    // Check it's a valid filetype
    var acceptedFileTypes = ['image/jpeg', 'image/png', 'text/plain', 'image/gif', 'image/pjpeg']

    if(acceptedFileTypes.indexOf(event['Content-Type']) < 0){
      context.fail("Error: Invalid file type: "+ event['Content-Type'])
    }


    // Decrypt the secret key using KMS (you can't sign S3 uploads with roles :()
    var params = {
      CiphertextBlob: new Buffer(config.encryptedSecret, 'base64')
    };
    kms.decrypt(params, function(err, data) {
      if (err) context.fail("Error" + JSON.stringify(err.stack));
      else {
        secretAccessKey = data['Plaintext'].toString();

        params = {
          accessKeyId: config.accessKeyId,
          bucketName: config.bucketName,
          bucketRegion: config.bucketRegion,
          secretAccessKey: secretAccessKey,
          s3ACL: config.s3ACL,
          successActionRedirect: event['redirectTo'],
          contentType: event['Content-Type'],
          context:context
        }

        // Call the function from ephemera-s3functions that's actually doing all the work of signing for us
        s3functions.GenerateOutput(params, function(params){
          console.log("Returning values")
          context.done(null,params); // SUCCESS with message 
        });
      }
    });

}