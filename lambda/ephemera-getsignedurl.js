console.log('Loading event');

var aws = require('aws-sdk');
var sts = new aws.STS();
var crypto = require("crypto")
  , util = require("util");

var accessKeyId = ''
var secretAccessKey = ''

// Specify the ARN of the role we're assuming
var roleArn = "arn:aws:iam::080863329876:role/LambdaS3ImageUpload";

// Name of the bucket to upload to
var bucketName = 'image-upload-smartin';

var successActionRedirect = 'http://google.com'

// ACL of the uploaded file
var s3ACL = 'public-read';

// Stolen from http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

// Stolen from https://gist.github.com/radekg/2163005

var pad = function(n) {
  if ((n+"").length == 1) {
    return "0" + n;
  }
  return ""+n;
};

var generateS3ExpiryDate = function(validityPeriody) {
  var now = new Date();
  var date = new Date( now.getTime() + (validityPeriody) );
  var ed = date.getFullYear() + "-" + pad(date.getMonth()+1) + "-" + pad(date.getDate());
  ed += "T" + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds()) + ".000Z";
  return ed;
};

var generateS3PolicyString = function( bucketName, bucketKey, contentType, expiryDate, s3ACL, successActionRedirect){
   return '{\n    "expiration": "' + expiryDate + '",\n'
        + '   "conditions": [\n'
        + '       {"bucket": "' + bucketName + '"},'
        + '       {"key": "' + bucketKey + '"},'
        + '       {"acl": "' + s3ACL + '"},'
        + '       {"success_action_redirect": "' +successActionRedirect + '"},'
        + '       {"Content-Type": "' + contentType + '"}]\n}';
};

var base64PolicyString = function(policyString){
  return new Buffer(policyString).toString('base64').replace(/\n|\r/, '');
};

var signS3Policy = function(policyBase64, secretKey){
  
  var hmac = crypto.createHmac("sha1", secretKey);
  var hash2 = hmac.update(policyBase64);
  var signature = hmac.digest(encoding="base64");
  return signature;
};

exports.handler = function(event, context) {
    console.log(JSON.stringify(event))
    console.log("Loaded handler");
     // Assume the role we're executing under again so that we can access the secret key
    sts.assumeRole({RoleArn:roleArn,RoleSessionName:"test"},function(err,data){
      if(err){
        console.log(err);
        context.fail("Error: " + JSON.stringify(err));
      }
      var ContentType = event['Content-Type'];
      console.log("loaded role " + roleArn + " successfully");

      //var accessKeyId = data.Credentials.AccessKeyId;
      //var secretAccessKey = data.Credentials.SecretAccessKey;

      var bucketKey = generateUUID();
      var s3PolicyBase64 = base64PolicyString(generateS3PolicyString( bucketName, bucketKey, ContentType,
         generateS3ExpiryDate(60*1000),s3ACL, successActionRedirect));
      var s3Signature = signS3Policy(s3PolicyBase64, secretAccessKey);
      context.done(null,{
        "key":bucketKey, 
        "AWSAccessKeyId":accessKeyId,
        "acl": s3ACL,
        "success_action_redirect": successActionRedirect,
        "policy": s3PolicyBase64,
        "signature": s3Signature,
        "Content-Type":event['Content-Type']
        }); // SUCCESS with message 
    });
}