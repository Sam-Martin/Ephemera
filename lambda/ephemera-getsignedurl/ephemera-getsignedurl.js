console.log('Loading event');

var fs = require('fs');
var aws = require('aws-sdk');
var kms = new aws.KMS({region:'us-east-1'});

var s3functions = require('./ephemera-s3functions.js');




var accessKeyId = 'AKIAJYDONY5Y2FDJJDQA'
var secretAccessKey 
// var secretAccessKey = decryptedSecret

// Specify the ARN of the role we're assuming
var roleArn = "arn:aws:iam::080863329876:role/LambdaS3ImageUpload";

// Name of the bucket to upload to
var bucketName = 'image-upload-smartin';

var successActionRedirect = 'http://google.com'

// ACL of the uploaded file
var s3ACL = 'public-read';

exports.handler = function(event, context, params) {
    console.log("Loaded handler");
    
    roleArn = typeof(params) != 'undefined' ? params.roleArn : roleArn

    // Stolen from http://stackoverflow.com/questions/29372278/aws-lambda-how-to-store-secret-to-external-api
    var secretPath =  typeof(params) != 'undefined' ? params.secretPath :'./ephemera-getsignedurl/EncryptedBase64.secret';
    var encryptedSecret = fs.readFileSync(secretPath);
    console.log(encryptedSecret.toString())
    var params = {
      CiphertextBlob: new Buffer(encryptedSecret.toString(), 'base64')
    };

    kms.decrypt(params, function(err, data) {
      if (err) context.fail("Error" + JSON.stringify(err.stack));
      else {
        secretAccessKey = data['Plaintext'].toString();

        params = {
          accessKeyId: accessKeyId,
          bucketName: bucketName,
          secretAccessKey: secretAccessKey,
          s3ACL: s3ACL,
          successActionRedirect: successActionRedirect,
          contentType: event['Content-Type'],
          roleArn: roleArn,
          context:context
        }

        s3functions.GenerateOutput(params, function(params){
          context.done(null,params); // SUCCESS with message 
        });
      }
    });

}